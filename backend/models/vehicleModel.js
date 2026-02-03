import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  purchaser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Purchaser",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  vehicle: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
  type: String,
  default: "",
},
secondImageUrl: { type: String, default: "" },
thirdImageUrl: { type: String, default: "" },
fourthImageUrl: { type: String, default: "" },
fifthImageUrl: { type: String, default: "" },
sixthImageUrl: { type: String, default: "" },
seventhImageUrl: { type: String, default: "" },
eightImageUrl: { type: String, default: "" },
 activeStatus: {
    type: Boolean,
    default: true,
  },
  percentage: {
  type: Number,
  required: true,
},
  advancePercentage: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Vehicle", vehicleSchema);
