import mongoose from "mongoose";

const bankDetailsSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  bankName: { type: String, required: true },
  accountHolderName: { type: String, required: true},
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  branch: { type: String, required: true },
  qrCodeUrl: { type: String },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });

export default mongoose.model("BankDetails", bankDetailsSchema);