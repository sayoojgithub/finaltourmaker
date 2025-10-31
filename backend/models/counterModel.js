import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  destinationSequence: {
    type: Number,
    default: 0,
  },
  vendorSequence: {
    type: Number,
    default: 0,
  },
  accommodationSequence: {
    type: Number,
    default: 0,
  },
  clientSequence: { type: Number, default: 0 },
});

export default mongoose.model("Counter", counterSchema);
