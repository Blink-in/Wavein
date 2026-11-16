import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import {
  setAuthCookie,
  clearAuthCookie,
} from "../utils/authCookie.js";

const createUserResponse = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  platformRole: user.platformRole,
  isEmailVerified: user.isEmailVerified,
});

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email and password are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password cannot exceed 128 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user._id);

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: createUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    const token = generateToken(user._id);

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: createUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: createUserResponse(req.user),
  });
};