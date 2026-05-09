import User from "../models/User.js";
import Invite from "../models/Invite.js";
import {
  sendOTP,
  generateOTP,
  sendPasswordReset,
} from "../services/emailService.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, isGoogle } = req.body;

    // Check if user is invited
    const invite = await Invite.findOne({ email: email.toLowerCase() });
    if (!invite) {
      return res
        .status(403)
        .json({
          message:
            "Access not authorized. Contact Fleet Command administrator.",
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user with role from invite
    const user = new User({
      name,
      email,
      password: isGoogle ? undefined : password,
      isGoogle: isGoogle || false,
      role: invite.role,
      assignedShipId: invite.assignedShipId,
      otp: {
        code: otp,
        expiresAt: otpExpiry,
      },
    });

    await user.save();

    // Mark invite as accepted
    invite.status = "accepted";
    await invite.save();

    // Send OTP email
    if (!isGoogle) {
      const emailSent = await sendOTP(email, otp);
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    }

    res.status(201).json({
      message: isGoogle
        ? "User registered successfully"
        : "OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password, isGoogle } = req.body;

    // Check if user is invited (block existing users without invites)
    const invite = await Invite.findOne({ email: email.toLowerCase() });
    if (!invite) {
      return res
        .status(403)
        .json({
          message:
            "Access not authorized. Contact Fleet Command administrator.",
        });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is verified
    if (!user.isVerified && !isGoogle) {
      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user's OTP
      user.otp = {
        code: otp,
        expiresAt: otpExpiry,
      };
      await user.save();

      // Send new OTP
      const emailSent = await sendOTP(email, otp);
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send OTP" });
      }

      return res.status(200).json({
        message: "Please verify your email",
        needsVerification: true,
      });
    }

    // For non-Google users, verify password
    if (!isGoogle) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // Generate JWT token — include id, role, assignedShipId for WS auth
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        role: user.role,
        assignedShipId: user.assignedShipId ?? null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isGoogle: user.isGoogle,
        role: user.role,
        assignedShipId: user.assignedShipId ?? null,
        onBoardingComplete: user.onBoardingComplete,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Update user
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// Google authentication
export const googleAuth = async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;

    // Check if user is invited
    const invite = await Invite.findOne({ email: email.toLowerCase() });
    if (!invite) {
      return res
        .status(403)
        .json({
          message:
            "Access not authorized. Contact Fleet Command administrator.",
        });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name,
        email,
        isGoogle: true,
        isVerified: true,
        role: invite.role,
        assignedShipId: invite.assignedShipId,
        profilePicture,
      });
      await user.save();

      // Mark invite as accepted
      invite.status = "accepted";
      await invite.save();
    }

    // Generate JWT token — include id, role, assignedShipId for WS auth
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        role: user.role,
        assignedShipId: user.assignedShipId ?? null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isGoogle: user.isGoogle,
        role: user.role,
        assignedShipId: user.assignedShipId ?? null,
        onBoardingComplete: user.onBoardingComplete,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res
        .status(200)
        .json({ message: "If email exists, a reset link will be sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save token and expiry to user
    user.passwordReset = {
      token: resetTokenHash,
      expiresAt: resetTokenExpiry,
    };
    await user.save();

    // Send reset email with token
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    const emailSent = await sendPasswordReset(email, resetLink);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.json({ message: "If email exists, a reset link will be sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Failed to process forgot password request" });
  }
}

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    // Validate input
    if (!token || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify token exists
    if (!user.passwordReset || !user.passwordReset.token) {
      return res.status(400).json({ message: "No reset token found" });
    }

    // Hash the provided token and compare
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== user.passwordReset.token) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Check if token expired
    if (new Date() > user.passwordReset.expiresAt) {
      user.passwordReset = undefined;
      await user.save();
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Update password
    user.password = password;
    user.passwordReset = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
