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
import { sendPushNotification, broadcastPushNotification } from "../services/pushService.js";
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
    updated.weatherPenaltyActive = weatherPenalty;
    if (updated.isSimulating) {
      updated = advanceShip(updated, weatherPenalty);
    }
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
  try {
    const { type, payload } = msg;

    switch (type) {
    case "zone_create": {
      if (ws.role !== "admin") return;
      const zone = zoneStore.addZone({
        name: payload.name,
        polygon: payload.polygon,
        createdBy: ws.userId,
        restrictedShipIds: payload.restrictedShipIds ?? [],
      });
      // Immediately check for ships already inside
      const breachAlerts = checkNewZoneAgainstFleet(getFleetArray(), zone);
      for (const alert of breachAlerts) _pushAlert(alert);
      // Re-route ships whose paths intersect the new zone
      for (const [id, ship] of _fleet) {
        // Skip if this zone doesn't apply to this ship
        if (zone.restrictedShipIds && zone.restrictedShipIds.length > 0 && !zone.restrictedShipIds.includes(ship.shipId)) {
          continue;
        }

        if (pathIntersectsZone(ship.currentPath, zone)) {
          const rerouted = { ...computeRoute(ship, zoneStore.getAllZones(), getWeatherCells()), status: "rerouting" };
          _fleet.set(id, rerouted);
          // Alert the captain of the affected ship
          const rerouteAlert = {
            alertId: `reroute-${ship.shipId}-${Date.now()}`,
            shipId: ship.shipId,
            type: "zone_reroute",
            severity: 3,
            message: `A new restricted zone "${zone.name}" blocks your path. Your route has been automatically recalculated. Please review your new course.`,
            timestamp: Date.now(),
            acknowledged: false,
          };
          _pushAlert(rerouteAlert);
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
      
      // We don't have Captain's userId mapped to shipId easily here without DB lookup,
      // but in a real app we'd find the Captain's userId. For MVP, we broadcast to demo functionality.
      broadcastPushNotification({
        title: "New Directive Received",
        body: `Priority directive issued to ${payload.shipId}. Please acknowledge.`,
        url: "/dashboard/captain"
      });
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

    case "captain_plot_course": {
      if (ws.role !== "captain") return;
      const ship = _fleet.get(ws.assignedShipId);
      if (!ship) return;
      
      const newShip = { ...ship, routingStrategy: payload.strategy };
      // Compute the route immediately using the new strategy
      const routedShip = computeRoute(newShip, zoneStore.getAllZones(), getWeatherCells());
      // Make sure simulation remains off until they explicitly start it
      routedShip.isSimulating = false;
      _fleet.set(ws.assignedShipId, routedShip);
      
      broadcast(_wss, "course_plotted", { shipId: ws.assignedShipId, path: routedShip.currentPath });
      break;
    }

    case "captain_start_simulation": {
      if (ws.role !== "captain") return;
      const ship = _fleet.get(ws.assignedShipId);
      if (!ship) return;
      
      const updatedShip = { ...ship, isSimulating: true };
      _fleet.set(ws.assignedShipId, updatedShip);
      
      broadcast(_wss, "simulation_started", { shipId: ws.assignedShipId });
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
        
        broadcastPushNotification({
          title: "S.O.S. Distress Signal",
          body: `Emergency reported from ${ws.assignedShipId}: ${distressText}`,
          url: "/dashboard"
        });
      }
      break;
    }

    case "captain_report_alert": {
      // Only authenticated captains can submit operational alerts
      if (ws.role !== "captain") return;
      if (!ws.assignedShipId) return;

      const reportedSeverity = Number(payload.severity);
      if (
        !payload.message ||
        typeof payload.message !== "string" ||
        payload.message.trim().length === 0 ||
        isNaN(reportedSeverity) ||
        reportedSeverity < 1 ||
        reportedSeverity > 5
      ) {
        return; // silently reject malformed payloads
      }

      const alertId = `alert-${randomUUID().slice(0, 8)}`;
      _pushAlert({
        alertId,
        type: "captain_report",
        severity: reportedSeverity,
        shipId: ws.assignedShipId,
        message: `[Captain Report] ${payload.message.trim()}`,
        timestamp: Date.now(),
        acknowledged: false,
        relatedShipId: null,
        aiParsed: null,
      });

      // Immediately broadcast the updated alert list so the admin dashboard
      // reflects the new alert without waiting for the next 1Hz tick.
      broadcast(_wss, "fleet_update", {
        ships: getFleetArray(),
        alerts: getAlertsArray(),
        zones: zoneStore.getAllZones(),
      });

      // Echo back a confirmation to the reporting captain
      ws.send(
        JSON.stringify({
          type: "captain_report_ack",
          payload: { alertId },
          ts: Date.now(),
        })
      );
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

    case "captain_plot_course": {
      console.log(`[Simulator] captain_plot_course received for ${ws.assignedShipId} with strategy ${payload.strategy}`);
      if (ws.role !== "captain" || !ws.assignedShipId) return;
      const ship = _fleet.get(ws.assignedShipId);
      if (ship) {
        // Update strategy and re-compute route
        ship.routingStrategy = payload.strategy || "optimized";
        const rerouted = computeRoute(ship, zoneStore.getAllZones(), getWeatherCells());
        console.log(`[Simulator] ${ws.assignedShipId} course plotted. New path length: ${rerouted.currentPath.length}, status: ${rerouted.status}`);
        _fleet.set(ws.assignedShipId, rerouted);
      }
      break;
    }

    case "captain_start_simulation": {
      console.log(`[Simulator] captain_start_simulation received for ${ws.assignedShipId}`);
      if (ws.role !== "captain" || !ws.assignedShipId) return;
      const ship = _fleet.get(ws.assignedShipId);
      if (ship) {
        // Force status to normal to resume movement and clear stopped/stranded states
        ship.status = "normal";
        // Ensure we have a valid route to follow
        const rerouted = computeRoute(ship, zoneStore.getAllZones(), getWeatherCells());
        rerouted.status = "normal"; // computeRoute might set it back to stranded if it fails, but let's allow it to attempt
        rerouted.isSimulating = true; // IMPORTANT: flag so physics engine actually advances the ship!
        console.log(`[Simulator] ${ws.assignedShipId} simulation started. Path length: ${rerouted.currentPath.length}, status: ${rerouted.status}, isSimulating: ${rerouted.isSimulating}`);
        _fleet.set(ws.assignedShipId, rerouted);
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

    case "chat_send": {
      // payload: { content: string, shipId?: string, receiverId?: string }
      // This is a simplified in-memory broadcast for the MVP dispatch chat
      const chatMessage = {
        _id: `msg-${Date.now()}`,
        senderId: ws.userId,
        senderRole: ws.role,
        shipId: ws.assignedShipId || payload.shipId || "fleet-command",
        content: payload.content,
        timestamp: new Date().toISOString()
      };
      
      // Save to Mongoose in the background (we won't await it to keep simulator fast)
      import("../models/Message.js").then(({ default: Message }) => {
        Message.create({
          senderId: ws.userId,
          senderRole: ws.role,
          receiverId: payload.receiverId || "admin",
          shipId: chatMessage.shipId,
          content: chatMessage.content
        }).catch(err => console.error("Failed to save chat message", err));
      }).catch(() => {});

      // Broadcast to admins and the specific captain if shipId is provided
      if (ws.role === "admin" && payload.shipId) {
        sendToShipCaptain(_wss, payload.shipId, "chat_receive", chatMessage);
        // Also echo back to sender admin
        ws.send(JSON.stringify({ type: "chat_receive", payload: chatMessage }));
      } else {
        // Broadcast to all admins and echo back to sender captain
        broadcast(_wss, "chat_receive", chatMessage);
      }
      break;
    }

      default:
        console.warn("[Simulator] Unknown message type:", type);
    }
  } catch (err) {
    console.error("[Simulator] Error handling client message:", err);
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
