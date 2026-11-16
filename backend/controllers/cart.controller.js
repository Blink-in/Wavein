
import crypto from "crypto";
import mongoose from "mongoose";

import Cart from "../models/cartModel.js";
import Store from "../models/storeModel.js";
import Product from "../models/productModel.js";

const GUEST_COOKIE_NAME = "wavebuy_guest_cart";
const GUEST_CART_DAYS = 30;

const createGuestToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashGuestToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const setGuestCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(GUEST_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: GUEST_CART_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

const getActiveStore = async (slug) => {
  return Store.findOne({
    slug: slug.toLowerCase(),
    status: "active",
  });
};

const getOrCreateCart = async (req, res, storeId) => {
  let identity;

  if (req.user) {
    identity = {
      user: req.user._id,
    };
  } else {
    let guestToken = req.cookies?.[GUEST_COOKIE_NAME];

    if (!guestToken || !/^[a-f0-9]{64}$/i.test(guestToken)) {
      guestToken = createGuestToken();
      setGuestCookie(res, guestToken);
    }

    identity = {
      guestTokenHash: hashGuestToken(guestToken),
    };
  }

  const filter = {
    store: storeId,
    ...identity,
  };

  let cart = await Cart.findOne(filter);

  if (cart) {
    return cart;
  }

  const cartData = {
    ...filter,
    items: [],
  };

  if (identity.guestTokenHash) {
    cartData.expiresAt = new Date(
      Date.now() + GUEST_CART_DAYS * 24 * 60 * 60 * 1000
    );
  }

  try {
    cart = await Cart.create(cartData);
    return cart;
  } catch (error) {
    if (error.code === 11000) {
      return Cart.findOne(filter);
    }

    throw error;
  }
};

const getCartResponse = (cart, store) => {
  let subtotal = 0;

  const items = cart.items.map((item) => {
    const product = item.product;

    const available =
      product &&
      product.store?.toString() === store._id.toString() &&
      product.status === "published" &&
      product.stockQuantity >= item.quantity;

    const unitPrice = product?.price ?? 0;
    const lineTotal = available ? unitPrice * item.quantity : 0;

    subtotal += lineTotal;

    return {
      id: item._id,
      product: product
        ? {
            id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            images: product.images,
            stockQuantity: product.stockQuantity,
          }
        : null,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      available: Boolean(available),
    };
  });

  return {
    id: cart._id,
    store: {
      id: store._id,
      name: store.name,
      slug: store.slug,
      currency: store.currency,
    },
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal,
    updatedAt: cart.updatedAt,
  };
};

const populateCart = async (cart) => {
  await cart.populate({
    path: "items.product",
    select: "name slug price images stockQuantity status store",
  });

  return cart;
};

export const getCart = async (req, res) => {
  try {
    const store = await getActiveStore(req.params.slug);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    const cart = await getOrCreateCart(req, res, store._id);

    await populateCart(cart);

    return res.status(200).json({
      success: true,
      cart: getCartResponse(cart, store),
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve cart",
    });
  }
};

export const addCartItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "A valid product ID is required",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    const store = await getActiveStore(req.params.slug);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      store: store._id,
      status: "published",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unavailable",
      });
    }

    if (product.stockQuantity < 1) {
      return res.status(409).json({
        success: false,
        message: "This product is out of stock",
      });
    }

    const cart = await getOrCreateCart(req, res, store._id);

    const existingItem = cart.items.find(
      (item) => item.product.toString() === product._id.toString()
    );

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > product.stockQuantity) {
      return res.status(409).json({
        success: false,
        message: `Only ${product.stockQuantity} units are currently available`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
      });
    }

    if (!req.user) {
      cart.expiresAt = new Date(
        Date.now() + GUEST_CART_DAYS * 24 * 60 * 60 * 1000
      );
    }

    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: getCartResponse(cart, store),
    });
  } catch (error) {
    console.error("Add cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    const store = await getActiveStore(req.params.slug);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    const cart = await getOrCreateCart(req, res, store._id);

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const product = await Product.findOne({
      _id: item.product,
      store: store._id,
      status: "published",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "This product is no longer available",
      });
    }

    if (quantity > product.stockQuantity) {
      return res.status(409).json({
        success: false,
        message: `Only ${product.stockQuantity} units are currently available`,
      });
    }

    item.quantity = quantity;

    if (!req.user) {
      cart.expiresAt = new Date(
        Date.now() + GUEST_CART_DAYS * 24 * 60 * 60 * 1000
      );
    }

    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart: getCartResponse(cart, store),
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const store = await getActiveStore(req.params.slug);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    const cart = await getOrCreateCart(req, res, store._id);

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.deleteOne();

    if (!req.user) {
      cart.expiresAt = new Date(
        Date.now() + GUEST_CART_DAYS * 24 * 60 * 60 * 1000
      );
    }

    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: getCartResponse(cart, store),
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
    });
  }
};
