import mongoose from "mongoose";

import Store from "../models/storeModel.js";
import DeliverySettings from "../models/deliverySettingsModel.js";

const getMerchantStore = async (userId) => {
  return Store.findOne({ owner: userId });
};

export const getDeliverySettings = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "You need to create a store first",
      });
    }

    let settings = await DeliverySettings.findOne({
      store: store._id,
    });

    if (!settings) {
      settings = await DeliverySettings.create({
        store: store._id,
        zones: [],
        isDeliveryEnabled: true,
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get delivery settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve delivery settings",
    });
  }
};

export const updateDeliverySettings = async (req, res) => {
  try {
    const { zones, isDeliveryEnabled } = req.body;

    if (!Array.isArray(zones)) {
      return res.status(400).json({
        success: false,
        message: "Delivery zones must be an array",
      });
    }

    if (
      isDeliveryEnabled !== undefined &&
      typeof isDeliveryEnabled !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isDeliveryEnabled must be true or false",
      });
    }

    if (zones.length > 100) {
      return res.status(400).json({
        success: false,
        message: "You cannot create more than 100 delivery zones",
      });
    }

    const validatedZones = [];

    for (const zone of zones) {
      if (
        !zone.name ||
        typeof zone.name !== "string" ||
        !zone.name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Every delivery zone needs a name",
        });
      }

      if (
        !Array.isArray(zone.states) ||
        zone.states.length === 0 ||
        !zone.states.every(
          (state) => typeof state === "string" && state.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `A valid state is required for ${zone.name}`,
        });
      }

      if (
        !Array.isArray(zone.cities ?? []) ||
        !(zone.cities ?? []).every(
          (city) => typeof city === "string" && city.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid cities in ${zone.name}`,
        });
      }

      if (
        typeof zone.fee !== "number" ||
        !Number.isFinite(zone.fee) ||
        zone.fee < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `A valid delivery fee is required for ${zone.name}`,
        });
      }

      if (
        zone.isActive !== undefined &&
        typeof zone.isActive !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid active status for ${zone.name}`,
        });
      }

      if (
        zone._id !== undefined &&
        !mongoose.Types.ObjectId.isValid(zone._id)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid delivery zone ID for ${zone.name}`,
        });
      }

      validatedZones.push({
        ...(zone._id ? { _id: zone._id } : {}),
        name: zone.name.trim(),
        states: [
          ...new Set(zone.states.map((state) => state.trim())),
        ],
        cities: [
          ...new Set(
            (zone.cities ?? []).map((city) => city.trim())
          ),
        ],
        fee: zone.fee,
        isActive: zone.isActive ?? true,
      });
    }

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "You need to create a store first",
      });
    }

    const settings = await DeliverySettings.findOneAndUpdate(
      { store: store._id },
      {
        $set: {
          zones: validatedZones,
          ...(isDeliveryEnabled !== undefined
            ? { isDeliveryEnabled }
            : {}),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Delivery settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update delivery settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery settings",
    });
  }
};