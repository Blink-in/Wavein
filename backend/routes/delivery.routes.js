import express from "express";

import {
  getDeliverySettings,
  updateDeliverySettings,
} from "../controllers/delivery.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/settings", getDeliverySettings);
router.patch("/settings", updateDeliverySettings);

export default router;