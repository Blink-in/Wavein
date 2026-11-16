import express from "express";
import {
  createStore,
  getMyStore,
  updateMyStore,
  activateMyStore,
} from "../controllers/store.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createStore);
router.get("/my-store", getMyStore);
router.patch("/my-store", updateMyStore);
router.patch("/my-store/activate", activateMyStore);

export default router;