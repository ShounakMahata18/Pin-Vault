import jwt from "jsonwebtoken";

import { redisClient } from "../index.js";

export const extensionAuthMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = auth.split(" ")[1];

    const decoded = jwt.verify(token, process.env.EXTENSION_TOKEN_SECRET);

    const session = await redisClient.get(`extension-active-session:${token}`);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Extension auth error:", err);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};
