import jwt from "jsonwebtoken";
import crypto from "crypto";

import { redisClient } from "../index.js";
import {
  generateCSRFToken,
  revokeCSRFToken,
} from "../middlewares/csrfMiddleware.js";

export const generateToken = async (id, res) => {
  // create the session
  const sessionId = crypto.randomBytes(16).toString("hex");

  // Generate access token
  const accessToken = jwt.sign(
    { id, sessionId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { id, sessionId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );

  // refresh token key
  const refreshTokenKey = `refresh-token:${id}`;

  // active token key
  const activeSessionKey = `active_session:${id}`;

  // active data key
  const sessionDatakey = `session:${sessionId}`;

  // Check for existing session from redis
  const existingSession = await redisClient.get(activeSessionKey);
  if (existingSession) {
    await redisClient.del(`session:${existingSession}`);
    await redisClient.del(refreshTokenKey);
  }

  // Create session, active data to be stored
  const sessionData = {
    userId: id,
    sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };

  // Set refresh token in redis
  await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

  // Set sessionId in redis
  await redisClient.setEx(activeSessionKey, 7 * 24 * 60 * 60, sessionId);

  // Set session data in redis
  await redisClient.setEx(
    sessionDatakey,
    7 * 24 * 60 * 60,
    JSON.stringify(sessionData),
  );

  // Pass both access tokan and refresh token in cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Generate CSRF token
  const csrfToken = await generateCSRFToken(id, res);

  // return both access token and refresh token
  return { accessToken, refreshToken, csrfToken, sessionId };
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    // Verify the refresh token
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Get the refresh token from redis
    const storedToken = await redisClient.get(`refresh-token:${decode.id}`);

    // Verify both stored token in redis is same as refresh token
    if (storedToken !== refreshToken) {
      return null;
    }

    // Verify activeSessionId with the passed sessionId
    const activeSessionId = await redisClient.get(
      `active_session:${decode.id}`,
    );
    if (activeSessionId !== decode.sessionId) {
      return null;
    }

    // Verify session data
    const sessionData = await redisClient.get(`session:${decode.sessionId}`);
    if (!sessionData) {
      return null;
    }

    // Update the last activity in session
    const parsedSessionData = JSON.parse(sessionData);
    parsedSessionData.lastActivity = new Date().toISOString();

    // Set in redis
    await redisClient.setEx(
      `session:${decode.sessionId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(parsedSessionData),
    );

    return decode;
  } catch (error) {
    return null;
  }
};

export const generateAccessToken = (id, sessionId, res) => {
  // generate access token when called
  const accessToken = jwt.sign(
    { id, sessionId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

  // pass it in thr cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });
};

export const revokeRefreshToken = async (userId) => {
  // Find active session id
  const activeSessionId = await redisClient.get(`active_session:${userId}`);

  // Delete from redis
  await redisClient.del(`refresh-token:${userId}`);

  // Delete the active session for a user id
  await redisClient.del(`active_session:${userId}`);

  // Delete the active session id
  if (activeSessionId) {
    await redisClient.del(`session:${activeSessionId}`);
  }

  // Delete CSRF token from redis
  await revokeCSRFToken(userId);
};

export const isSessionActive = async (userId, sessionId) => {
  const activeSessionId = await redisClient.get(`active_session:${userId}`);
  return activeSessionId === sessionId;
};
