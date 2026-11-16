import express from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
} from "../controllers/product.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createProduct)
  .get(getProducts);

router.patch("/:productId/stock", updateProductStock);

router.route("/:productId")
  .get(getProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

export default router;