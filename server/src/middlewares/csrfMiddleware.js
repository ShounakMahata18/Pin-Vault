// import necessary library
import crypto from "crypto";

// import necessary files
import { redisClient } from "../index.js";

export const generateCSRFToken = async (userId, res) => {
  // Generate hexadecimal csrf token
  const csrfToken = crypto.randomBytes(32).toString("hex");

  // csrf key for redis to store for verification
  const csrfKey = `csrf:${userId}`;

  // store in cookie for 1 hr
  await redisClient.setEx(csrfKey, 1 * 60 * 60, csrfToken);

  // set into cookie csrf token
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 1 * 60 * 60 * 1000,
  });

  // return csrf token
  return csrfToken;
};

export const verifyCSRFToken = async (req, res, next) => {
  try {
    // For GET method
    if (req.method === "GET") return next();

    // Get the userId
    const userId = req.user?._id;

    // If no user found
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    // Find the clientToken from headers
    const clientToken =
      req.headers["x-csrf-token"] ||
      req.headers["x-xsrf-token"] ||
      req.headers["csrf-token"];

    // If no client Token found
    if (!clientToken)
      return res.status(403).json({
        message: "CSRF token missing. Please refresh the page.",
        code: "CSRF_TOKEN_MISSING",
      });

    // CSRF key
    const csrfKey = `csrf:${userId}`;

    // Find CSRF key in redis
    const storedToken = await redisClient.get(csrfKey);

    // if no token in redis
    if (!storedToken)
      return res.status(403).json({
        message: "CSRF token expired. Please try again.",
        code: "CSRF_TOKEN_EXPIRED",
      });

    // if clientToken does not match with the redis stored token
    if (clientToken !== storedToken)
      return res.status(403).json({
        message: "Invalid CSRF token. Please refresh the page.",
        code: "CSRF_TOKEN_INVALID",
      });

    // continue to the next middleware
    next();
  } catch (error) {
    console.log("CSRF verification error:", error);
    res.status(500).json({
      message: "CSRF verification failed",
      code: "CSRF_VERIFICATION_ERROR",
    });
  }
};

export const revokeCSRFToken = async (userId) => {
  // CSRF key
  const csrfKey = `csrf:${userId}`;

  // Delete CSRF token from redis
  await redisClient.del(csrfKey);
};
