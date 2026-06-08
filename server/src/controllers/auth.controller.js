import sanitize from "mongo-sanitize";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import { redisClient } from "../index.js";
import { User } from "../models/User.model.js";
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  forgotPasswordEmailSchema,
  resetPasswordSchema,
} from "../config/zod.js";
import sendMail from "../config/sendMail.js";
import {
  getVerifyEmailHtml,
  getOtpHtml,
  getResetPasswordHtml,
} from "../config/html.js";
import googleClient from "../config/google.js";
import {
  generateAccessToken,
  generateToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../config/generateToken.js";
import TryCatch from "../middlewares/TryCatch.js";
import {
  generateCSRFToken,
  revokeCSRFToken,
} from "../middlewares/csrfMiddleware.js";

export const registerUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);

  const validation = registerSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issues) => ({
        field: issues.path ? issues.path.join(".") : "unknown",
        message: issues.message || "Validation Error",
        code: issues.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }

    return res
      .status(400)
      .json({ message: firstErrorMessage, error: allErrors });
  }

  const { name, email, password } = validation.data;

  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(rateLimitKey))
    return res
      .status(429)
      .json({ message: "too many request, try again later" });

  const existingUser = await User.findOne({ email });

  if (existingUser)
    return res
      .status(400)
      .json({ message: "User already exisist. Please login" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const verifyKey = `verify:${verifyToken}`;

  const dataToStore = JSON.stringify({
    name,
    email,
    password: hashedPassword,
  });

  await redisClient.setEx(verifyKey, 5 * 60, dataToStore);

  const subject = "Verify your email for account creation";

  const html = getVerifyEmailHtml({ email, token: verifyToken });

  await sendMail({ email, subject, html });

  await redisClient.setEx(rateLimitKey, 60, "true");

  return res.json({
    message: "If valid email is provided, verify it in your mail ",
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { token } = req.params;

  if (!token)
    return res.status(400).json({ message: "Verification token is required" });

  const verifyKey = `verify:${token}`;

  const userDataJSON = await redisClient.get(verifyKey);

  if (!userDataJSON)
    return res.status(400).json({ message: "Verification link expired" });

  await redisClient.del(verifyKey);

  const userData = JSON.parse(userDataJSON);

  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser)
    return res
      .status(400)
      .json({ message: "User already exisist. Please login" });

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    isEmailVerified: true
  });

  return res.status(201).json({
    message: "Registered Successfully",
    user: {
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);

  const validation = loginSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issues) => ({
        field: issues.path ? issues.path.join(".") : "unknown",
        message: issues.message || "Validation Error",
        code: issues.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }

    return res
      .status(400)
      .json({ message: firstErrorMessage, error: allErrors });
  }

  const { email, password } = validation.data;

  const rateLimitKey = `login-rate-limit:${req.ip}:${req.email}`;

  if (await redisClient.get(rateLimitKey))
    return res
      .status(429)
      .json({ message: "Too many request, try again later" });

  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).json({ message: "Invalid Credentials" });

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword)
    return res.status(400).json({ message: "Invalid Credentials" });

  const otp = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  const otpKey = `otp-key:${email}`;

  await redisClient.setEx(otpKey, 5 * 60, JSON.stringify(otp));

  const subject = "OTP for verification";

  const html = getOtpHtml({ email, otp });

  await sendMail({ email, subject, html });

  await redisClient.setEx(rateLimitKey, 60, "true");

  return res.status(200).json({ message: "Login otp send to your email" });
});

export const verifyOTP = TryCatch(async (req, res) => {
  const result = verifyOTPSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues,
    });
  }

  const { email, OTP } = result.data;

  if (!email || !OTP)
    return res.status(400).json({ message: "Please provoide all details" });

  const otpKey = `otp-key:${email}`;

  const storedOtpJSON = await redisClient.get(otpKey);

  if (!storedOtpJSON) return res.status(400).json({ message: "otp expired" });

  const storedOtp = JSON.parse(storedOtpJSON);

  if (OTP !== storedOtp)
    return res.status(400).json({ message: "Invalid otp" });

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });

  const tokenData = await generateToken(user._id, res);

  return res.status(200).json({
    success: true,
    message: `Welcome ${user.name}`,
    user,
    sessionInfo: {
      sessionId: tokenData.sessionId,
      loginTime: new Date().toISOString(),
      csrfToken: tokenData.csrfToken,
    },
  });
});

