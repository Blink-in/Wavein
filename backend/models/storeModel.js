import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      minlength: [2, "Store name must contain at least 2 characters"],
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: [true, "Store URL is required"],
      lowercase: true,
      trim: true,
      unique: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Store owner is required"],
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    logo: {
      type: String,
      default: null,
    },

    themeSettings: {
      primaryColor: {
        type: String,
        default: "#118961",
      },
      secondaryColor: {
        type: String,
        default: "#FFFFFF",
      },
    },

    contactDetails: {
      email: {
        type: String,
        lowercase: true,
        trim: true,
        default: "",
      },
      phone: {
        type: String,
        trim: true,
        default: "",
      },
      address: {
        type: String,
        trim: true,
        default: "",
      },
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      enum: ["NGN"],
    },

    status: {
      type: String,
      enum: ["setup", "active", "suspended"],
      default: "setup",
    },
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.model("Store", storeSchema);

export default Store;