import mongoose from "mongoose";

const ClientPaymentSchema = new mongoose.Schema(
  {
    gateway: { type: String, enum: ["HDFC_SMARTGATEWAY"], default: "HDFC_SMARTGATEWAY" },

    // Snapshot identity
    clientObjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    clientIdText: { type: String, trim: true, default: "" },
    mobileNumber: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    tourStartDate: { type: Date, default: null },

    currency: { type: String, default: "INR" },
    amountRupees: { type: Number, min: 0, required: true }, // store integer rupees only

    // HDFC SmartGateway order/session fields
    orderId: { type: String, trim: true, index: true },       // our generated orderId
    sessionId: { type: String, trim: true, default: "" },     // if returned
    paymentLink: { type: String, trim: true, default: "" },   // hosted page URL

    // Status lifecycle
    status: {
      type: String,
      enum: ["CREATED", "REDIRECTED", "SUCCESS", "FAILED", "PENDING"],
      default: "CREATED",
      index: true,
    },

    // Idempotency (credit only once)
    credited: { type: Boolean, default: false, index: true },
    creditedAt: { type: Date, default: null },
    creditedAmountRupees: { type: Number, min: 0, default: 0 },

    // Diagnostics
    failureReason: { type: String, default: "" },
    returnSignatureValid: { type: Boolean, default: null },
    lastGatewayStatus: { type: String, default: "" }, // e.g., CHARGED / FAILED / PENDING
    rawReturnParams: { type: mongoose.Schema.Types.Mixed, default: {} },
    rawStatusResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ClientPaymentSchema.index({ orderId: 1 }, { unique: true, sparse: true });
ClientPaymentSchema.index({ clientObjectId: 1, createdAt: -1 });

export default mongoose.model("ClientPayment", ClientPaymentSchema);
