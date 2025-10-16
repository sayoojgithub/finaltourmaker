import express from "express";
import { verifyUser } from "../middleware/auth.js";
import { registerCompany,getRegisteredCompanies, getSalesProfile } from "../controllers/salesExecutiveController.js";
const router = express.Router();
router.get("/profile", verifyUser, getSalesProfile);
router.post("/registerCompany", verifyUser, registerCompany);
router.get("/companies", verifyUser, getRegisteredCompanies);

export default router;
