import express from "express";
import {
  getMerchantCustomers,
  getMerchantCustomer,
} from "../controllers/customer.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMerchantCustomers);
router.get("/:email", getMerchantCustomer);

export default router;
