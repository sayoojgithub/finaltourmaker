import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
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
   destinationCode: {
    type: String,
    required: true,
  },
    imageUrl: { type: String, default: "" },
  secondImageUrl: { type: String, default: "" },
  thirdImageUrl: { type: String, default: "" },
  fourthImageUrl: { type: String, default: "" },
  fifthImageUrl: { type: String, default: "" },
  sixthImageUrl: { type: String, default: "" },
  seventhImageUrl: { type: String, default: "" },
  eightImageUrl: { type: String, default: "" },
   textColor: { type: String, default: "#000000" },
  activeStatus: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
destinationSchema.index({ company: 1, activeStatus: 1, name: 1 });
export default mongoose.model("Destination", destinationSchema);
