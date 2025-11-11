// // models/GroupTour.js
// import mongoose from "mongoose";

// const daySchema = new mongoose.Schema({
//   dayLabel: String,
//   date: { type: Date },
//   country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
//   state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
//   destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
//   trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
//   selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
//   selectedActivity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
// });

// const groupTourSchema = new mongoose.Schema(
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
//     startDate: { type: Date },
//     netCost: Number,
//     pricePerPax: Number,
//     totalPax: Number,
//     riskAmount: Number,
//     includes: [String],
//     excludes: [String],
//     days: [daySchema],
//   },
//   { timestamps: true }
// );
// groupTourSchema.index({ company: 1, destination: 1, tourName: 1 });
// export default mongoose.model("GroupTour", groupTourSchema);
// models/GroupTour.js




// import mongoose from "mongoose";

// const daySegmentSchema = new mongoose.Schema({
//   country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
//   state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
//   destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
//   trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
//   selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
//   selectedActivity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
// }, { _id: false });

// const daySchema = new mongoose.Schema({
//   dayLabel: String,
//   date: { type: Date },
//   // NEW: multiple segments in a single day
//   segments: [daySegmentSchema],
// });

// const groupTourSchema = new mongoose.Schema(
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
//     startDate: { type: Date },
//     netCost: Number,
//     pricePerPax: Number,
//     totalPax: Number,
//     riskAmount: Number,
//     includes: [String],
//     excludes: [String],
//     days: [daySchema],
//   },
//   { timestamps: true }
// );

// groupTourSchema.index({ company: 1, destination: 1, tourName: 1 });

// export default mongoose.model("GroupTour", groupTourSchema);

import mongoose from "mongoose";

const daySegmentSchema = new mongoose.Schema(
  {
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    selectedAddon: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnTrip" },
    // CHANGED: support multiple activities
    selectedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
  },
  { _id: false }
);

const daySchema = new mongoose.Schema({
  dayLabel: String,
  date: { type: Date },
  segments: [daySegmentSchema], // multiple segments per day
});

const groupTourSchema = new mongoose.Schema(
  {
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

    // Top-level meta (kept as-is)
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
    riskAmount: Number,
    includes: [String],
    excludes: [String],

    days: [daySchema],
  },
  { timestamps: true }
);

groupTourSchema.index({ company: 1, destination: 1, tourName: 1 });

export default mongoose.model("GroupTour", groupTourSchema);
