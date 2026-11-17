import express from "express";

import {
  getPaystackBanks,
  getMyPaymentConfig,
  connectPaystackAccount,
  initializePaystackPayment,
  verifyPaystackPayment,
} from "../controllers/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { optionalProtect } from "../middleware/optional-auth.middleware.js";

const router = express.Router();

// Merchant payment account management
router.get("/banks", protect, getPaystackBanks);
router.get("/config", protect, getMyPaymentConfig);
router.post("/connect", protect, connectPaystackAccount);

// Customer payment
router.post("/initialize", optionalProtect, initializePaystackPayment);
router.get("/verify/:reference", optionalProtect, verifyPaystackPayment);

export default router;