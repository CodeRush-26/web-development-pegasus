/**
 * simulator/engine.js — Fleet Simulator Engine
 *
 * The core 1Hz loop. Advances all ships each tick, runs geofencing,
 * proximity checks, snapshots, and broadcasts state to all WebSocket clients.
 *
 * This is the single source of truth for live fleet state.
 */

import { initFleet } from "./shipState.js";
import { advanceShip } from "./physics.js";
import { computeRoute, pathIntersectsZone } from "../pathfinding/routeManager.js";
import { detectBreaches, checkNewZoneAgainstFleet } from "../geofencing/breachDetector.js";
import { checkProximity } from "../alerts/proximityChecker.js";
import { maybeSaveSnapshot, getAllSnapshots, getSnapshotAt, getTimelineMarkers } from "../snapshots/snapshotStore.js";
import { isAdverseAt, getWeatherCells } from "../weather/weatherCache.js";
import { issueDirective, acceptDirective, escalateDirective, getPendingDirective } from "../directives/directiveManager.js";
import { parseDistressMessage } from "../ai/distressParser.js";
import { broadcast, sendToShipCaptain } from "../websocket/server.js";
import { checkNewZoneAgainstFleet as immediateZoneCheck } from "../geofencing/breachDetector.js";
import zoneStore from "../geofencing/zoneStore.js";
import { INITIAL_FLEET, PORTS_MAP } from "../data/fleet.js";
import { randomUUID } from "crypto";

/** @type {Map<string, import('../types/fleet.js').ShipState>} */
let _fleet = initFleet(INITIAL_FLEET);

/**
 * Active alerts registry. Key: alertId, Value: Alert.
 * @type {Map<string, import('../types/fleet.js').Alert>}
 */
const _alerts = new Map();

/** @type {NodeJS.Timeout | null} */
let _tickTimer = null;

/** Reference to WebSocket server for broadcasting */
let _wss = null;

/**
 * Serializes fleet state to array for broadcast.
 *
 * @returns {import('../types/fleet.js').ShipState[]}
 */
function getFleetArray() {
  return Array.from(_fleet.values());
}

/**
 * Serializes alerts to array for broadcast.
 *
 * @returns {import('../types/fleet.js').Alert[]}
 */
function getAlertsArray() {
  return Array.from(_alerts.values());
}

/**
 * Processes one simulator tick.
 */
function _tick() {
  const zones = zoneStore.getAllZones();
  const weatherCells = getWeatherCells();
  const ships = getFleetArray();

  // 1. Advance each ship by one tick
  for (const [id, ship] of _fleet) {
    // Compute initial route if path is empty and ship is active
    let updated = ship;
    if (
      updated.currentPath.length === 0 &&
      updated.status !== "arrived" &&
      updated.status !== "out_of_fuel" &&
      updated.status !== "stopped" &&
      updated.status !== "stranded"
    ) {
      updated = computeRoute(updated, zones, weatherCells);
      if (updated.status === "stranded") {
        _pushAlert({
          alertId: `alert-${randomUUID().slice(0, 8)}`,
          type: "stranded",
          severity: 5,
          shipId: id,
          message: `${updated.name} is stranded — no navigable route to destination`,
          timestamp: Date.now(),
          acknowledged: false,
          relatedShipId: null,
          aiParsed: null,
        });
      }
    }

    // Check if fuel is critically low (< 5% capacity)
    if (updated.fuel / updated.fuelCapacity < 0.05 && updated.status !== "out_of_fuel") {
      if (updated.insufficientFuel !== true) {
        updated = { ...updated, insufficientFuel: true };
        _pushAlert({
          alertId: `alert-${randomUUID().slice(0, 8)}`,
          type: "insufficient_fuel",
          severity: 4,
          shipId: id,
          message: `${updated.name} has critically low fuel (${updated.fuel.toFixed(0)} tons remaining)`,
          timestamp: Date.now(),
          acknowledged: false,
          relatedShipId: null,
          aiParsed: null,
        });
      }
    }

    const weatherPenalty = isAdverseAt(updated.position[0], updated.position[1]);
    updated = advanceShip(updated, weatherPenalty);
    _fleet.set(id, updated);
  }

  // 2. Geofence breach detection
  const breachAlerts = detectBreaches(getFleetArray(), zones);
  for (const alert of breachAlerts) {
    _pushAlert(alert);
    // Trigger re-route for breaching ship
    const ship = _fleet.get(alert.shipId);
    if (ship) {
      const rerouted = { ...computeRoute(ship, zones, weatherCells), status: "rerouting" };
      _fleet.set(alert.shipId, rerouted);
    }
  }

  // 3. Proximity warnings
  const { newAlerts: proxAlerts, resolvedAlertIds } = checkProximity(getFleetArray());
  for (const alert of proxAlerts) _pushAlert(alert);
  for (const id of resolvedAlertIds) _alerts.delete(id);

  // 4. Save snapshot if due
  maybeSaveSnapshot(getFleetArray(), getAlertsArray(), zones);

  // 5. Broadcast state update to all clients
  broadcast(_wss, "fleet_update", {
    ships: getFleetArray(),
    alerts: getAlertsArray(),
    zones,
  });
}

/**
 * Adds a new alert to the active registry. Prevents duplicate alerts
 * of the same type for the same ship within 30 seconds.
 *
 * @param {import('../types/fleet.js').Alert} alert
 */
