
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    provider: {
      type: String,
      enum: ["paystack"],
      default: "paystack",
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "success",
        "failed",
        "abandoned",
        "reversed",
      ],
      default: "pending",
    },
    authorizationUrl: {
      type: String,
      default: "",
    },
    accessCode: {
      type: String,
      default: "",
    },
    gatewayTransactionId: {
      type: String,
      default: "",
    },
    gatewayStatus: {
      type: String,
      default: "",
    },
    failureMessage: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    requiresRefund: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ store: 1, createdAt: -1 });
paymentSchema.index({ order: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
