import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};