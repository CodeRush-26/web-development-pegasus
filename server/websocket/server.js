/**
 * websocket/server.js — WebSocket Server
 *
 * Upgrades the HTTP server to support WebSocket connections.
 * Handles session routing for admin/captain roles.
 * Provides typed message broadcast utilities.
 */

import { WebSocketServer, WebSocket } from "ws";
import { verifySocketToken } from "../middleware/socketAuth.js";

/**
 * All active WebSocket connections keyed by userId.
 * Multiple tabs = multiple entries for same user.
 * @type {Map<string, WebSocket[]>}
 */
const _connections = new Map();

/**
 * Adds a connection for a user.
 *
 * @param {string} userId
 * @param {WebSocket} ws
 */
function _addConnection(userId, ws) {
  const existing = _connections.get(userId) ?? [];
  existing.push(ws);
  _connections.set(userId, existing);
}

/**
 * Removes a connection when it closes.
 *
 * @param {string} userId
 * @param {WebSocket} ws
 */
function _removeConnection(userId, ws) {
  const existing = _connections.get(userId) ?? [];
  const filtered = existing.filter((c) => c !== ws);
  if (filtered.length === 0) {
    _connections.delete(userId);
  } else {
    _connections.set(userId, filtered);
  }
}

/**
 * Creates and attaches a WebSocket server to the HTTP server.
 *
 * @param {import('http').Server} httpServer
 * @returns {WebSocketServer}
 */
function createWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    // Authenticate via token in query string: ?token=JWT
    const url = new URL(req.url, "http://localhost");
    const token = url.searchParams.get("token");

    const user = verifySocketToken(token);
    if (!user) {
      ws.close(4001, "Unauthorized");
      return;
    }

    ws.userId = user.id;
    ws.role = user.role;
    ws.assignedShipId = user.assignedShipId ?? null;
    ws.isAlive = true;

    _addConnection(user.id, ws);
    console.log(`[WS] Connected: ${user.id} (${user.role})`);

    // Heartbeat pong response
    ws.on("pong", () => { ws.isAlive = true; });

    ws.on("message", (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());
        ws.emit("fleet_message", msg);
      } catch {
        ws.send(JSON.stringify({ type: "error", payload: { message: "Invalid JSON" } }));
      }
    });

    ws.on("close", () => {
      _removeConnection(user.id, ws);
      console.log(`[WS] Disconnected: ${user.id}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error for ${user.id}:`, err.message);
    });
  });

  // Heartbeat: ping all clients every 30s, terminate silent ones
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30_000);

  wss.on("close", () => clearInterval(heartbeat));

  return wss;
}

/**
 * Sends a typed message to ALL connected clients.
 *
 * @param {WebSocketServer} wss
 * @param {string} type - Message type string
 * @param {Object} payload
 */
function broadcast(wss, type, payload) {
  const msg = JSON.stringify({ type, payload, ts: Date.now() });
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

/**
 * Sends a message only to a specific user (by userId).
 *
 * @param {string} userId
 * @param {string} type
 * @param {Object} payload
 */
function sendToUser(userId, type, payload) {
  const conns = _connections.get(userId) ?? [];
  const msg = JSON.stringify({ type, payload, ts: Date.now() });
  for (const ws of conns) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

/**
 * Sends a message to all clients with a specific ship assignment (captains of shipId).
 *
 * @param {WebSocketServer} wss
 * @param {string} shipId
 * @param {string} type
 * @param {Object} payload
 */
function sendToShipCaptain(wss, shipId, type, payload) {
  const msg = JSON.stringify({ type, payload, ts: Date.now() });
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN && ws.assignedShipId === shipId) {
      ws.send(msg);
    }
  });
}

export { createWebSocketServer, broadcast, sendToUser, sendToShipCaptain };
