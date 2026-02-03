import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
      required: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
    },
    address: {
      type: String,
      trim: true,
      required: true,
    },
    services: {
      type: [String],
      enum: ["Vehicle", "Hotels", "Activities", "Guide", "Rental", "Food", "Fixed Tour"],
      default: [],
    },
    vendorCode: {
      type: String,
      required: true,
    },
    activeStatus: {
    type: Boolean,
    default: true,
  },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vendor", vendorSchema);
