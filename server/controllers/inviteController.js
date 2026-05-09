import Invite from "../models/Invite.js";
import { sendInviteEmail } from "../services/emailService.js";

// Create a new invite - Admin only
export const createInvite = async (req, res) => {
  try {
    const { email, role, assignedShipId } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // Check if invite already exists
    const existingInvite = await Invite.findOne({ email: email.toLowerCase() });
    if (existingInvite) {
      return res.status(400).json({ message: "An invite for this email already exists" });
    }

    const invite = new Invite({
      email: email.toLowerCase(),
      role,
      assignedShipId: assignedShipId || null,
      invitedBy: req.user._id,
      status: "pending",
    });

    await invite.save();

    // Send invitation email
    const inviteLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/register?email=${encodeURIComponent(invite.email)}`;
    await sendInviteEmail(invite.email, invite.role, inviteLink);

    res.status(201).json(invite);
  } catch (error) {
    console.error("Create invite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// List all invites - Admin only
export const listInvites = async (req, res) => {
  try {
    const invites = await Invite.find().populate("invitedBy", "name email");
    res.json(invites);
  } catch (error) {
    console.error("List invites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Revoke (delete) an invite - Admin only
export const revokeInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const invite = await Invite.findByIdAndDelete(id);

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    res.json({ message: "Invite revoked successfully" });
  } catch (error) {
    console.error("Revoke invite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
