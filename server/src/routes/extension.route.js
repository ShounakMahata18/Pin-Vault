import { Router } from "express";

import { sendCode, verifyCode, logout } from "../controllers/extension.controller.js";

const router = Router();

router.post("/send-code", sendCode);
router.post("/verify-code", verifyCode);
router.get("/logout", logout);

export default router;