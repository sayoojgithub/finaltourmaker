import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  getSalesManagerCountries,
  getSalesManagerStates,
  getSalesManagerDestinations,
  createSalesManagerAdRequest,
  listSalesManagerAdRequests,
  getSalesManagerAdRequest,
  createSalesManagerLeadRequest,
  listSalesManagerLeadRequests,
  getSalesManagerLeadRequest,
  listToursForDestination,
  createUploadRequest,
  getUploadRequests,
  getUploadRequestById,
  createDailyTaskRequest,
  listDailyTaskRequests,
  getDailyTaskRequest,
} from "../controllers/salesManagerController.js";

const router = express.Router();
router.get("/countries", verifyUser, getSalesManagerCountries);
router.get("/states/:countryId", verifyUser, getSalesManagerStates);
router.get(
  "/destinations/:countryId/:stateId",
  verifyUser,
  getSalesManagerDestinations
);
router.post("/ad-requests", verifyUser, createSalesManagerAdRequest);
router.get("/ad-requests", verifyUser, listSalesManagerAdRequests);
router.get("/ad-requests/:id", verifyUser, getSalesManagerAdRequest);
router.post("/lead-requests", verifyUser, createSalesManagerLeadRequest);
router.get("/lead-requests", verifyUser, listSalesManagerLeadRequests);
router.get("/lead-requests/tours", verifyUser, listToursForDestination);
router.get("/lead-requests/:id", verifyUser, getSalesManagerLeadRequest);

router.post("/upload-requests", verifyUser, createUploadRequest);
router.get("/upload-requests", verifyUser, getUploadRequests);
router.get("/upload-requests/:id", verifyUser, getUploadRequestById);
router.post("/daily-task-requests", verifyUser, createDailyTaskRequest);
router.get("/daily-task-requests", verifyUser, listDailyTaskRequests);
router.get("/daily-task-requests/:id", verifyUser, getDailyTaskRequest);
export default router;
