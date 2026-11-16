import express from "express";
import {
  getPublicStore,
  getPublicProducts,
  getPublicProduct,
  getPublicCategories,
} from "../controllers/storefront.controller.js";

const router = express.Router();

router.get("/:slug/products/:productSlug", getPublicProduct);
router.get("/:slug/products", getPublicProducts);
router.get("/:slug/categories", getPublicCategories);
router.get("/:slug", getPublicStore);

export default router;