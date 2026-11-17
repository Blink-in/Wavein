
import mongoose from "mongoose";

const storePaymentConfigSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ["paystack"],
      default: "paystack",
      required: true,
    },
    subaccountCode: {
      type: String,
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    accountName: {
      type: String,
      default: "",
    },
    settlementBank: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "NGN",
    },
    percentageCharge: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const StorePaymentConfig = mongoose.model(
  "StorePaymentConfig",
  storePaymentConfigSchema
);

export default StorePaymentConfig;
