// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const uploadRequestSchema = new Schema(
//   {
//     // Who submitted
//     salesManager: {
//       type: Schema.Types.ObjectId,
//       ref: "SalesManager",
//       required: true,
//     },
//     company: {
//       type: Schema.Types.ObjectId,
//       ref: "Company",
//       required: true,
//     },

//     // Work details
//     category: {
//       type: String,
//       required: true,
//     },
//     filename: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//      publishingDate: {
//       type: Date,
//       default: null, 
//     },

//     // Server-side request timestamp captured at submit
//     requestedAt: {
//       type: Date,
//       default: Date.now,
//       immutable: true,
//     },
//     requestedDate: {
//       type: String, // YYYY-MM-DD
//       required: true,
//       immutable: true,
//     },
//     requestedTime: {
//       type: String, // HH:mm:ss
//       required: true,
//       immutable: true,
//     },

//     // Workflow
//     status: {
//       type: String,
//       enum: ["processing", "approved", "rejected"],
//       default: "processing",
//     },
//         assignedDigitalMarketer: { type: Schema.Types.ObjectId, ref: "DigitalMarketer", default: null },
//     decisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
//     decidedAt: { type: Date, default: null },

//     // Optional override (DO NOT overwrite the original publishingDate)
//     approvedPublishingDate: { type: Date, default: null },

//     // Rejection
//     rejectionReason: { type: String, trim: true, default: "" },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("UploadRequest", uploadRequestSchema);
import mongoose from "mongoose";

const { Schema } = mongoose;
const resheduledItemSchema = new Schema(
  {
    date: { type: Date, required: true },
    reason: { type: String, trim: true, required: true },
  },
  { _id: false }
);
const uploadRequestSchema = new Schema(
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

    // Work details
    category: { type: String, required: true },
    filename: { type: String, required: true, trim: true },
    publishingDate: { type: Date, default: null },

    // Server-side request timestamp captured at submit
    requestedAt: { type: Date, default: Date.now, immutable: true },
    requestedDate: { type: String, required: true, immutable: true }, // YYYY-MM-DD
    requestedTime: { type: String, required: true, immutable: true }, // HH:mm:ss

    // Workflow
    status: {
      type: String,
      enum: ["processing", "approved", "rejected"],
      default: "processing",
    },

    // Assignments
    assignedDigitalMarketer: {
      type: Schema.Types.ObjectId,
      ref: "DigitalMarketer",
      default: null,
    },
    assignedCreativeStaff: {
      type: Schema.Types.ObjectId,
      ref: "CreativeStaff",
      default: null,
    },

    // Messages + meta
    messageForDigitalMarketer: { type: String, trim: true, default: "" },
    messageForCreativeStaff: { type: String, trim: true, default: "" },
    updationReason: { type: String, trim: true, default: "" },

    // Decision meta
    decisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
    decidedAt: { type: Date, default: null },

    // Optional override (DO NOT overwrite original publishingDate)
    approvedPublishingDate: { type: Date, default: null },

    // Rejection
    rejectionReason: { type: String, trim: true, default: "" },
      creativeStatus: {
      type: String,
      enum: ["pending", "waiting", "approved", "rejected"],
      default: "pending",
    },

    togglestatus:   { type: Boolean, default: false },
    fileNames:      { type: [String], default: [] },
    resheduledatewithreason: { type: [resheduledItemSchema], default: [] },
    creativeRejectionReason: { type: String, trim: true, default: "" },
    creativeDecisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
    creativeDecidedAt: { type: Date, default: null },
    dmPostStatus: { type: Boolean, default: false }, // false => Not posted yet
    dmPostedAt:   { type: Date, default: null },     // timestamp when marked posted
   
  },
  { timestamps: true }
);

export default mongoose.model("UploadRequest", uploadRequestSchema);
