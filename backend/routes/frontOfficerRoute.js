import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  listClientsToCreate,
  listFrontOfficeDestinations,
  createClient,
  searchCreatedClients,
  getClientById,
  updateClient,
  getTodayTaken,
} from "../controllers/frontOfficeController.js";
const router = express.Router();
router.get("/clients-to-create", verifyUser, listClientsToCreate);
router.get("/destinations", verifyUser, listFrontOfficeDestinations);
router.post("/create-client",verifyUser, createClient);
router.get("/search-created", verifyUser, searchCreatedClients);
router.get("/client/:id", verifyUser, getClientById);
router.put("/client/:id", verifyUser, updateClient);
router.get("/report/todaytaken", verifyUser, getTodayTaken);

export default router;
