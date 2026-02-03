import mongoose from "mongoose";
const TermsPointSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, default: "" },
  },
  { _id: true }
);
const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    uppercase: true, // to save in BLOCK LETTERS
    trim: true,
  },
  ownerName: {
  type: String,
  required: true,
  trim: true,
},
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  additionalNumber: {
  type: String,
   required: true,
},
  buildingName: {
    type: String,
    required: true,
    trim: true,
  },
  roadAreaStreet: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
  },
    gstin: {
    type: String,
    trim: true,
    uppercase: true,
    
  },
   logo: {
    type: String, 
    default: '',  
  },
   terms: {
    itineraryTerms: { type: [TermsPointSchema], default: [] },
    invoiceTerms: { type: [TermsPointSchema], default: [] },
    voucherTerms: { type: [TermsPointSchema], default: [] },

    // ✅ NEW
    paymentPolicy: { type: [TermsPointSchema], default: [] },
    cancellationPolicy: { type: [TermsPointSchema], default: [] },
  },
   salesExecutive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesExecutive",
    required: true,
  },
   verificationStatus: {
    type: Boolean,
    default: false, // not verified by default
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

   password: {
    type: String,
  },
  role: { type: String, default: "company" },
}, { timestamps: true });

export default mongoose.model("Company", companySchema);
