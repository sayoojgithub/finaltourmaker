
import mongoose from "mongoose";


const boTripVehicleSchema = new mongoose.Schema({
  _id: { type: String, required: true },                  
  category: String,
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
   // NEW
    vehicleName: { type: String },
  percentage: Number,
  basePrice: Number,
  qty: Number,
  advancePercentage: Number,
  advanceUnit: Number,
  advanceTotal: Number,
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  tripName: String,
  date: { type: Date },
   // NEW
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: { type: String },
}, { _id: false });

const boAddonVehicleSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  category: String,
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
   // NEW
    vehicleName: { type: String },
  percentage: Number,
  basePrice: Number,
  qty: Number,
  advancePercentage: Number,
advanceUnit: Number,
advanceTotal: Number,
  addonTripId: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
  addonTripName: String,
  date: { type: Date },
   // NEW
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: { type: String },
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
  advancePercentage: Number,
advanceUnit: Number,
advanceTotal: Number,
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  tripName: String,
  date: { type: Date },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
  // NEW
    vendorName: { type: String },
}, { _id: false });

const boActivitySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
  name: String,
  price: Number,
  percentage: Number,
  itineraryUnit: Number,
  qty: Number,
  advancePercentage: Number,
advanceUnit: Number,
advanceTotal: Number,
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  tripName: String,
  date: { type: Date },
   // NEW
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: { type: String },
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
  advancePercentage: Number,
advanceUnit: Number,
advanceTotal: Number,

  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  tripName: String,
  date: { type: Date },
      // NEW
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: { type: String },
}, { _id: false });


const daySegmentSchema = new mongoose.Schema({
  country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
  state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
  selectedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

  
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
  margin: { type: Number, default: 0 },
  totalAdvance: { type: Number, default: 0 }, 
advancePerPax: { type: Number, default: 0 }, 
  seatsAvailable: {
    type: Number,
    default: 0,          
  },
  seatsBooked: {
    type: Number,
    default: 0,
  },
  confirmedClients: {
  type: [
    {
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
      clientName: { type: String, default: "" },
      pax: { type: Number, required: true },
      confirmedAt: { type: Date, required: true },
    },
  ],
  default: [],
},
  riskAmount: Number,
  includes: [String],
  excludes: [String],
  activeStatus: {
  type: Boolean,
  default: false,   // Initially inactive
},
 boCreatedStatus: {
  type: Boolean,
  default: false,   // Initially inactive
},
  days: [daySchema],
}, { timestamps: true });

groupTourSchema.index({ company: 1, destination: 1, tourName: 1 });

export default mongoose.model("GroupTour", groupTourSchema);
