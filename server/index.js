import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import fleetRoutes from "./routes/fleetRoutes.js";
import pushRoutes from "./routes/pushRoutes.js";

import { createWebSocketServer } from "./websocket/server.js";
import { startSimulator, stopSimulator } from "./simulator/engine.js";
import { startWeatherRefresh, stopWeatherRefresh } from "./weather/weatherCache.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL ?? "http://localhost:5173",
    ],
  })
);

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/fleet", fleetRoutes);
app.use("/api/push", pushRoutes);

app.get("/", (_, res) => res.send("Fleet Command Server — running"));

// ─── HTTP + WebSocket Server ────────────────────────────────────────────────────
const httpServer = http.createServer(app);
const wss = createWebSocketServer(httpServer);

// ─── Database + Service Boot ───────────────────────────────────────────────────
mongoose.set("strictQuery", false);

const db = mongoose.connection;

db.once("open", async () => {
  console.log("[DB] MongoDB connected");

  // Start weather cache (fetches immediately, then every 30 min)
  await startWeatherRefresh();

  // Start the 1Hz fleet simulator (requires weather cache to be ready)
  startSimulator(wss);
});

db.on("error", (err) => console.error("[DB] Error:", err));
db.on("disconnected", () => console.warn("[DB] Disconnected"));

mongoose.connect(process.env.MONGO_URI);

// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM received — shutting down");
  stopSimulator();
  stopWeatherRefresh();
  httpServer.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
  console.log(`[Server] WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
