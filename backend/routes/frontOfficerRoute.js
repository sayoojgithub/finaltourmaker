import express from "express";
import { verifyUser } from "../middleware/auth.js";
import { listClientsToCreate,listFrontOfficeDestinations } from "../controllers/frontOfficeController.js";
const router = express.Router();
router.get("/clients-to-create", verifyUser, listClientsToCreate);
router.get("/destinations", verifyUser, listFrontOfficeDestinations);








export default router;
