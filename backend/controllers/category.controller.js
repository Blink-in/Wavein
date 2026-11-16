import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import Store from "../models/storeModel.js";
import { createSlug } from "../utils/createSlug.js";

const getMerchantStore = async (userId) => {
  return Store.findOne({ owner: userId });
};

const getCategoryResponse = (category) => ({
  id: category._id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  isActive: category.isActive,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Create your store before adding categories",
      });
    }

    const slug = createSlug(name);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid category name",
      });
    }

    const existingCategory = await Category.findOne({
      store: store._id,
      slug,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const category = await Category.create({
      store: store._id,
      name: name.trim(),
      slug,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: getCategoryResponse(category),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const categories = await Category.find({ store: store._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories: categories.map(getCategoryResponse),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const category = await Category.findOne({
      _id: req.params.categoryId,
      store: store._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category: getCategoryResponse(category),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const category = await Category.findOne({
      _id: req.params.categoryId,
      store: store._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 80
      ) {
        return res.status(400).json({
          success: false,
          message: "Category name must contain 2 to 80 characters",
        });
      }

      const newSlug = createSlug(name);

      const duplicate = await Category.findOne({
        store: store._id,
        slug: newSlug,
        _id: { $ne: category._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A category with this name already exists",
        });
      }

      category.name = name.trim();
      category.slug = newSlug;
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        description.length > 500
      ) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 500 characters",
        });
      }

      category.description = description.trim();
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      category.isActive = isActive;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: getCategoryResponse(category),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const category = await Category.findOne({
      _id: req.params.categoryId,
      store: store._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productsUsingCategory = await Product.exists({
      store: store._id,
      category: category._id,
    });

    if (productsUsingCategory) {
      return res.status(409).json({
        success: false,
        message: "This category contains products. Move or remove those products before deleting it.",
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};