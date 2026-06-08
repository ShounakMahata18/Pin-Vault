import { Router } from "express";

import {
  registerUser,
  verifyUser,
  loginUser,
  verifyOTP,
  forgotPassword,
  verifyResetPassword,
  resetPassword,
  refreshToken,
  logoutUser,
  refreshCSRFToken,
  googleAuth,
  myProfile,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../middlewares/csrfMiddleware.js";

const router = Router();

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", isAuth, verifyCSRFToken, logoutUser);

router.post("/verify-email/:token", verifyUser);
router.post("/verify-otp", verifyOTP);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token/:token", verifyResetPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/refresh", refreshToken);
router.post("/refresh-csrf", isAuth, refreshCSRFToken);

router.post("/google", googleAuth);

router.get("/me", isAuth, myProfile);

export default router;
