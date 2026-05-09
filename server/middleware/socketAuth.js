/**
 * middleware/socketAuth.js — WebSocket Token Verifier
 *
 * Validates JWT tokens for WebSocket connections.
 * Separate from the HTTP middleware since WS requests don't
 * use Express middleware chain.
 */

import jwt from "jsonwebtoken";

/**
 * Verifies a JWT token from a WebSocket query string.
 *
 * @param {string | null} token
 * @returns {{ id: string, role: string, assignedShipId: string|null } | null}
 */
function verifySocketToken(token) {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      id: decoded.id,
      role: decoded.role ?? "user",
      assignedShipId: decoded.assignedShipId ?? null,
    };
  } catch {
    return null;
  }
}

export { verifySocketToken };
