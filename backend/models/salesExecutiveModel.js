import mongoose from "mongoose";

const targetSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  target: { type: Number, required: true },
}, { _id: false }); // prevent auto-generating _id for sub-docs

const salesExecutiveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "salesExecutive" },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

  // ✅ New field
  targets: [targetSchema]
}, {
  timestamps: true,
});

export default mongoose.model("SalesExecutive", salesExecutiveSchema);
