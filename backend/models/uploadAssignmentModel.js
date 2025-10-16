import mongoose from "mongoose";
const { Schema } = mongoose;

const uploadAssignmentSchema = new Schema(
  {
    company:            { type: Schema.Types.ObjectId, ref: "Company", required: true },
    marketingManager:   { type: Schema.Types.ObjectId, ref: "MarketingManager", required: true },

    // Work details
    category:           { type: String, required: true, trim: true }, // e.g., Branch Video, Staff performance
    filename:           { type: String, required: true, trim: true },
    publishingDate:     { type: Date, required: true }, // MM sets the intended publish date

    // Assignments
    assignedDigitalMarketer: { type: Schema.Types.ObjectId, ref: "DigitalMarketer", required: true },
    messageForDigitalMarketer: { type: String, required: true, trim: true },

    assignedCreativeStaff:    { type: Schema.Types.ObjectId, ref: "CreativeStaff", default: null },
    messageForCreativeStaff:  { type: String, trim: true, default: "" },

    // Simple status for execution/coordination (kept similar to your ad flow)
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

export default mongoose.model("UploadAssignment", uploadAssignmentSchema);
