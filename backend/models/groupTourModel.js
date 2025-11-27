
import mongoose from "mongoose";

// --- BO subdocs ---
const boTripVehicleSchema = new mongoose.Schema({
  _id: { type: String, required: true },                  // front-end uid()
  category: String,
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  percentage: Number,
  basePrice: Number,
  qty: Number,
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  tripName: String,
  date: { type: Date },
}, { _id: false });

const boAddonVehicleSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  category: String,
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  percentage: Number,
  basePrice: Number,
  qty: Number,
  addonTripId: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
  addonTripName: String,
  date: { type: Date },
}, { _id: false });

const boFoodSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  mealCategory: String,
  mealType: String,
  foodName: String,
  price: Number,
  percent: Number,
  itineraryUnit: Number,
  qty: Number,
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  tripName: String,
  date: { type: Date },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
}, { _id: false });

const boActivitySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
  name: String,
  price: Number,
  percentage: Number,
  itineraryUnit: Number,
  qty: Number,
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  tripName: String,
  date: { type: Date },
}, { _id: false });

const boAccommodationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  accommodationId: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation" },
  propertyName: String,
  hotelCategory: String,
  roomCategory: String,
  roomTypeCode: String,
  commission: Number,
  bo: Number,
  itinerary: Number,
  qty: Number,
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  tripName: String,
  date: { type: Date },
}, { _id: false });

// --- existing segment + NEW BO arrays ---
const daySegmentSchema = new mongoose.Schema({
  country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
  state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
  selectedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

  // NEW: persisted BO lines per segment
  boTripVehicles: [boTripVehicleSchema],
  boAddonVehicles: [boAddonVehicleSchema],
  boFoods: [boFoodSchema],
  boActivities: [boActivitySchema],
  boAccommodations: [boAccommodationSchema],
}, { _id: false });

const daySchema = new mongoose.Schema({
  dayLabel: String,
  date: { type: Date },
  segments: [daySegmentSchema],
});

const groupTourSchema = new mongoose.Schema({
  purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

  country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
  state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },

  tourName: String,
  articleNumber: String,
  category: String,
  pickupPoint: String,
  dropOffPoint: String,
  totalDays: Number,
  totalNights: Number,
  startDate: { type: Date },
  netCost: Number,
  pricePerPax: Number,
  totalPax: Number,
  seatsAvailable: {
    type: Number,
    default: 0,          
  },
  seatsBooked: {
    type: Number,
    default: 0,
  },
  riskAmount: Number,
  includes: [String],
  excludes: [String],

  days: [daySchema],
}, { timestamps: true });

groupTourSchema.index({ company: 1, destination: 1, tourName: 1 });

export default mongoose.model("GroupTour", groupTourSchema);
