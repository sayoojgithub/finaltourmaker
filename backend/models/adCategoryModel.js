import mongoose from "mongoose";

const { Schema } = mongoose;

export const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "date",
  "select",
  "multiselect",
  "checkbox",
  "url",
  "destinations", // special: can be single/multiple destination(s)
];

const optionSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const fieldConfigSchema = new Schema(
  {
    // for select/multiselect
    options: { type: [optionSchema], default: [] },

    // for destinations
    multiple: { type: Boolean, default: false },

    // general hints
    placeholder: { type: String, default: "" },
    helpText: { type: String, default: "" },

    // numeric constraints (number)
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },

    // default value (any)
    defaultValue: { type: Schema.Types.Mixed, default: undefined },
  },
  { _id: false }
);

const fieldSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9\-_]+$/, "Key must be slug-like (a-z0-9-_)"],
    },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: FIELD_TYPES, required: true },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    config: { type: fieldConfigSchema, default: () => ({}) },
  },
  { _id: true }
);

const adCategorySchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },

    // dynamic fields live inside the category
    fields: { type: [fieldSchema], default: [] },
  },
  { timestamps: true }
);

// Unique category name within a company
adCategorySchema.index({ company: 1, name: 1 }, { unique: true });

export default mongoose.model("AdCategory", adCategorySchema);
