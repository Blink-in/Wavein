import jwt from "jsonwebtoken";

import User from "../models/userModel.js";

export const optionalProtect = async (req, res, next) => {
  try {
    const cookieName = process.env.COOKIE_NAME || "wavebuy_token";
    const token = req.cookies?.[cookieName];

    if (!token) {
      return next();
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication configuration is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or your account is inactive",
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication session",
    });
  }
};