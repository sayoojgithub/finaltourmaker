// models/Client.ts
import mongoose from "mongoose";
const OptionSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true },
    label: { type: String, trim: true },
  },
  { _id: false }
);
const DestinationSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    value: { type: String, },
    label: { type: String, },
  },
);
const CampaignRefSchema = new mongoose.Schema(
  {
    kind: { type: String,},               // e.g., "GroupTour"
    refId: { type: mongoose.Schema.Types.ObjectId,},
    label: { type: String,},
  },
);

const ClientSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, trim: true },
    name: { type: String,trim: true },
    mobileNumber: {
      type: String,
      trim: true,
    },
    whatsappNumber: { type: String, trim: true,},
    email: {
      type: String,
      trim: true,
    },
    tourType: { type: OptionSchema },
    primaryDestinationName: { type: DestinationSchema,},
    addonDestinations: { type: [DestinationSchema], default: [] },
    groupType: {
      type: OptionSchema,
    },
    numberOfPersons: { type: Number,min: 1},

    startDate: { type: Date,},
    endDate: { type: Date,},
    numberOfDays: { type: Number,min: 1 },
    pincode: { type: String,trim: true,},
    district: { type: String,trim: true,},
    state: { type: String,trim: true,},
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
    gstNumber: { type: String, trim: true,},
    additionalRequirements: { type: [String],},
    clientByEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "ClientByEntry", },
    campaignName: { type: CampaignRefSchema, },
   createdAtByEntry: { type: Date,},
   entryId: { type: mongoose.Schema.Types.ObjectId,ref:"Entry",},

  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company",},
  createdAtByFrontoffice: { type: Date,},
  frontOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: "FrontOfficer",},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", ClientSchema);
