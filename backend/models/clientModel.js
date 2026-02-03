// models/Client.ts
import mongoose from "mongoose";
const OptionSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true },
    label: { type: String, trim: true },
  },
  { _id: false }
);
const DestinationSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  value: { type: String },
  label: { type: String },
});
const CampaignRefSchema = new mongoose.Schema({
  kind: { type: String }, // e.g., "GroupTour"
  refId: { type: mongoose.Schema.Types.ObjectId },
  label: { type: String },
});

const ConfirmedTourSchema = new mongoose.Schema(
  {
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: "GroupTour", default: null },
    tourName: { type: String, trim: true, default: "" },
    startDate: { type: Date, default: null },
  },
  { _id: false }
);

const ClientSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    mobileNumber: {
      type: String,
      trim: true,
    },
    whatsappNumber: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
    },
    tourType: { type: OptionSchema },
    primaryDestinationName: { type: DestinationSchema },
    addonDestinations: { type: [DestinationSchema], default: [] },
    groupType: {
      type: OptionSchema,
    },
    numberOfPersons: { type: Number, min: 1 },

    startDate: { type: Date },
    endDate: { type: Date },
    numberOfDays: { type: Number, min: 1 },
    pincode: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    clientContactOption: {
      type: OptionSchema,
    },
    clientType: {
      type: OptionSchema,
    },
    clientCurrentLocation: {
      type: OptionSchema,
    },
    connectedThrough: {
      type: OptionSchema,
    },
    behavior: {
      type: OptionSchema,
    },
    gstNumber: { type: String, trim: true },
    additionalRequirements: { type: [String] },
    clientByEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientByEntry",
    },
    campaignName: { type: CampaignRefSchema },
    createdAtByEntry: { type: Date },
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: "Entry" },

    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    createdAtByFrontoffice: { type: Date },
    frontOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FrontOfficer",
    },
    executiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Executive",
      default: null,
    },
    salesManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesManager",
      default: null,
    },
    executiveManagingStatus: {
      type: Boolean,
      default: false,
    },
    salesManagerManagingStatus: {
      type: Boolean,
      default: false,
    },

    statusUpdatedByExecutive: {
      type: [mongoose.Schema.Types.Mixed], // <--- changed
      default: [],
    },
    ScheduleDatesByExecutives: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    statusUpdatedBySalesManager: {
      type: [mongoose.Schema.Types.Mixed], // <--- changed
      default: [],
    },
    confirmedTourType: { type: String, trim: true, default: "" },
    confirmedTour: { type: ConfirmedTourSchema, default: null },
    tourConfirmedDate: { type: Date, default: null },
    tourStartDate: { type: Date, default: null },
    tourEndDate: { type: Date, default: null },
    tourCost: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    additionalItemsCost: { type: Number, min: 0, default: 0 },
    totalAmountToBePaid: { type: Number, min: 0, default: 0 },
    totalAmountPaid: { type: Number, min: 0, default: 0 },
    balance: { type: Number, min: 0, default: 0 },
    paymentCode: { type: String, trim: true, unique: true, sparse: true, index: true },
    paymentOtpHash: { type: String, trim: true, default: "" },
paymentOtpExpiresAt: { type: Date, default: null },
paymentOtpVerifiedAt: { type: Date, default: null },
paymentOtpLastSentAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", ClientSchema);
