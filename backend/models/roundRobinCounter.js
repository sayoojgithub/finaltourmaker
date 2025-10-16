// models/RoundRobinCounter.js
import mongoose from "mongoose";

const RoundRobinCounterSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, unique: true },
    seq: { type: Number, default: 0 }, // monotonically increasing
  },
  { timestamps: true }
);

RoundRobinCounterSchema.index({ companyId: 1 }, { unique: true });

export default mongoose.model("RoundRobinCounter", RoundRobinCounterSchema);
