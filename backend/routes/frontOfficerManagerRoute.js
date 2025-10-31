import express from "express";
import { verifyUser } from "../middleware/auth.js";
import { listFrontOfficersByCompany,updateFrontOfficerStatus,listPendingClientsByFO,reassignPendingClients } from "../controllers/frontOfficerManagerController.js";

const router = express.Router();
//front officer status management for controlling client flow//
router.get("/frontofficers", verifyUser, listFrontOfficersByCompany);
router.patch("/frontofficers/:id/status", verifyUser, updateFrontOfficerStatus);
//frontofficer pending clients for creation management//
router.get("/fo-clients", verifyUser, listPendingClientsByFO);
router.post("/fo-clients/reassign", verifyUser, reassignPendingClients);

export default router;
