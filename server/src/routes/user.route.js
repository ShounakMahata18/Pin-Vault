import { Router } from "express";

import { adminController } from "../controllers/user.controller.js";
import { authorizedAdmin, isAuth } from "../middlewares/isAuth.js";

const router = Router();

router.post("/admin", isAuth, authorizedAdmin, adminController);

export default router;