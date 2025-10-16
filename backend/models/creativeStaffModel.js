import mongoose from 'mongoose';

const creativeStaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'creativestaff' },
  department: { type: String, default: 'creativestaff' },
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

export default mongoose.model('CreativeStaff', creativeStaffSchema);
