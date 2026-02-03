import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  price: { type: Number, required: true },
});
const itineraryPriceSchema = new mongoose.Schema({
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  price: { type: Number, required: true },
});

const vehicleRowSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  category: { type: String, required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  prices: [priceSchema],
  itineraryPrices: [itineraryPriceSchema],
});

const tripSchema = new mongoose.Schema(
  {
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    addontripName: { type: String, required: true },
    description: { type: String },
    approxKm: { type: String },
      imageUrl: { type: String, default: "" },
    secondImageUrl: { type: String, default: "" },
    thirdImageUrl: { type: String, default: "" },
    fourthImageUrl: { type: String, default: "" },
    fifthImageUrl: { type: String, default: "" },
    sixthImageUrl: { type: String, default: "" },
    seventhImageUrl: { type: String, default: "" },
    eighthImageUrl: { type: String, default: "" },
    vehicles: [vehicleRowSchema],
    activeStatus: {
    type: Boolean,
    default: true,
  },
  },
  { timestamps: true }
);

export default mongoose.model("AddOnTrip", tripSchema);
