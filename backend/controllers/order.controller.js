import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/orderModel.js";
import Store from "../models/storeModel.js";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getMerchantStore = async (userId) => {
  return Store.findOne({ owner: userId });
};

const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const getMyOrders = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const filter = {
      "customer.user": req.user._id,
    };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("store", "name slug logo"),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your orders",
    });
  }
};

export const getMerchantOrders = async (req, res) => {
  try {
    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const { page, limit, skip } = getPagination(req);

    const filter = {
      store: store._id,
    };

    if (req.query.status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status filter",
        });
      }

      filter.orderStatus = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get merchant orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve store orders",
    });
  }
};

export const getMerchantOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      store: store._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get merchant order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    if (
      note !== undefined &&
      (typeof note !== "string" || note.length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Order status note cannot exceed 500 characters",
      });
    }

    const store = await getMerchantStore(req.user._id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      store: store._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const allowedTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    if (!allowedTransitions[order.orderStatus]?.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "shipped") {
      order.delivery.status = "shipped";
    }

    if (orderStatus === "delivered") {
      order.delivery.status = "delivered";
    }

    order.timeline.push({
      status: orderStatus,
      note: note?.trim() || `Order status changed to ${orderStatus}`,
      actor: req.user._id,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const trackGuestOrder = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    if (!/^[a-f0-9]{64}$/i.test(trackingToken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tracking token",
      });
    }

    const order = await Order.findOne({
      trackingTokenHash: hashToken(trackingToken),
    }).select("+trackingTokenHash");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Check your tracking token.",
      });
    }

    return res.status(200).json({
      success: true,
      order: order.toJSON(),
    });
  } catch (error) {
    console.error("Track guest order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to track order",
    });
  }
};