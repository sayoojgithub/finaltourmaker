import express from "express";
import { verifyUser } from "../middleware/auth.js";
import { loginAdmin, getSalesExecutives, registerSalesExecutive, assignTarget, getRegisteredCompaniesForAdmin, approveCompany } from "../controllers/adminController.js";


const router = express.Router();
router.post("/loginAdmin", loginAdmin);
router.get('/salesExecutives',verifyUser, getSalesExecutives);
router.post("/registerSalesExecutive", verifyUser, registerSalesExecutive);
router.post("/assignTarget/:id", verifyUser, assignTarget);
router.get("/registeredCompanies", verifyUser, getRegisteredCompaniesForAdmin);
router.patch("/approveCompany/:id", verifyUser, approveCompany);








export default router;
