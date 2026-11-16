import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import storeRoutes from "./routes/store.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import storefrontRoutes from "./routes/storefront.routes.js";
import cartRoutes from "./routes/cart.routes.js";

import { connectDB } from "./config/db.js";
import {notFound} from "./middleware/notFound.middleware.js";
import {errorHandler} from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    strictTransportSecurity: isProduction ? undefined : false,
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Wavebuy API",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Wavebuy API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/storefront", storefrontRoutes);
app.use("/api/storefront", cartRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Wavebuy API is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start Wavebuy API:", error.message);
    process.exit(1);
  }
};

startServer();