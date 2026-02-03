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
  updateExecutiveInterestedStatus,
  getClientGroupTours,
  getExecutiveGroupTourPreview,
  getExecutiveGroupTourPointDiscountOptions,
  getClientFixedTours,
  getExecutiveFixedTourPreview,
  getFixedTourPointDiscountOptions,
  downloadGroupTourReferralItinerary,
  downloadGroupTourConfirmItinerary,
  downloadFixedTourReferralItinerary,
  downloadFixedTourConfirmItinerary,
  getCountries,
  getStatesByCountry,
  getDestinationsByCountryAndState,
  getTripsByLocation,
  getTripDetails,
  getTripVehiclesForDate,
  getAddonTripVehiclesForDate,
  getTripFoodsForDate,
  getActivitiesPricingForDate,
  getAccommodationsPricingForDate,
  getCustomTourPointDiscountOptions,
  downloadCustomTourReferralItinerary,
  downloadCustomTourConfirmItinerary,
  getDestinationsForClientCompany,
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
  "/not-reachable-status-updation",    
  verifyUser,
  updateExecutiveNotReachableStatus
);
router.post(
  "/not-interested-status-updation",
  verifyUser,
  updateExecutiveNotInterestedStatus
);
router.post(
  "/interested-status-updation",
  verifyUser,
  updateExecutiveInterestedStatus
);

router.get("/client-group-tours", verifyUser, getClientGroupTours);
router.get(
  "/group-tour-preview",
  verifyUser,
  getExecutiveGroupTourPreview
);
router.get(
  "/group-tour-point-discount-options",
  verifyUser,
  getExecutiveGroupTourPointDiscountOptions
);

router.get("/client-fixed-tours", verifyUser, getClientFixedTours);
router.get(
  "/fixed-tour-preview",
  verifyUser,
  getExecutiveFixedTourPreview
);
router.get(
  "/fixed-tour-point-discount-options",
  verifyUser,
  getFixedTourPointDiscountOptions
);
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
router.get("/countries", verifyUser, getCountries);
router.get("/states/:countryId", verifyUser, getStatesByCountry);
router.get(
  "/destinationsByCountryAndState/:countryId/:stateId",
  verifyUser,
  getDestinationsByCountryAndState
);
router.get(
  "/tripsByLocation/:countryId/:stateId/:destinationId",
  verifyUser,
  getTripsByLocation
);
router.get("/tripDetails/:tripId", verifyUser, getTripDetails);

// pricing
router.get("/tripVehicles/:tripId", verifyUser, getTripVehiclesForDate);
router.get("/addonTripVehicles/:addonTripId", verifyUser, getAddonTripVehiclesForDate);
router.get("/tripFoods/:tripId", verifyUser, getTripFoodsForDate);
router.get("/activitiesPricing", verifyUser, getActivitiesPricingForDate);
router.get("/accommodationsPricing", verifyUser, getAccommodationsPricingForDate);
router.get(
  "/custom-tour-point-discount-options",
  verifyUser, // or verifyExecutive (use same middleware you use for other executive endpoints)
  getCustomTourPointDiscountOptions
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
router.get(
  "/client-destinations/:clientId",
  verifyUser,
  getDestinationsForClientCompany
);


export default router;
