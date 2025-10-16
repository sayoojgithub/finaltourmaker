import mongoose from "mongoose";
const { Schema } = mongoose;

const leadAssignmentSchema = new Schema(
  {
    company:           { type: Schema.Types.ObjectId, ref: "Company", required: true },
    marketingManager:  { type: Schema.Types.ObjectId, ref: "MarketingManager", required: true },

    // chain
    country:     { type: Schema.Types.ObjectId, ref: "Country", required: true },
    state:       { type: Schema.Types.ObjectId, ref: "State", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },

    // tour linkage
    tourRef:            { type: String, required: true, trim: true }, // human-friendly tour name
    selectedTourModel:  { type: String, enum: ["GroupTour", "FixedTour"], required: true },
    selectedTourId:     { type: Schema.Types.ObjectId, refPath: "selectedTourModel", required: true },

    // work details
    startDate:  { type: Date, required: true },
    endDate:    { type: Date, required: true },
    quantity:   { type: Number, min: 1, required: true },
    frequency:  { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    details:    { type: String, default: "", trim: true },

    // campaign + ad category payload
    campaignName: { type: String, trim: true, default: "" },
    adCategory:   { type: Schema.Types.ObjectId, ref: "AdCategory", required: true },
    adData:       { type: Schema.Types.Mixed, default: {} },
    adCategorySnapshot: { type: Schema.Types.Mixed, default: null }, // frozen fields at assignment time

    // assignments
    assignedDigitalMarketer:   { type: Schema.Types.ObjectId, ref: "DigitalMarketer", required: true },
    messageForDigitalMarketer: { type: String, required: true, trim: true },

    assignedCreativeStaff:     { type: Schema.Types.ObjectId, ref: "CreativeStaff", default: null },
    messageForCreativeStaff:   { type: String, trim: true, default: "" },

    creativeStatus: { type: String, enum: ["pending", "waiting", "approved", "rejected"], default: "pending" },
    togglestatus: { type: Boolean, default: false },

    fileNames: { type: [String], default: [] },
    

    creativeRejectionReason: { type: String, trim: true, default: "" },
    creativeDecisionBy:      { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
    creativeDecidedAt:       { type: Date, default: null },

    dmPostStatus: { type: Boolean, default: false },
    dmPostedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);



export default mongoose.model("LeadAssignment", leadAssignmentSchema);
