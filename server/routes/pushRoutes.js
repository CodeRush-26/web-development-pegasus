import express from "express";
import { getPublicKey, saveSubscription } from "../services/pushService.js";

const router = express.Router();

router.get("/vapid-public-key", (req, res) => {
  res.status(200).json({ publicKey: getPublicKey() });
});

router.post("/subscribe", (req, res) => {
  const { subscription, userId } = req.body;
  if (!subscription || !userId) {
    return res.status(400).json({ message: "Subscription and userId are required" });
  }

  saveSubscription(userId, subscription);
  res.status(201).json({ message: "Subscribed successfully" });
});

export default router;
