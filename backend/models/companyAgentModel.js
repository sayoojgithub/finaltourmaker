import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
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
  role: { type: String, default: 'companyAgent' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
}, { timestamps: true });

export default mongoose.model('Agent', agentSchema);