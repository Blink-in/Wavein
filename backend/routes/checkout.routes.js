import express from "express";

import { createCheckout } from "../controllers/checkout.controller.js";
import { optionalProtect } from "../middleware/optional-auth.middleware.js";

const router = express.Router();

router.use(optionalProtect);
router.post("/:slug/checkout", createCheckout);

export default router;