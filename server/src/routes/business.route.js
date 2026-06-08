import { Router } from "express";

import { savePin, listPins, getDomains, getDomainPins, deletePin } from "../controllers/business.controller.js";
import { extensionAuthMiddleware } from "../middlewares/extensionAuth.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

router.post("/pins", extensionAuthMiddleware, savePin);
router.get("/get-pins/:userId", isAuth, listPins);
router.get("/get-domains/:userId", isAuth, getDomains);
router.get("/get-domains/:userId/:domain", isAuth, getDomainPins);
router.delete("/delete-pin/:pinId", isAuth, deletePin);

export default router;