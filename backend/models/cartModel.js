import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
  },
  { timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },

    guestTokenHash: {
      type: String,
      default: undefined,
      select: false,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

cartSchema.index(
  { store: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: { $type: "objectId" },
    },
  }
);

cartSchema.index(
  { store: 1, guestTokenHash: 1 },
  {
    unique: true,
    partialFilterExpression: {
      guestTokenHash: { $type: "string" },
    },
  }
);

cartSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;