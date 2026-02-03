
import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  price: { type: Number, required: true },
  percentage: { type: Number }, // Optional
  itineraryPrice: { type: Number }, // Auto-calculated and saved
});

const activitySchema = new mongoose.Schema({
  country: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  activityName: { type: String, required: true },
  description: { type: String, required: true },
   advancePercentage: {
      type: Number,
    },
  prices: [priceSchema],
  activeStatus: {
    type: Boolean,
    default: true,
  },
   imageUrl: { type: String, default: "" },
   secondImageUrl: { type: String, default: "" },
   thirdImageUrl: { type: String, default: "" },
   fourthImageUrl: { type: String, default: "" },
    fifthImageUrl: { type: String, default: "" },
    sixthImageUrl: { type: String, default: "" },
    seventhImageUrl: { type: String, default: "" },
    eightImageUrl: { type: String, default: "" },
  purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
}, { timestamps: true });

export default mongoose.model("Activity", activitySchema);

