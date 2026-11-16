import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createCategory)
  .get(getCategories);

router.route("/:categoryId")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

export default router;