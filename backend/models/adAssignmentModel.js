import mongoose from "mongoose";
const { Schema } = mongoose;

const adAssignmentSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    marketingManager: { type: Schema.Types.ObjectId, ref: "MarketingManager", required: true },

    country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    state: { type: Schema.Types.ObjectId, ref: "State", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },

    task: {
      type: String,
      enum: ["Poster", "Reel", "Video", "Review", "Staff Performance"],
      required: true,
    },
    date: { type: Date, required: true },  // Publishing date (IST normalized server-side)
    quantity: { type: Number, min: 1, required: true },
    details: { type: String, default: "", trim: true },

    assignedDigitalMarketer: { type: Schema.Types.ObjectId, ref: "DigitalMarketer", required: true },
    messageForDigitalMarketer: { type: String, required: true, trim: true },

    assignedCreativeStaff: { type: Schema.Types.ObjectId, ref: "CreativeStaff", required: true },
    messageForCreativeStaff: { type: String, required: true, trim: true },

    creativeStatus: { type: String, enum: ["pending", "waiting", "approved", "rejected"], default: "pending" },
    togglestatus: { type: Boolean, default: false },

    fileNames: { type: [String], default: [] },


    creativeRejectionReason: { type: String, trim: true, default: "" },
    creativeDecisionBy: { type: Schema.Types.ObjectId, ref: "MarketingManager", default: null },
    creativeDecidedAt: { type: Date, default: null },

    dmPostStatus: { type: Boolean, default: false },
    dmPostedAt: { type: Date, default: null },
  
  },
  { timestamps: true }
);



export default mongoose.model("AdAssignment", adAssignmentSchema);
