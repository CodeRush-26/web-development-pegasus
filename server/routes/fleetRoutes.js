/**
 * routes/fleetRoutes.js — Fleet REST API Routes
 *
 * REST endpoints for static fleet data (ports, initial state).
 * Live data comes via WebSocket — these are for initialization only.
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { PORTS_MAP, INITIAL_FLEET, NAVIGABLE_POLYGON, BOUNDING_BOX } from "../data/fleet.js";
import { getAllSnapshots, getSnapshotAt, getTimelineMarkers } from "../snapshots/snapshotStore.js";
import { getFleetArray, getAlertsArray } from "../simulator/engine.js";
import zoneStore from "../geofencing/zoneStore.js";

const router = express.Router();

/**
 * GET /api/fleet/static
 * Returns ports, navigable polygon, and bounding box.
 * Public — needed before WebSocket auth for map initialization.
 */
router.get("/static", (_, res) => {
  res.json({
    ports: Array.from(PORTS_MAP.values()),
    navigablePolygon: NAVIGABLE_POLYGON,
    boundingBox: BOUNDING_BOX,
  });
});

/**
 * GET /api/fleet/state
 * Returns current live fleet state snapshot via REST.
 * Useful for first-load before WebSocket connects.
 */
router.get("/state", protect, (_, res) => {
  res.json({
    ships: getFleetArray(),
    alerts: getAlertsArray(),
    zones: zoneStore.getAllZones(),
  });
});

/**
 * GET /api/fleet/snapshots
 * Returns timestamp list of all stored snapshots.
 */
router.get("/snapshots", protect, (_, res) => {
  res.json({
    snapshots: getAllSnapshots().map((s) => ({ timestamp: s.timestamp })),
  });
});

/**
 * GET /api/fleet/snapshots/:timestamp
 * Returns the snapshot closest to the given Unix timestamp.
 */
router.get("/snapshots/:timestamp", protect, (req, res) => {
  const ts = parseInt(req.params.timestamp, 10);
  if (isNaN(ts)) return res.status(400).json({ message: "Invalid timestamp" });
  const snap = getSnapshotAt(ts);
  if (!snap) return res.status(404).json({ message: "No snapshots available yet" });
  res.json(snap);
});

/**
 * GET /api/fleet/timeline-markers
 * Returns alert event markers for the playback timeline UI.
 */
router.get("/timeline-markers", protect, (_, res) => {
  res.json({ markers: getTimelineMarkers() });
});

export default router;
