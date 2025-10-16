import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  createCountry,
  getCountries,
  createState,
  getStatesByCountry,
  createDestination,
  updateDestinationStatus,
  getDestinations,
  getDestinationsByCountryAndState,
  createVendor,
  updateVendor,
  getVendorsPaginated,
  updateVendorStatus,
  getVendorsOfVehiclesByLocation,  
  createVehicle,
  updateVehicle,
  getVehiclesByPurchaser,
  getVendorsOfHotelsByLocation,
  createAccommodation,
  getAccommodations,
  updateAccommodation,
  getVehiclesForTrip,
  createTrip,
  getTrips,
  updateTrip,
  updateTripStatus,
  getVendorsOfActivitiesByLocation,
  getTripsByLocation,
  createActivity,
  getActivities,
  updateActivity,
  updateActivityStatus,
  createAddOnTrip,
  getAddOnTrips,
  updateAddOnTrip,
  updateAddOnTripStatus,
  getTripDetails,
  createGroupTour,
  getGroupTours,
  updateGroupTour,
  createFixedTour,
  getFixedTours,
  updateFixedTour,
  updateVehicleStatus,
  getVendorsOfFoodsByLocation,
  createFood,
  getFoodTrips,
  getFoodById,
  updateFood,
  updateFoodStatus
} from "../controllers/purchaserController.js";

const router = express.Router();
router.post("/country", verifyUser, createCountry);
router.get("/countries", verifyUser, getCountries);
router.post("/state", verifyUser, createState);
router.get("/states/:countryId", verifyUser, getStatesByCountry);
router.post("/destination", verifyUser, createDestination);
router.get("/destinations", verifyUser, getDestinations);
router.patch("/updateDestinationStatus/:id/status",verifyUser, updateDestinationStatus);
router.get("/destinationsByCountryAndState/:countryId/:stateId",verifyUser,getDestinationsByCountryAndState);
router.post("/vendor", verifyUser, createVendor);
router.put("/vendor/:id", verifyUser, updateVendor);
router.get("/vendors", verifyUser, getVendorsPaginated);
router.patch("/updateVendorStatus/:id/status",verifyUser, updateVendorStatus);
router.get("/vendorsOfVehicles/:countryId/:stateId/:destinationId",verifyUser,getVendorsOfVehiclesByLocation);
router.post("/createVehicles", verifyUser, createVehicle);
router.put("/updateVehicle/:vehicleId", verifyUser, updateVehicle);
router.get('/vehicles', verifyUser, getVehiclesByPurchaser);
router.patch("/updateVehicleStatus/:id/status",verifyUser, updateVehicleStatus);
router.get("/vendorsOfHotels/:countryId/:stateId/:destinationId",verifyUser,getVendorsOfHotelsByLocation);
router.post("/createAccommodation", verifyUser, createAccommodation);
router.get('/accommodations', verifyUser, getAccommodations);
router.put("/updateAccommodation/:id", verifyUser, updateAccommodation);
router.get("/vehiclesForTrip/:country/:state/:destination/:vendor",verifyUser,getVehiclesForTrip);
router.post("/createTrip", verifyUser, createTrip);
router.get("/trips", verifyUser, getTrips);
router.put("/updateTrip/:id", verifyUser, updateTrip);
router.patch("/updateTripStatus/:id/status",verifyUser, updateTripStatus);
router.get("/vendorsOfActivities/:countryId/:stateId/:destinationId",verifyUser,getVendorsOfActivitiesByLocation);
router.get("/tripsByLocation/:countryId/:stateId/:destinationId", verifyUser, getTripsByLocation);
router.post("/createActivity", verifyUser, createActivity);
router.get("/activities", verifyUser, getActivities);
router.put('/updateActivity/:id', verifyUser, updateActivity);
router.patch("/updateActivityStatus/:id/status",verifyUser, updateActivityStatus);
router.post("/createAddOnTrip", verifyUser, createAddOnTrip);
router.get("/addontrips", verifyUser, getAddOnTrips);
router.put("/updateAddOnTrip/:id", verifyUser, updateAddOnTrip);
router.patch("/updateAddOnTripStatus/:id/status",verifyUser, updateAddOnTripStatus);
router.get("/tripDetails/:tripId", verifyUser, getTripDetails);
router.post("/createGroupTour", verifyUser, createGroupTour);
router.get("/groupTours", verifyUser, getGroupTours);
router.put("/updateGroupTour/:id", verifyUser, updateGroupTour);
router.post("/createFixedTour", verifyUser, createFixedTour);
router.get("/fixedTours", verifyUser, getFixedTours);
router.put("/updateFixedTour/:id", verifyUser, updateFixedTour);
router.get("/vendorsOfFoods/:countryId/:stateId/:destinationId",verifyUser,getVendorsOfFoodsByLocation);
router.post("/createFood", verifyUser, createFood);
router.get("/food-trips", verifyUser, getFoodTrips);
router.get("/food/:id", verifyUser, getFoodById);
router.put("/food/:id", verifyUser, updateFood);
router.patch("/updateTripFoodStatus/:id/status",verifyUser, updateFoodStatus);

export default router;
