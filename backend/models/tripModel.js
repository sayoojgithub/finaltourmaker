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
    tripName: { type: String, required: true },
    description: { type: String },
    approxKm: { type: String },
    imageUrl: { type: String },
    vehicles: [vehicleRowSchema],
    activeStatus: {
    type: Boolean,
    default: true,
  },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
