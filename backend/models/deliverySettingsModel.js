import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Delivery zone name is required"],
      trim: true,
      maxlength: [100, "Zone name cannot exceed 100 characters"],
    },
    states: {
      type: [String],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => item.trim().length > 0),
        message: "At least one valid state is required",
      },
    },
    cities: {
      type: [String],
      default: [],
    },
    fee: {
      type: Number,
      required: true,
      min: [0, "Delivery fee cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const deliverySettingsSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
    },
    zones: {
      type: [deliveryZoneSchema],
      default: [],
    },
    isDeliveryEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const DeliverySettings = mongoose.model(
  "DeliverySettings",
  deliverySettingsSchema
);

export default DeliverySettings;