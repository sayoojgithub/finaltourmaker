import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  validFrom: { type: Date },
  validTo: { type: Date },
  price: { type: Number },
  percent: { type: Number },
  itineraryPrice: { type: Number },
});

const rowSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  mealType: { type: String },
  mealCategory: { type: String },
  foodName: { type: String },
  description: { type: String },
  prices: [priceSchema],
});

const foodSchema = new mongoose.Schema(
  {
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
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    rows: [rowSchema],
    activeStatus: {
    type: Boolean,
    default: true,
  },
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);
