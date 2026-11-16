import express from "express";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.controller.js";

import { optionalProtect } from "../middleware/optional-auth.middleware.js";

const router = express.Router();

router.use(optionalProtect);
router.get("/:slug/cart", getCart);
router.post("/:slug/cart/items", addCartItem);
router.patch("/:slug/cart/items/:itemId", updateCartItem);
router.delete("/:slug/cart/items/:itemId", removeCartItem);

export default router;