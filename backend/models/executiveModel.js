import mongoose from 'mongoose';
const OptionSchema = new mongoose.Schema(
  { value: { type: String, trim: true }, label: { type: String, trim: true } },
  { _id: false }
);

const DestinationSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    value: { type: String, trim: true },
    label: { type: String, trim: true },
  },
  { _id: false }
);

const executiveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'executive' },
  department: { type: String, default: 'executive' },
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

    // 🔽 NEW: assignment preference arrays
  prefTourCategories: { type: [OptionSchema], default: [] },            // grouptour/fixedtour/customtour
  prefPrimaryDestinations: { type: [DestinationSchema], default: [] },  // {_id,value,label}
  prefGroupTypes: { type: [OptionSchema], default: [] },                 // single/couple/family/friends
  prefNumberOfDays: { type: [Number], default: [] },                     // e.g., [3,5,7]
  prefClientTypes: { type: [OptionSchema], default: [] },                // urgent/non-urgent
  prefCurrentLocations: { type: [OptionSchema], default: [] },           // insider/outsider
  prefBehaviours: { type: [OptionSchema], default: [] },                 // polite/normal/hard/educated
  prefConnectedThrough: { type: [OptionSchema], default: [] },
  prefClientContactOptions: { type: [OptionSchema], default: [] }, 
});

export default mongoose.model('Executive', executiveSchema);