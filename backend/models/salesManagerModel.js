import mongoose from 'mongoose';

const salesManagerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'salesmanager' },
  department: { type: String, default: 'salesmanager' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  type: {
    type: String,
    enum: ['Company', 'Branch', 'Franchisee'],
    required: true,
  },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  franchisee: { type: mongoose.Schema.Types.ObjectId, ref: 'Franchisee', default: null },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  profileImage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('SalesManager', salesManagerSchema);
