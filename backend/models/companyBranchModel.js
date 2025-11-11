import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  branchName: { type: String, required: true },
  buildingName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  roadAreaStreet: { type: String },
  email: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  password: { type: String, required: true },
  gstin: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  role: { type: String, default: 'companyBranch' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
   assignedPincodes: {
    type: [String],
    default: [],
    index: true, // helpful for lookups like "who owns this pincode?"
  },
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);