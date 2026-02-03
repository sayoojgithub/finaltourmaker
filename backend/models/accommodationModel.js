import mongoose from "mongoose";
const roundToInt = (value) => {
  return typeof value === "number" ? Math.round(value) : value;
};

const priceSectionSchema = new mongoose.Schema({
  validFrom: Date,
  validTo: Date,
  commission: {
    type: Number,
    set: roundToInt,
  },
  "2BEDEP": { type: Number, set: roundToInt },
  "2BEDCP": { type: Number, set: roundToInt },
  "2BEDMAP": { type: Number, set: roundToInt },
  "3BEDEP": { type: Number, set: roundToInt },
  "3BEDCP": { type: Number, set: roundToInt },
  "3BEDMAP": { type: Number, set: roundToInt },
  "4BEDEP": { type: Number, set: roundToInt },
  "4BEDCP": { type: Number, set: roundToInt },
  "4BEDMAP": { type: Number, set: roundToInt },
  EXTRABEDEP: { type: Number, set: roundToInt },
  EXTRABEDCP: { type: Number, set: roundToInt },
  EXTRABEDMAP: { type: Number, set: roundToInt },
  FRESHUP: { type: Number, set: roundToInt },
  EARLYCHECKIN: { type: Number, set: roundToInt },
  LATECHECKOUT: { type: Number, set: roundToInt },
});

const accommodationSchema = new mongoose.Schema({
  purchaserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  propertyName: String,
  hotelCategory: String,
  email: String,
  ownerName: String,
  mobileNumber: String,
  whatsappNumber: String,
  address: String,
  roomCategory: String,
  status: String,
  country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
  state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  advancePercentage: { type: Number, default: 0 },
   imageUrl: { type: String, default: "" },
  secondImageUrl: { type: String, default: "" },
  thirdImageUrl: { type: String, default: "" },
  fourthImageUrl: { type: String, default: "" },   
  fifthImageUrl: { type: String, default: "" },
  sixthImageUrl: { type: String, default: "" },
  seventhImageUrl: { type: String, default: "" },
  eightImageUrl: { type: String, default: "" },
  formSections: [priceSectionSchema],                 // original values
  formSectionsWithCommission: [priceSectionSchema],   // inflated values
  accommodationCode: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Accommodation", accommodationSchema);
