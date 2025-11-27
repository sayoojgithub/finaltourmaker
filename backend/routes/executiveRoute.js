import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  getExecutiveClientCategories,
  listExecutiveClients,
  getExecutiveClientById,
  updateExecutiveClient,
  listExecutiveDestinations,
  updateExecutiveNotAnsweredStatus,
  updateExecutiveNotReachableStatus,
  updateExecutiveNotInterestedStatus,
  getClientGroupTours,
  getClientFixedTours,
  downloadGroupTourReferralItinerary,
  downloadGroupTourConfirmItinerary,
  downloadFixedTourReferralItinerary,
  downloadFixedTourConfirmItinerary,
  downloadCustomTourReferralItinerary,
  downloadCustomTourConfirmItinerary
} from "../controllers/executiveController.js";

const router = express.Router();

router.get("/client-categories", verifyUser, getExecutiveClientCategories);
router.get("/clients", verifyUser, listExecutiveClients);

router.get("/clients/:id", verifyUser, getExecutiveClientById);

// 🔹 NEW: update a client (only allowed fields)
router.put("/clients/:id", verifyUser, updateExecutiveClient);
router.get("/destinations", verifyUser, listExecutiveDestinations);
router.post(
  "/not-answered-status-updation",
  verifyUser,
  updateExecutiveNotAnsweredStatus
);
router.post(
  "/not-reachable-status-updation",    // 👈 NEW
  verifyUser,
  updateExecutiveNotReachableStatus
);
router.post(
  "/not-interested-status-updation",
  verifyUser,
  updateExecutiveNotInterestedStatus
);

router.get("/client-group-tours", verifyUser, getClientGroupTours);


router.get("/client-fixed-tours", verifyUser, getClientFixedTours);
router.post(
  "/group-tour-referral-itinerary",
  verifyUser,
  downloadGroupTourReferralItinerary
);

router.post(
  "/group-tour-confirm-itinerary",
  verifyUser,
  downloadGroupTourConfirmItinerary
);

router.post(
  "/fixed-tour-referral-itinerary",
  verifyUser,
  downloadFixedTourReferralItinerary
);

router.post(
  "/fixed-tour-confirm-itinerary",
  verifyUser,
  downloadFixedTourConfirmItinerary
);
router.post(
  "/custom-tour-referral-itinerary",
  verifyUser,
  downloadCustomTourReferralItinerary
);

router.post(
  "/custom-tour-confirm-itinerary",
  verifyUser,
  downloadCustomTourConfirmItinerary
);


export default router;
