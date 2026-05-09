import express from "express";
import {
  register,
  login,
  verifyOTP,
  googleAuth,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Verify OTP route
router.post("/verify-otp", verifyOTP);

// Google authentication route
router.post("/google", googleAuth);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password", resetPassword);

export default router;
