import express from "express";
import { verifyUser } from "../middleware/auth.js";
import { listEntryDestinations,listEntryCampaigns,createClientByEntry,listClientsByEntry, downloadClientsReport } from "../controllers/entryStaffController.js";

const router = express.Router();
router.get("/destinations", verifyUser, listEntryDestinations);
router.get("/campaigns", verifyUser, listEntryCampaigns); // ?destinationId=...
router.post("/clients", verifyUser, createClientByEntry);
router.get("/clients", verifyUser, listClientsByEntry);
router.post("/download-report", verifyUser, downloadClientsReport);








export default router;
