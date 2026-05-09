import express from "express";
import {
  createInvite,
  listInvites,
  revokeInvite,
} from "../controllers/inviteController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../controllers/userController.js";

const router = express.Router();

// All invite routes require admin privileges
router.use(protect);
router.use(isAdmin);

router.post("/", createInvite);
router.get("/", listInvites);
router.delete("/:id", revokeInvite);

export default router;
