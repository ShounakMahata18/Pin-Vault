import jwt from "jsonwebtoken";

import { redisClient } from "../index.js";
import { User } from "../models/User.model.js";
import { isSessionActive } from "../config/generateToken.js";

export const isAuth = async (req, res, next) => {
  try {
    // Get access token from cookies
    const accessToken = req.cookies.accessToken;

    // If no access token -> user is not authenticated
    if (!accessToken)
      return res.status(401).json({
        message: "Unauthorized - No access token",
        code: "ACCESS_TOKEN_MISSING",
      });

    // Verify the access token
    const decordData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Jwt.verify does not return null
    // it either return return decorded data OR throw an error
    if (!decordData)
      return res.status(401).json({
        message: "Token Expired",
        code: "ACCESS_TOKEN_INVALID",
      });

    // Find is session is active or not
    const sessionActive = await isSessionActive(
      decordData.id,
      decordData.sessionId,
    );
    if (!sessionActive) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.clearCookie("csrfToken");

      return res.status(401).json({
        message: "Session is no longer valid. Please log in again.",
        code: "SESSION_EXPIRED",
      });
    }

    // Try to get user to redis client
    const cashedUser = await redisClient.get(`user:${decordData.id}`);

    if (cashedUser) {
      req.user = JSON.parse(cashedUser);
      req.sessionId = decordData.sessionId;
      return next();
    }

    // If user not in cache -> fetch from DB
    const user = await User.findById(decordData.id).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ message: "User user found", code: "USER_NOT_FOUND" });

    // Store user into redis (cache for 1 hr)
    await redisClient.setEx(
      `user:${user._id}`,
      1 * 60 * 60,
      JSON.stringify(user),
    );

    req.user = user;
    req.sessionId = decordData.sessionId;

    next();
  } catch (error) {
    // If token expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Unauthorized - Token expired",
        code: "ACCESS_TOKEN_EXPIRED",
      });
    }

    // If token is invalid
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
        code: "ACCESS_TOKEN_INVALID",
      });
    }

    // Universal Error
    return res
      .status(500)
      .json({ message: error.message, code: "INTERNAL_SERVER_ERROR" });
  }
};

export const authorizedAdmin = async (req, res, next) => {
  // Get the user object
  const user = req.user;

  // check if the the role is not admin
  if (user.role !== "admin") {
    return res
      .status(401)
      .json({ message: "You are not allowed - Only admin are allowed" });
  }

  next();
};
