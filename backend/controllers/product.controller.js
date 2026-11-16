import mongoose from "mongoose";

import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Store from "../models/storeModel.js";
import { createSlug } from "../utils/createSlug.js";

const getMerchantStore = async (userId) => {
  return Store.findOne({ owner: userId });
};

const getProductResponse = (product) => ({
  id: product._id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  images: product.images,
  sku: product.sku,
  stockQuantity: product.stockQuantity,
  status: product.status,
  isFeatured: product.isFeatured,
  category: product.category,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const validateImages = (images) => {
  if (!Array.isArray(images) || images.length > 10) {
    return false;
  }

  return images.every((image) => {
    if (typeof image !== "string" || !image.trim()) {
      return false;
    }

    try {
      const url = new URL(image);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  });
};

const validateNumber = (value) => {
  return typeof value === "number" && Number.isFinite(value);
};

const validateCategory = async (categoryId, storeId) => {
  if (categoryId === null || categoryId === "") {
    return { valid: true, category: null };
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return { valid: false };
  }

  const category = await Category.findOne({
    _id: categoryId,
    store: storeId,
  });

  if (!category || !category.isActive) {
    return { valid: false };
  }

  return { valid: true, category: category._id };
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      images,
      sku,
      stockQuantity,
      category,
      status,
      isFeatured,
    } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Product name must contain 2 to 150 characters",
      });
    }

    if (!validateNumber(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "A valid non-negative product price is required",
      });
    }

    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      (!validateNumber(compareAtPrice) || compareAtPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Compare-at price must be a valid non-negative number",
      });
    }

    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      compareAtPrice <= price
    ) {
      return res.status(400).json({
        success: false,
        message: "Compare-at price must be greater than the selling price",
      });
    }

    if (
      stockQuantity !== undefined &&
      (!Number.isInteger(stockQuantity) || stockQuantity < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative whole number",
      });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be text",
      });
    }

    if (
      description !== undefined &&
      description.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 5000 characters",
      });
    }

    if (images !== undefined && !validateImages(images)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array of up to 10 valid HTTP or HTTPS URLs",
      });
    }

    if (
      status !== undefined &&
      !["draft", "published"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Product status must be draft or published",
      });
    }

    if (
      isFeatured !== undefined &&
      typeof isFeatured !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isFeatured must be true or false",
      });
    }

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Create your store before adding products",
      });
    }

    const slug = createSlug(name);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid product name",
      });
    }

    const existingProduct = await Product.findOne({
      store: store._id,
      slug,
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this name already exists in your store",
      });
    }

    let categoryId = null;

    if (category !== undefined && category !== null && category !== "") {
      const result = await validateCategory(category, store._id);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: "The selected category is invalid or inactive",
        });
      }

      categoryId = result.category;
    }

    const cleanSku = sku ? String(sku).trim().toUpperCase() : null;

    if (cleanSku) {
      const existingSku = await Product.findOne({
        store: store._id,
        sku: cleanSku,
      });

      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: "This SKU is already used by another product",
        });
      }
    }

    const product = await Product.create({
      store: store._id,
      category: categoryId,
      name: name.trim(),
      slug,
      description: description || "",
      price,
      compareAtPrice: compareAtPrice ?? null,
      images: images || [],
      sku: cleanSku,
      stockQuantity: stockQuantity ?? 0,
      status: status || "draft",
      isFeatured: isFeatured ?? false,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: getProductResponse(product),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with this name or SKU already exists in your store",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const {
      search = "",
      category,
      status,
      page = "1",
      limit = "10",
      sort = "newest",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    if (
      status &&
      !["draft", "published"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status filter",
      });
    }

    if (
      category &&
      !mongoose.Types.ObjectId.isValid(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const filter = { store: store._id };

    if (search.trim()) {
      filter.name = {
        $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (category) filter.category = category;
    if (status) filter.status = status;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
      name_az: { name: 1 },
      name_za: { name: -1 },
    };

    if (!sortOptions[sort]) {
      return res.status(400).json({
        success: false,
        message: "Invalid sorting option",
      });
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOptions[sort])
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      products: products.map(getProductResponse),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: req.params.productId,
      store: store._id,
    }).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product: getProductResponse(product),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "price",
      "compareAtPrice",
      "images",
      "sku",
      "stockQuantity",
      "category",
      "status",
      "isFeatured",
    ];

    const unknownFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Unsupported fields: ${unknownFields.join(", ")}`,
      });
    }

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: req.params.productId,
      store: store._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const data = req.body;

    if (data.name !== undefined) {
      if (
        typeof data.name !== "string" ||
        data.name.trim().length < 2 ||
        data.name.trim().length > 150
      ) {
        return res.status(400).json({
          success: false,
          message: "Product name must contain 2 to 150 characters",
        });
      }

      const newSlug = createSlug(data.name);

      const duplicate = await Product.findOne({
        store: store._id,
        slug: newSlug,
        _id: { $ne: product._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A product with this name already exists",
        });
      }

      product.name = data.name.trim();
      product.slug = newSlug;
    }

    if (data.description !== undefined) {
      if (
        typeof data.description !== "string" ||
        data.description.length > 5000
      ) {
        return res.status(400).json({
          success: false,
          message: "Description must be text and cannot exceed 5000 characters",
        });
      }

      product.description = data.description.trim();
    }

    if (data.price !== undefined) {
      if (!validateNumber(data.price) || data.price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }

      product.price = data.price;
    }

    if (data.compareAtPrice !== undefined) {
      if (
        data.compareAtPrice !== null &&
        (!validateNumber(data.compareAtPrice) || data.compareAtPrice < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "Compare-at price must be a valid non-negative number",
        });
      }

      product.compareAtPrice = data.compareAtPrice;
    }

    if (
      product.compareAtPrice !== null &&
      product.compareAtPrice <= product.price
    ) {
      return res.status(400).json({
        success: false,
        message: "Compare-at price must be greater than the selling price",
      });
    }

    if (data.images !== undefined) {
      if (!validateImages(data.images)) {
        return res.status(400).json({
          success: false,
          message: "Images must be an array of up to 10 valid HTTP or HTTPS URLs",
        });
      }

      product.images = data.images;
    }

    if (data.sku !== undefined) {
      const cleanSku = data.sku
        ? String(data.sku).trim().toUpperCase()
        : null;

      if (cleanSku) {
        const duplicateSku = await Product.findOne({
          store: store._id,
          sku: cleanSku,
          _id: { $ne: product._id },
        });

        if (duplicateSku) {
          return res.status(409).json({
            success: false,
            message: "This SKU is already used by another product",
          });
        }
      }

      product.sku = cleanSku;
    }

    if (data.stockQuantity !== undefined) {
      if (
        !Number.isInteger(data.stockQuantity) ||
        data.stockQuantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Stock quantity must be a non-negative whole number",
        });
      }

      product.stockQuantity = data.stockQuantity;
    }

    if (data.category !== undefined) {
      const result = await validateCategory(data.category, store._id);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: "The selected category is invalid or inactive",
        });
      }

      product.category = result.category;
    }

    if (data.status !== undefined) {
      if (!["draft", "published"].includes(data.status)) {
        return res.status(400).json({
          success: false,
          message: "Product status must be draft or published",
        });
      }

      product.status = data.status;
    }

    if (data.isFeatured !== undefined) {
      if (typeof data.isFeatured !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isFeatured must be true or false",
        });
      }

      product.isFeatured = data.isFeatured;
    }

    await product.save();
    await product.populate("category", "name slug");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: getProductResponse(product),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with this name or SKU already exists in your store",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.productId,
      store: store._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const { stockQuantity } = req.body;

    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative whole number",
      });
    }

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.productId,
        store: store._id,
      },
      { $set: { stockQuantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product stock updated successfully",
      product: getProductResponse(product),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product stock",
    });
  }
};