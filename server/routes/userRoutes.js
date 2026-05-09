import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  isAdmin,
  changePassword,
  deleteUser,
  updateUserRole,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin route - Get all users
router.get("/", protect, isAdmin, getAllUsers);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/change-password", protect, changePassword);
router.delete("/:id", protect, isAdmin, deleteUser);
router.put("/:id/role", protect, isAdmin, updateUserRole);

export default router;
