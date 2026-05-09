/**
 * directives/directiveManager.js — Directive Lifecycle Manager
 *
 * Issues, tracks, and responds to operational directives between
 * the Command interface and ship captains.
 */

import { randomUUID } from "crypto";
import { PORTS_MAP } from "../data/fleet.js";
import { computeEscapeRoute } from "../pathfinding/routeManager.js";

/**
 * Active directive registry.
 * Key: shipId, Value: Directive (one pending directive per ship)
 * @type {Map<string, import('../types/fleet.js').Directive>}
 */
const _directives = new Map();

/**
 * Issues a new directive to a ship.
 *
 * @param {Object} params
 * @param {string} params.shipId
 * @param {'reroute_to_port'|'divert_to_waypoint'|'hold_position'|'evacuate_zone'} params.type
 * @param {string|null} params.targetPortId
 * @param {number[]|null} params.targetWaypoint - [lat, lng]
 * @param {string} params.issuedBy - Admin user ID
 * @returns {import('../types/fleet.js').Directive}
 */
function issueDirective({ shipId, type, targetPortId, targetWaypoint, issuedBy }) {
  const directive = {
    directiveId: `dir-${randomUUID().slice(0, 8)}`,
    shipId,
    type,
    targetPortId: targetPortId ?? null,
    targetWaypoint: targetWaypoint ?? null,
    issuedAt: Date.now(),
    status: "pending",
    issuedBy,
  };
  _directives.set(shipId, directive);
  return directive;
}

/**
 * Captain accepts a directive. Returns the updated ship state.
 *
 * @param {string} shipId
 * @param {import('../types/fleet.js').ShipState} ship - Current ship state
 * @param {import('../types/fleet.js').Zone[]} zones - For re-route
 * @param {import('../types/fleet.js').WeatherCell[]} weatherCells
 * @returns {{ ship: import('../types/fleet.js').ShipState, directive: import('../types/fleet.js').Directive|null }}
 */
function acceptDirective(shipId, ship, zones, weatherCells) {
  const directive = _directives.get(shipId);
  if (!directive) return { ship, directive: null };

  directive.status = "accepted";
  _directives.delete(shipId);

  let updatedShip = { ...ship, activeDirective: null };

  if (directive.type === "hold_position") {
    updatedShip.status = "stopped";
    // We preserve currentPath so the route still shows on the map.
  } else if (directive.type === "reroute_to_port" && directive.targetPortId) {
    const port = PORTS_MAP.get(directive.targetPortId);
    if (port) {
      updatedShip.destination = directive.targetPortId;
      updatedShip.destinationName = port.name;
      updatedShip.destinationPosition = port.position;
      updatedShip.status = "rerouting";
      updatedShip.currentPath = [];
    }
  } else if (directive.type === "divert_to_waypoint" && directive.targetWaypoint) {
    // Insert waypoint at front of current path
    updatedShip.currentPath = [directive.targetWaypoint, ...ship.currentPath];
    updatedShip.status = "rerouting";
  } else if (directive.type === "evacuate_zone") {
    const route = computeEscapeRoute(updatedShip, zones, weatherCells);
    if (route.path && route.path.length > 0) {
      updatedShip.currentPath = route.path;
      updatedShip.status = "rerouting"; // moving to the escape point
    } else {
      updatedShip.status = "stopped"; // no escape found
    }
  }

  return { ship: updatedShip, directive };
}

/**
 * Captain escalates (rejects) a directive.
 * Ship course does NOT change — distress message goes to AI module.
 *
 * @param {string} shipId
 * @returns {import('../types/fleet.js').Directive | null}
 */
function escalateDirective(shipId) {
  const directive = _directives.get(shipId);
  if (!directive) return null;
  directive.status = "escalated";
  _directives.delete(shipId);
  return directive;
}

/**
 * Retrieves the pending directive for a ship, if any.
 *
 * @param {string} shipId
 * @returns {import('../types/fleet.js').Directive | undefined}
 */
function getPendingDirective(shipId) {
  return _directives.get(shipId);
}

export { issueDirective, acceptDirective, escalateDirective, getPendingDirective };
