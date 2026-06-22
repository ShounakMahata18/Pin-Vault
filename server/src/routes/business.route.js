import { Router } from "express";

import { savePin, listPins, getDomains, getSelectedDomainPins, deletePin, getDatePins } from "../controllers/business.controller.js";
import { extensionAuthMiddleware } from "../middlewares/extensionAuth.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

router.post("/pins", extensionAuthMiddleware, savePin);
router.get("/get-pins/:userId", isAuth, listPins);
router.get("/get-domains/:userId", isAuth, getDomains);
router.get("/get-domain-pins/:userId/:domain", isAuth, getSelectedDomainPins);
router.get("/get-date-pins/:userId/:date", isAuth, getDatePins)
router.delete("/delete-pin/:pinId", isAuth, deletePin);

export default router;