// import mongoose from "mongoose";

// const daySchema = new mongoose.Schema({
//   dayLabel: String,
//   country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
//   state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
//   destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
//   trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
//   selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
//   selectedActivity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
// });

// const fixedTourSchema = new mongoose.Schema(
//   {
//     purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser", required: true },
//     company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
//     country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
//     state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
//     destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
//     tourName: String,
//     articleNumber: String,
//     category: String,
//     pickupPoint: String,
//     dropOffPoint: String,
//     totalDays: Number,
//     totalNights: Number,
//     validFrom: { type: Date },
//     validTill: { type: Date },
//     paxPrices: {
//       1: Number, 2: Number, 3: Number, 4: Number, 5: Number, 6: Number,
//       7: Number, 8: Number, 9: Number, 10: Number, 11: Number, 12: Number,
//       13: Number, 14: Number, 15: Number, 16: Number, 17: Number, 18: Number,
//     },
//     includes: [String],
//     excludes: [String],
//     days: [daySchema],
//   },
//   { timestamps: true }
// );
// fixedTourSchema.index({ company: 1, destination: 1, tourName: 1 });
// export default mongoose.model("FixedTour", fixedTourSchema);




// import mongoose from "mongoose";

// const daySegmentSchema = new mongoose.Schema(
//   {
//     country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
//     state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
//     destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
//     trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
//     selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
//     // NEW: support multiple activities per segment
//     selectedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
//   },
//   { _id: false }
// );

// const daySchema = new mongoose.Schema(
//   {
//     dayLabel: String,     // e.g. "Day 1"
//     segments: [daySegmentSchema],
//   },
//   { _id: false }
// );

// const fixedTourSchema = new mongoose.Schema(
//   {
//     purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser", required: true },
//     company:   { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

//     country:     { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
//     state:       { type: mongoose.Schema.Types.ObjectId, ref: "State" },
//     destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },

//     tourName:     String,
//     articleNumber:String,
//     category:     String,
//     pickupPoint:  String,
//     dropOffPoint: String,

//     totalDays:   Number,
//     totalNights: Number,

//     validFrom: { type: Date },
//     validTill: { type: Date },

//     paxPrices: {
//       1: Number,  2: Number,  3: Number,  4: Number,  5: Number,  6: Number,
//       7: Number,  8: Number,  9: Number, 10: Number, 11: Number, 12: Number,
//       13: Number, 14: Number, 15: Number, 16: Number, 17: Number, 18: Number,
//     },

//     includes: [String],
//     excludes: [String],

//     // NEW: days -> segments[]
//     days: [daySchema],
//   },
//   { timestamps: true }
// );

// fixedTourSchema.index({ company: 1, destination: 1, tourName: 1 });

// export default mongoose.model("FixedTour", fixedTourSchema);


import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    mealCategory: { type: String }, // budget, premium, luxury, 3star, 4star, 5star
    mealType: { type: String },     // Breakfast, Lunch, Dinner
    mealName: { type: String },     // typable text
  },
  { _id: false }
);

const daySegmentSchema = new mongoose.Schema(
  {
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },

    // existing
    selectedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

    // NEW fields
    tripVehicleCategory: { type: String },        // Premium / Luxury / Executive
    addonTripVehicleCategory: { type: String },   // Elite / Business Class / Luxury Plus / Ultra Luxury
    hotelCategory: { type: String },              // Standard / Deluxe
    roomCategory: { type: String },               // Standard / Deluxe
    accommodation: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation" }, // ✅ NEW
    roomType: { type: String },
    meals: [mealSchema],                          // multiple meals per segment
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    dayLabel: String,
    segments: [daySegmentSchema],
  },
  { _id: false }
);

const fixedTourSchema = new mongoose.Schema(
  {
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

    validFrom: { type: Date },
    validTill: { type: Date },

    paxPrices: {
      1: Number, 2: Number, 3: Number, 4: Number, 5: Number, 6: Number,
      7: Number, 8: Number, 9: Number, 10: Number, 11: Number, 12: Number,
      13: Number, 14: Number, 15: Number, 16: Number, 17: Number, 18: Number,
    },

    includes: [String],
    excludes: [String],

    days: [daySchema],
    vendor: {
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
      vendorName: { type: String },
      vendorCode: { type: String },
    },

    commissionPercentage: { type: Number, default: 0 },

    itineraryPrices: {
      1: Number, 2: Number, 3: Number, 4: Number, 5: Number, 6: Number,
      7: Number, 8: Number, 9: Number, 10: Number, 11: Number, 12: Number,
      13: Number, 14: Number, 15: Number, 16: Number, 17: Number, 18: Number,
    },
      advancePercentage: { type: Number, default: 0 }, // ✅ NEW
    advancePrices: {                                  // ✅ NEW
      1: Number, 2: Number, 3: Number, 4: Number, 5: Number, 6: Number,
      7: Number, 8: Number, 9: Number, 10: Number, 11: Number, 12: Number,
      13: Number, 14: Number, 15: Number, 16: Number, 17: Number, 18: Number,
    },
  },
  { timestamps: true }
);

fixedTourSchema.index({ company: 1, destination: 1, tourName: 1 });

export default mongoose.model("FixedTour", fixedTourSchema);
