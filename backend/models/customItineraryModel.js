import mongoose from "mongoose";

/* ---------------- common small schemas ---------------- */
const DateTimeSchema = new mongoose.Schema(
  {
    nextDateRaw: { type: String }, // "YYYY-MM-DD"
    nextTimeRaw: { type: String }, // "HH:mm"
  },
  { _id: false }
);

/* ---------------- line items ---------------- */

// Trip Vehicle / Addon Vehicle line
const VehicleLineSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // Premium/Luxury/etc OR your vehicle category
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },

    basePrice: { type: Number, default: 0 },     // BO base price slab
    percentage: { type: Number, default: 0 },    // vehicle % commission
    itineraryUnit: { type: Number, default: 0 }, // inflated unit (what you show)
    qty: { type: Number, default: 0 },
    total: { type: Number, default: 0 },         // itineraryUnit * qty

    // optional snapshot fields for stability
    vehicleName: { type: String, default: "" },
  },
  { _id: false }
);

// Food line
const FoodLineSchema = new mongoose.Schema(
  {
    mealCategory: { type: String, default: "" },
    mealType: { type: String, default: "" },
    foodName: { type: String, default: "" },

    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },

    price: { type: Number, default: 0 },         // BO base price
    percent: { type: Number, default: 0 },
    itineraryUnit: { type: Number, default: 0 },
    qty: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // optional snapshot
    vendorName: { type: String, default: "" },
  },
  { _id: false }
);

// Activity line
const ActivityLineSchema = new mongoose.Schema(
  {
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },

    activityName: { type: String, default: "" }, // snapshot
    price: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    itineraryUnit: { type: Number, default: 0 },
    qty: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

// Accommodation line
const AccommodationLineSchema = new mongoose.Schema(
  {
    accommodationId: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },

    propertyName: { type: String, default: "" }, // snapshot
    hotelCategory: { type: String, default: "" },
    roomCategory: { type: String, default: "" },

    roomTypeCode: { type: String, default: "" }, // 2BEDEP, etc
    bo: { type: Number, default: 0 },
    itinerary: { type: Number, default: 0 },     // itinerary unit (what you show)
    qty: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
  },
  { _id: false }
);

/* ---------------- segment/day schema ---------------- */
const SegmentSchema = new mongoose.Schema(
  {
    // location selection
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },

    // core trip + addon trip
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },

    // selected activity ids (just selection)
    selectedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

    // priced + counted lines
    tripVehicles: { type: [VehicleLineSchema], default: [] },
    addonVehicles: { type: [VehicleLineSchema], default: [] },
    foods: { type: [FoodLineSchema], default: [] },
    activities: { type: [ActivityLineSchema], default: [] },
    accommodations: { type: [AccommodationLineSchema], default: [] },

    // totals
    segmentItineraryTotal: { type: Number, default: 0 }, // sum of all totals
  },
  { _id: false }
);

const DaySchema = new mongoose.Schema(
  {
    dayLabel: { type: String, default: "" }, // "Day 1"
    date: { type: Date },                    // actual date
    segments: { type: [SegmentSchema], default: [] },

    dayItineraryTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

/* ---------------- main schema ---------------- */
const CustomItinerarySchema = new mongoose.Schema(
  {
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    // who created
    executiveId: { type: mongoose.Schema.Types.ObjectId, ref: "Executive", default: null },

    // versioning / status
    status: {
      type: String,
      enum: ["Draft", "ReferralGenerated", "ConfirmedGenerated", "Final"],
      default: "Draft",
      index: true,
    },

    // schedule info (optional)
    schedule: { type: DateTimeSchema, default: {} },

    // itinerary core
    days: { type: [DaySchema], default: [] },

    // totals
    grandItineraryTotal: { type: Number, default: 0 },

    // snapshots (optional but useful)
    snapshot: {
      clientName: { type: String, default: "" },
      clientCode: { type: String, default: "" }, // client.clientId
      pax: { type: Number, default: 0 },
      startDate: { type: Date },
      numberOfDays: { type: Number, default: 0 },
      primaryDestinationLabel: { type: String, default: "" },
    },

    // keep pdf info if you want
    referralPdfUrl: { type: String, default: "" },
    confirmPdfUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

/* ✅ indexes */
CustomItinerarySchema.index({ client: 1, createdAt: -1 });
CustomItinerarySchema.index({ company: 1, status: 1, createdAt: -1 });

export default mongoose.model("CustomItinerary", CustomItinerarySchema);
