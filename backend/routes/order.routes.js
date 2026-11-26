import express from "express";
import {
  getMyOrders,
  getMerchantOrders,
  getMerchantOrder,
  updateOrderStatus,
  trackGuestOrder,
  getMerchantDashboard,
} from "../controllers/order.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Guest tracking must remain public.
router.get("/track/:trackingToken", trackGuestOrder);

router.use(protect);

router.get("/my-orders", getMyOrders);
router.get("/merchant", getMerchantOrders);
router.get("/merchant/dashboard", getMerchantDashboard);
router.get("/merchant/:orderId", getMerchantOrder);
router.patch("/merchant/:orderId/status", updateOrderStatus);
export default router;