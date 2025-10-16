
// import mongoose from "mongoose";
// const { Schema } = mongoose;

// const leadRequestSchema = new Schema(
//   {
//     // Who submitted
//     salesManager: { type: Schema.Types.ObjectId, ref: "SalesManager", required: true },
//     company:      { type: Schema.Types.ObjectId, ref: "Company", required: true },

//     // Selection chain
//     country:     { type: Schema.Types.ObjectId, ref: "Country", required: true },
//     state:       { type: Schema.Types.ObjectId, ref: "State", required: true },
//     destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },

//     // Work details
//     tourRef:   { type: String, required: true, trim: true },
//     startDate: { type: Date, required: true },
//     endDate:   { type: Date, required: true },
//     quantity:  { type: Number, min: 1, required: true },
//     frequency: { type: String, enum: ["daily", "weekly", "monthly"], required: true },

//     // Server-side request timestamp captured at submit
//     requestedAt:   { type: Date, default: Date.now, immutable: true },
//     requestedDate: { type: String, required: true, immutable: true }, // YYYY-MM-DD
//     requestedTime: { type: String, required: true, immutable: true },  // HH:mm:ss

//     // Workflow
//     status: { type: String, enum: ["processing", "approved", "rejected"], default: "processing" },

//     // Assignments/decision
//     assignedDigitalMarketer: { type: Schema.Types.ObjectId, ref: "DigitalMarketer", default: null },
//     assignedCreativeStaff:   { type: Schema.Types.ObjectId, ref: "CreativeStaff",   default: null },
//     decisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
//     decidedAt:  { type: Date, default: null },

//     // Optional overrides (do NOT overwrite originals)
//     approvedStartDate: { type: Date, default: null },
//     approvedEndDate:   { type: Date, default: null },
//     approvedQuantity:  { type: Number, min: 1, default: null },
//     approvedFrequency: { type: String, enum: ["daily", "weekly", "monthly"], default: null },

//     // Campaign/meta + messages
//     campaignName:              { type: String, trim: true, default: "" },
//     messageForDigitalMarketer: { type: String, trim: true, default: "" },
//     messageForCreativeStaff:   { type: String, trim: true, default: "" },

//     // Rejection + updation reason
//     rejectionReason: { type: String, trim: true, default: "" },
//     updationReason:  { type: String, trim: true, default: "" },

//     // ---------- NEW: Ad Category + dynamic ad payload ----------
//     adCategory:         { type: Schema.Types.ObjectId, ref: "AdCategory", default: null },
//     adData:             { type: Schema.Types.Mixed, default: {} },          // key -> value
//     adCategorySnapshot: { type: Schema.Types.Mixed, default: null }         // frozen fields on approval
//   },
//   { timestamps: true }
// );

// export default mongoose.model("LeadRequest", leadRequestSchema);
// models/LeadRequest.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * LeadRequest stores the user’s ask. We keep a human-friendly tourRef string
 * for compatibility, plus a structured link to GroupTour/FixedTour via refPath.
 */
const resheduledItemSchema = new Schema(
  {
    date: { type: Date, required: true },
    reason: { type: String, trim: true, required: true },
  },
  { _id: false }
);
const leadRequestSchema = new Schema(
  {
    // Who submitted
    salesManager: { type: Schema.Types.ObjectId, ref: "SalesManager", required: true },
    company:      { type: Schema.Types.ObjectId, ref: "Company", required: true },

    // Selection chain
    country:     { type: Schema.Types.ObjectId, ref: "Country", required: true },
    state:       { type: Schema.Types.ObjectId, ref: "State", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },

    // Tour linkage — both friendly text and structured reference
    tourRef: { type: String, required: true, trim: true }, // display string (article/tour name)
    selectedTourModel: {
      type: String,
      enum: ["GroupTour", "FixedTour", null],
      default: null,
    },
    selectedTourId: {
      type: Schema.Types.ObjectId,
      refPath: "selectedTourModel",
      default: null,
    },

    // Work details
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    quantity:  { type: Number, min: 1, required: true },
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], required: true },

    // Server-side request timestamp captured at submit
    requestedAt:   { type: Date, default: Date.now, immutable: true },
    requestedDate: { type: String, required: true, immutable: true }, // YYYY-MM-DD
    requestedTime: { type: String, required: true, immutable: true },  // HH:mm:ss

    // Workflow
    status: { type: String, enum: ["processing", "approved", "rejected"], default: "processing" },

    // Assignments/decision
    assignedDigitalMarketer: { type: Schema.Types.ObjectId, ref: "DigitalMarketer", default: null },
    assignedCreativeStaff:   { type: Schema.Types.ObjectId, ref: "CreativeStaff",   default: null },
    decisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
    decidedAt:  { type: Date, default: null },

    // Optional overrides (do NOT overwrite originals)
    approvedStartDate: { type: Date, default: null },
    approvedEndDate:   { type: Date, default: null },
    approvedQuantity:  { type: Number, min: 1, default: null },
    approvedFrequency: { type: String, enum: ["daily", "weekly", "monthly"], default: null },

    // Campaign/meta + messages
    campaignName:              { type: String, trim: true, default: "" },
    messageForDigitalMarketer: { type: String, trim: true, default: "" },
    messageForCreativeStaff:   { type: String, trim: true, default: "" },

    // Rejection + updation reason
    rejectionReason: { type: String, trim: true, default: "" },
    updationReason:  { type: String, trim: true, default: "" },

    // Ad Category + dynamic ad payload
    adCategory:         { type: Schema.Types.ObjectId, ref: "AdCategory", default: null },
    adData:             { type: Schema.Types.Mixed, default: {} },
    adCategorySnapshot: { type: Schema.Types.Mixed, default: null },
    creativeStatus: { type: String, enum: ["pending", "waiting", "approved", "rejected"], default: "pending" },
    togglestatus:   { type: Boolean, default: false },
    fileNames:      { type: [String], default: [] },
    resheduledatewithreason: { type: [resheduledItemSchema], default: [] },
     creativeRejectionReason: { type: String, trim: true, default: "" },
    creativeDecisionBy:      { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
    creativeDecidedAt:       { type: Date, default: null },
    dmPostStatus: { type: Boolean, default: false }, // false => Not posted yet
    dmPostedAt:   { type: Date, default: null },     // timestamp when marked posted
   
  },
  { timestamps: true }
);

// Helpful indexes
// leadRequestSchema.index({ salesManager: 1, requestedAt: -1 });
// leadRequestSchema.index({ company: 1, destination: 1, requestedAt: -1 });
// leadRequestSchema.index({ selectedTourModel: 1, selectedTourId: 1 });

export default mongoose.model("LeadRequest", leadRequestSchema);
