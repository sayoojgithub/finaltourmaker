// models/ClientByEntry.js
import mongoose from "mongoose";

const PrimaryDestinationSubSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    value: { type: String, required: true }, // usually destination NAME
    label: { type: String, required: true }, // show same as value (or enriched)
  },
  { _id: false }
);

const CampaignNameSubSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["FixedTour", "GroupTour"], required: false },
    refId: { type: mongoose.Schema.Types.ObjectId, required: false },
    label: { type: String }, // tourName as shown to users
  },
  { _id: false }
);

const ClientByEntrySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10,15}$/, "Mobile number must be 10–15 digits"],
    },
    primaryDestinationName: {
      type: PrimaryDestinationSubSchema,
      required: true,
    },
    campaignName: {
      type: CampaignNameSubSchema, // optional
      required: false,
    },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entry",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    assignedFrontOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: "FrontOfficer", default: null },
    assignedAt: { type: Date, default: null },
    createdAtByEntry: { type: Date, default: Date.now },
    frontOfficeCreatedStatus: { type: Boolean, default: false },

    connectedThrough: {
      value: { type: String, required: true },
      label: { type: String, required: true },
    },
    clientType: {
      value: { type: String },
      label: { type: String },
    },
  },
  { timestamps: true }
);


ClientByEntrySchema.index({ entryId: 1, createdAt: -1 });                   // base sort/pagination
ClientByEntrySchema.index({ entryId: 1, name: 1 });                          // prefix search on name
ClientByEntrySchema.index({ entryId: 1, mobileNumber: 1 });                  // prefix search on mobile
ClientByEntrySchema.index({ entryId: 1, "primaryDestinationName.value": 1 }); // prefix search on destination

ClientByEntrySchema.index({ entryId: 1, createdAtByEntry: 1 })

export default mongoose.model("ClientByEntry", ClientByEntrySchema);
