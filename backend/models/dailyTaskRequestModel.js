// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const dailyTaskRequestSchema = new Schema(
//   {
//     // Who submitted
//     salesManager: {
//       type: Schema.Types.ObjectId,
//       ref: "SalesManager",
//     },
//     company: {
//       type: Schema.Types.ObjectId,
//       ref: "Company",
//     },

//     // Selection chain
//     country: {
//       type: Schema.Types.ObjectId,
//       ref: "Country",
//     },
//     state: {
//       type: Schema.Types.ObjectId,
//       ref: "State",
//     },
//     destination: {
//       type: Schema.Types.ObjectId,
//       ref: "Destination",
//     },

//     // Work details
//     task: {
//       type: String,
//     },

//     // MULTI-DATES: user-selected target dates
//     dates: {
//       type: [Date],
//       validate: {
//         validator: (v) => Array.isArray(v) && v.length > 0,
//         message: "At least one target date is required",
//       },
//     },

//     quantity: {
//       type: Number,
//       min: 1,
//     },
//     details: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     // Server-side request timestamp captured at submit
//     requestedAt: {
//       type: Date,
//       default: Date.now,
//       immutable: true,
//     },
//     requestedDate: {
//       // "YYYY-MM-DD"
//       type: String,
//       required: true,
//       immutable: true,
//     },
//     requestedTime: {
//       // "HH:mm:ss"
//       type: String,
//       required: true,
//       immutable: true,
//     },

//     // Workflow
//     status: {
//       type: String,
//       enum: ["processing", "approved", "rejected"],
//       default: "processing",
//     },
//     assignedDigitalMarketer: {
//       type: Schema.Types.ObjectId,
//       ref: "DigitalMarketer",
//       default: null,
//     },
//     decisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
//     decidedAt: { type: Date, default: null },

//     // Optional overrides (do NOT overwrite originals)
//     approvedDates: { type: [Date], default: [] },   // MM-chosen subset/override of dates
//     approvedQuantity: { type: Number, min: 1, default: null },

//     // Rejection
//     rejectionReason: { type: String, trim: true, default: "" },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("DailyTaskRequest", dailyTaskRequestSchema);
// models/DailyTaskRequest.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const dailyTaskRequestSchema = new Schema(
  {
    // Who submitted
    salesManager: {
      type: Schema.Types.ObjectId,
      ref: "SalesManager",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // Selection chain
    country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    state:   { type: Schema.Types.ObjectId, ref: "State", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },

    // Work details
    task: { type: String, required: true },

    // MULTI-DATES: user-selected target dates
    dates: {
      type: [Date],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one target date is required",
      },
      required: true,
    },

    quantity: { type: Number, min: 1, required: true },
    details: { type: String, default: "", trim: true },

    // Server-side request timestamp captured at submit
    requestedAt:   { type: Date, default: Date.now, immutable: true },
    requestedDate: { type: String, required: true, immutable: true }, // "YYYY-MM-DD"
    requestedTime: { type: String, required: true, immutable: true }, // "HH:mm:ss"

    // Workflow
    status: { type: String, enum: ["processing", "approved", "rejected"], default: "processing" },
    assignedDigitalMarketer: { type: Schema.Types.ObjectId, ref: "DigitalMarketer", default: null },
    assignedCreativeStaff:   { type: Schema.Types.ObjectId, ref: "CreativeStaff",   default: null }, // NEW
    decisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
    decidedAt:  { type: Date, default: null },

    // Optional overrides (do NOT overwrite originals)
    approvedDates:    { type: [Date], default: [] },     // MM-chosen subset/override of dates
    approvedQuantity: { type: Number, min: 1, default: null },

    // NEW meta/messages
    campaignName:             { type: String, trim: true, default: "" }, // NEW
    messageForDigitalMarketer:{ type: String, trim: true, default: "" }, // NEW
    messageForCreativeStaff:  { type: String, trim: true, default: "" }, // NEW

    // Rejection
    rejectionReason: { type: String, trim: true, default: "" },
    updationReason:  { type: String, trim: true, default: "" },          // NEW
  },
  { timestamps: true }
);

export default mongoose.model("DailyTaskRequest", dailyTaskRequestSchema);
