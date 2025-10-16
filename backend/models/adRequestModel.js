import mongoose from "mongoose";

const { Schema } = mongoose;
const resheduledItemSchema = new Schema(
  {
    date: { type: Date, required: true },
    reason: { type: String, trim: true, required: true },
  },
  { _id: false }
);
const adRequestSchema = new Schema(
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
    state: { type: Schema.Types.ObjectId, ref: "State", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },

    // Work details
    task: {
      type: String,
      enum: ["Poster", "Reel", "Video", "Review", "Staff Performance"],
      required: true,
    },
    date: { type: Date, required: true },
    quantity: { type: Number, min: 1, required: true },
    details: { type: String, default: "", trim: true },

    // Server-side request timestamp captured at submit
    requestedAt: { type: Date, default: Date.now, immutable: true },
    requestedDate: { type: String, required: true, immutable: true },
    requestedTime: { type: String, required: true, immutable: true },

    // Workflow
    status: {
      type: String,
      enum: ["processing", "approved", "rejected"],
      default: "processing",
    },

    // Assignment (upon approval)
    assignedDigitalMarketer: {
      type: Schema.Types.ObjectId,
      ref: "DigitalMarketer",
      default: null,
    },

    // NEW: Creative staff assignment (upon approval)
    assignedCreativeStaff: {
      type: Schema.Types.ObjectId,
      ref: "CreativeStaff",
      default: null,
    }, // NEW

    // NEW: Campaign/meta and messages
    campaignName: { type: String, trim: true, default: "" }, // NEW
    messageForDigitalMarketer: { type: String, trim: true, default: "" }, // NEW
    messageForCreativeStaff: { type: String, trim: true, default: "" }, // NEW

    // Marketing manager decision metadata
    decisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
    decidedAt: { type: Date, default: null },

    // Optional overrides by Marketing Manager (separate fields; DO NOT overwrite the originals)
    approvedDate: { type: Date, default: null },
    approvedQuantity: { type: Number, min: 1, default: null },

    // Rejection
    rejectionReason: { type: String, trim: true, default: "" },

    // NEW: Updation reason (shown with rejection reason row)
    updationReason: { type: String, trim: true, default: "" }, // NEW
    creativeStatus: {
    type: String,
    enum: ["pending", "waiting", "approved", "rejected"],
    default: "pending", // defaultly set pending
    },
    togglestatus: { type: Boolean, default: false }, 
     fileNames: {
      type: [String], // store multiple file names
      default: [],
    },
    resheduledatewithreason: {
      type: [resheduledItemSchema],
      default: [],
    },
      // NEW: store creative rejection reason
  creativeRejectionReason: { type: String, trim: true, default: "" },

  // NEW: who/when set creativeStatus (for auditing)
  creativeDecisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
  creativeDecidedAt: { type: Date, default: null },
  dmPostStatus: { type: Boolean, default: false }, 
  dmPostedAt:   { type: Date, default: null },     
  },
  { timestamps: true }
);

export default mongoose.model("AdRequest", adRequestSchema);

