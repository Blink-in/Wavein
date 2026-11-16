import mongoose from "mongoose";
import Store from "../models/storeModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

const getActiveStore = async (slug) => {
  return Store.findOne({
    slug: slug.toLowerCase(),
    status: "active",
  }).select(
    "name slug description logo themeSettings contactDetails currency createdAt"
  );
};

export const getPublicStore = async (req, res) => {
  try {
    const store = await getActiveStore(req.params.slug);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    return res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve store",
    });
  }
};

export const getPublicProducts = async (req, res) => {
  try {
    const store = await getActiveStore(req.params.slug);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    const {
      search = "",
      category,
      page = "1",
      limit = "12",
      sort = "newest",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values",
      });
    }

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

    const filter = {
      store: store._id,
      status: "published",
    };

    if (search.trim()) {
      filter.name = {
        $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (category) {
      const selectedCategory = await Category.findOne({
        store: store._id,
        slug: category.toLowerCase(),
        isActive: true,
      });

      if (!selectedCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      filter.category = selectedCategory._id;
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .select(
        "name slug description price compareAtPrice images stockQuantity category isFeatured createdAt"
      )
      .populate({
        path: "category",
        select: "name slug",
        match: { store: store._id, isActive: true },
      })
      .sort(sortOptions[sort])
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      store: {
        name: store.name,
        slug: store.slug,
        currency: store.currency,
      },
      count: products.length,
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve store products",
    });
  }
};

export const getPublicProduct = async (req, res) => {
  try {
    const store = await getActiveStore(req.params.slug);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    const product = await Product.findOne({
      store: store._id,
      slug: req.params.productSlug.toLowerCase(),
      status: "published",
    })
      .select(
        "name slug description price compareAtPrice images stockQuantity category isFeatured createdAt"
      )
      .populate({
        path: "category",
        select: "name slug",
        match: { store: store._id, isActive: true },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      store: {
        name: store.name,
        slug: store.slug,
        currency: store.currency,
      },
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
    });
  }
};

export const getPublicCategories = async (req, res) => {
  try {
    const store = await getActiveStore(req.params.slug);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable",
      });
    }

    const categories = await Category.find({
      store: store._id,
      isActive: true,
    })
      .select("name slug description")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
};