function _pushAlert(alert) {
  // Deduplicate: same type + shipId within 30s
  for (const existing of _alerts.values()) {
    if (
      existing.type === alert.type &&
      existing.shipId === alert.shipId &&
      Date.now() - existing.timestamp < 30_000
    ) {
      return;
    }
  }
  _alerts.set(alert.alertId, alert);
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Starts the simulator engine at 1Hz.
 *
 * @param {import('ws').WebSocketServer} wss
 */
function startSimulator(wss) {
  _wss = wss;
  _tickTimer = setInterval(_tick, 1000);
  console.log("[Simulator] Started at 1Hz with", _fleet.size, "ships");

  // Send initial full state to new clients on WS connect
  wss.on("connection", (ws) => {
    // Wait for auth to complete (next event loop)
    setImmediate(() => {
      if (ws.readyState === 1) { // OPEN
        ws.send(JSON.stringify({
          type: "fleet_init",
          payload: {
            ships: getFleetArray(),
            alerts: getAlertsArray(),
            zones: zoneStore.getAllZones(),
            ports: Array.from(PORTS_MAP.values()),
          },
          ts: Date.now(),
        }));
      }
    });

    // Handle incoming messages from this client
    ws.on("fleet_message", (msg) => _handleClientMessage(ws, msg));
  });
}

/**
 * Handles a typed message from a WebSocket client.
 *
 * @param {import('ws').WebSocket} ws
 * @param {{ type: string, payload: any }} msg
 */
async function _handleClientMessage(ws, msg) {
  const { type, payload } = msg;

  switch (type) {
    case "zone_create": {
      if (ws.role !== "admin") return;
      const zone = zoneStore.addZone({
        name: payload.name,
        polygon: payload.polygon,
        createdBy: ws.userId,
      });
      // Immediately check for ships already inside
      const breachAlerts = checkNewZoneAgainstFleet(getFleetArray(), zone);
      for (const alert of breachAlerts) _pushAlert(alert);
      // Re-route ships whose paths intersect the new zone
      for (const [id, ship] of _fleet) {
        if (pathIntersectsZone(ship.currentPath, zone)) {
          const rerouted = { ...computeRoute(ship, zoneStore.getAllZones(), getWeatherCells()), status: "rerouting" };
          _fleet.set(id, rerouted);
        }
      }
      broadcast(_wss, "zone_created", { zone });
      break;
    }

    case "zone_delete": {
      if (ws.role !== "admin") return;
      const removed = zoneStore.removeZone(payload.zoneId);
      if (removed) broadcast(_wss, "zone_deleted", { zoneId: payload.zoneId });
      break;
    }

    case "directive_send": {
      if (ws.role !== "admin") return;
      const directive = issueDirective({
        shipId: payload.shipId,
        type: payload.directiveType,
        targetPortId: payload.targetPortId ?? null,
        targetWaypoint: payload.targetWaypoint ?? null,
        issuedBy: ws.userId,
      });
      // Update ship with activeDirective flag
      const ship = _fleet.get(payload.shipId);
      if (ship) _fleet.set(payload.shipId, { ...ship, activeDirective: directive.directiveId });
      // Notify the captain's WebSocket session
      sendToShipCaptain(_wss, payload.shipId, "directive_received", { directive });
      broadcast(_wss, "directive_issued", { directive });
      break;
    }

    case "directive_accept": {
      if (ws.role !== "captain") return;
      const ship = _fleet.get(ws.assignedShipId);
      if (!ship) return;
      const { ship: updatedShip } = acceptDirective(
        ws.assignedShipId,
        ship,
        zoneStore.getAllZones(),
        getWeatherCells()
      );
      _fleet.set(ws.assignedShipId, updatedShip);
      broadcast(_wss, "directive_accepted", { shipId: ws.assignedShipId });
      break;
    }

    case "directive_escalate": {
      if (ws.role !== "captain") return;
      const directive = escalateDirective(ws.assignedShipId);
      const distressText = payload.message ?? "";
      if (distressText) {
        // Parse distress message with Gemini AI
        const aiParsed = await parseDistressMessage(distressText);
        const alertId = `alert-${randomUUID().slice(0, 8)}`;
        _pushAlert({
          alertId,
          type: "distress",
          severity: aiParsed.severity ?? 3,
          shipId: ws.assignedShipId,
          message: `Distress: ${distressText}`,
          timestamp: Date.now(),
          acknowledged: false,
          relatedShipId: null,
          aiParsed,
        });
        broadcast(_wss, "distress_parsed", { alertId, shipId: ws.assignedShipId, aiParsed });
      }
      break;
    }

    case "alert_acknowledge": {
      if (ws.role !== "admin") return;
      const alert = _alerts.get(payload.alertId);
      if (alert) {
        _alerts.set(payload.alertId, { ...alert, acknowledged: true });
        broadcast(_wss, "alert_acknowledged", { alertId: payload.alertId });
      }
      break;
    }

    case "get_snapshots": {
      ws.send(JSON.stringify({
        type: "snapshots_list",
        payload: { snapshots: getAllSnapshots().map((s) => ({ timestamp: s.timestamp })) },
        ts: Date.now(),
      }));
      break;
    }

    case "get_snapshot": {
      const snap = getSnapshotAt(payload.timestamp);
      if (snap) {
        ws.send(JSON.stringify({ type: "snapshot_data", payload: snap, ts: Date.now() }));
      }
      break;
    }

    case "get_timeline_markers": {
      ws.send(JSON.stringify({
        type: "timeline_markers",
        payload: { markers: getTimelineMarkers() },
        ts: Date.now(),
      }));
      break;
    }

    default:
      console.warn("[Engine] Unknown message type:", type);
  }
}

/**
 * Stops the simulator. Used for graceful shutdown.
 */
function stopSimulator() {
  if (_tickTimer) {
    clearInterval(_tickTimer);
    _tickTimer = null;
    console.log("[Simulator] Stopped");
  }
}

export { startSimulator, stopSimulator, getFleetArray, getAlertsArray };
