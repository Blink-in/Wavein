import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must contain at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    compareAtPrice: {
      type: Number,
      min: [0, "Compare-at price cannot be negative"],
      default: null,
    },

    images: {
      type: [String],
      default: [],
    },

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.index({ store: 1, slug: 1 }, { unique: true });

productSchema.index(
  { store: 1, sku: 1 },
  {
    unique: true,
    partialFilterExpression: { sku: { $type: "string" } },
  }
);

productSchema.index({ store: 1, category: 1 });
productSchema.index({ store: 1, status: 1 });
productSchema.index({ store: 1, name: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;