export const forgotPassword = TryCatch(async (req, res) => {
  // validate proper format
  const validation = forgotPasswordEmailSchema.safeParse(req.body);

  // verify correct or not
  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issues) => ({
        field: issues.path ? issues.path.join(".") : "unknown",
        message: issues.message || "Validation Error",
        code: issues.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }

    return res
      .status(400)
      .json({ message: firstErrorMessage, error: allErrors });
  }

  // get the email
  const { email } = validation.data;

  // find user in db
  const user = await User.findOne({ email });

  // if no user found
  if (!user) {
    return res
      .status(200)
      .json({ message: "If an account exists, a reset link has been sent." });
  }

  // generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // create hashed token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // rate limiter
  const rateLimitKey = `forgot-password-rate-limit:${req.ip}:${email}`;
  if (await redisClient.get(rateLimitKey))
    return res
      .status(429)
      .json({ message: "too many request, try again later" });

  // set the token in redis
  const hashKey = `reset-password:${hashedToken}`;
  await redisClient.setEx(hashKey, 5 * 60, user._id.toString());

  // send mail
  const subject = "Reset Your Password";
  const html = getResetPasswordHtml({ email, token: resetToken });
  await sendMail({ email, subject, html });

  // set the rate limiter
  await redisClient.setEx(rateLimitKey, 60, "true");

  // final res
  return res.status(200).json({
    message: "If an account exists, a reset link has been sent.",
  });
});

export const verifyResetPassword = TryCatch(async (req, res) => {
  const { token } = req.params;

  // hash the input token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // check hashToken in userId
  const userId = await redisClient.get(`reset-password:${hashedToken}`);

  // if user not found
  if (!userId) {
    return res.status(400).json({ message: "Invalid or expired link" });
  }

  // get the user object from db
  const user = await User.findById(userId);

  // return success
  return res.status(200).json({ message: "Valid token", email: user.email });
});

export const resetPassword = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);

  const validation = resetPasswordSchema.safeParse(sanitizedBody);
  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issues) => ({
        field: issues.path ? issues.path.join(".") : "unknown",
        message: issues.message || "Validation Error",
        code: issues.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }

    return res
      .status(400)
      .json({ message: firstErrorMessage, error: allErrors });
  }

  const { email, password } = validation.data;
  const { token } = req.params;

  // Hash the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // User with the hashedToken
  const userId = await redisClient.get(`reset-password:${hashedToken}`);

  // If no userId
  if (!userId) {
    return res.status(400).json({ message: "Invalid or expired link" });
  }

  // Fetch user
  const user = await User.findById(userId);

  if (!user || user.email !== email) {
    return res.status(400).josn({ message: "Invalid or expired link" });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save new password
  user.password = hashedPassword;
  await user.save();

  // Delete token from redis
  await redisClient.del(`reset-password:${hashedToken}`);

  return res.status(200).json({ message: "Password reset successful" });
});

export const refreshToken = TryCatch(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const decode = await verifyRefreshToken(refreshToken);

  if (!decode) {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.clearCookie("csrfToken");

    return res.status(401).json({ message: "Session Expired - Please login" });
  }

  generateAccessToken(decode.id, decode.sessionId, res);

  return res.status(200).json({ message: "Token refreshed" });
});

export const logoutUser = TryCatch(async (req, res) => {
  const userId = req.user._id;

  await revokeRefreshToken(userId);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.clearCookie("csrfToken");

  await redisClient.del(`user:${userId}`);

  res.status(200).json({ message: "User logout successfully" });
});

export const refreshCSRFToken = TryCatch(async (req, res) => {
  // get the userId
  const userId = req.user._id;

  // Revoke existing CSRF token
  await revokeCSRFToken(userId);

  // Generete a new CSRF token
  const newCSRFToken = await generateCSRFToken(userId, res);

  // Return the neewly generated CSRF token
  res.status(200).json({
    message: "CSRF token refreshed successfully",
    csrfToken: newCSRFToken,
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = req.user;

  const sessionId = req.sessionId;

  const sessionData = await redisClient.get(`session:${sessionId}`);

  let sessionInfo = null;

  if (sessionData) {
    const parsedSession = JSON.parse(sessionData);
    sessionInfo = {
      sessionId,
      loginTime: parsedSession.createdAt,
      lastActivity: parsedSession.lastActivity,
    };
  }

  return res.status(200).json({ user, sessionInfo });
});

export const googleAuth = TryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "No code provided" });
  }

  // Exchange the code for tokens
  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    return res.status(400).json({
      success: false,
      message: "Invalid Google token",
    });
  }

  // Verify ID token
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const { sub: googleId, name, email, picture, email_verified } = payload;

  if (!email_verified) {
    return res.status(400).json({
      success: false,
      message: "Google email not verified",
    });
  }

  // Find existing user
  let user = await User.findOne({ email });

  // Create user if not exists
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture,
      isEmailVerified: true,
      provider: "google",
    });
  }

  // generate and set tokens for login 
  const tokenData = await generateToken(user._id, res);

  return res.status(200).json({
    success: true,
    message: `Welcome ${user.name}`,
    user,
    sessionInfo: {
      sessionId: tokenData.sessionId,
      loginTime: new Date().toISOString(),
      csrfToken: tokenData.csrfToken,
    },
  });
});
