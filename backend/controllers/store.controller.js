import Store from "../models/storeModel.js";

import { createSlug, isReservedSlug } from "../utils/createSlug.js";

const getStoreResponse = (store) => ({
  id: store._id,
  name: store.name,
  slug: store.slug,
  description: store.description,
  logo: store.logo,
  themeSettings: store.themeSettings,
  contactDetails: store.contactDetails,
  currency: store.currency,
  status: store.status,
  createdAt: store.createdAt,
  updatedAt: store.updatedAt,
});

export const createStore = async (req, res, next) => {
  try {
    const { name, description, contactDetails } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }

    const storeName = name.trim();

    if (storeName.length < 2 || storeName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Store name must contain between 2 and 100 characters",
      });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Store description must be text",
      });
    }

    if (
      description &&
      description.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Store description cannot exceed 1000 characters",
      });
    }

    if (
      contactDetails !== undefined &&
      (typeof contactDetails !== "object" ||
        contactDetails === null ||
        Array.isArray(contactDetails))
    ) {
      return res.status(400).json({
        success: false,
        message: "Contact details must be a valid object",
      });
    }

    const existingStore = await Store.findOne({
      owner: req.user._id,
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "You already have a store associated with this account",
      });
    }

    const slug = createSlug(storeName);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Store name must contain letters or numbers",
      });
    }

    if (isReservedSlug(slug)) {
      return res.status(400).json({
        success: false,
        message: "This store name cannot be used. Please choose another name",
      });
    }

    const existingSlug = await Store.findOne({ slug });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "This store URL is already taken. Please choose another name",
      });
    }

    const store = await Store.create({
      name: storeName,
      slug,
      owner: req.user._id,
      description: description?.trim() || "",
      contactDetails: contactDetails || {},
      currency: "NGN",
      status: "setup",
    });

    res.status(201).json({
      success: true,
      message: "Your store has been created successfully",
      store: getStoreResponse(store),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A store with this URL or account already exists",
      });
    }

    next(error);
  }
};

export const getMyStore = async (req, res, next) => {
  try {
    const store = await Store.findOne({
      owner: req.user._id,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "You have not created a store yet",
      });
    }

    res.status(200).json({
      success: true,
      store: getStoreResponse(store),
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyStore = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "logo",
      "contactDetails",
      "themeSettings",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid store details were provided",
      });
    }

    if (updates.name !== undefined) {
      if (
        typeof updates.name !== "string" ||
        updates.name.trim().length < 2 ||
        updates.name.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Store name must contain between 2 and 100 characters",
        });
      }

      updates.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      if (
        typeof updates.description !== "string" ||
        updates.description.trim().length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "Description must be text and cannot exceed 1000 characters",
        });
      }

      updates.description = updates.description.trim();
    }

    const store = await Store.findOneAndUpdate(
      { owner: req.user._id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "You have not created a store yet",
      });
    }

    res.status(200).json({
      success: true,
      message: "Store updated successfully",
      store: getStoreResponse(store),
    });
  } catch (error) {
    next(error);
  }
};
export const activateMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (store.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "A suspended store cannot be activated. Contact support.",
      });
    }

    if (store.status === "active") {
      return res.status(200).json({
        success: true,
        message: "Your store is already active",
        store: getStoreResponse(store),
      });
    }

    if (!store.name || !store.slug) {
      return res.status(400).json({
        success: false,
        message: "Your store name and URL must be configured first",
      });
    }

    if (
      !store.contactDetails?.email ||
      !store.contactDetails?.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Add your store contact email and phone number before activation",
      });
    }

    store.status = "active";
    await store.save();

    return res.status(200).json({
      success: true,
      message: "Your store is now active",
      store: getStoreResponse(store),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to activate your store",
    });
  }
};