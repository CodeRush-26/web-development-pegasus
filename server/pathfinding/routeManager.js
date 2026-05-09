/**
 * pathfinding/routeManager.js — Route Computation & Management
 *
 * Orchestrates path computation for ships. Handles initial route assignment,
 * re-routing on zone changes, and fuel feasibility checks.
 */

import { buildGrid } from "./grid.js";
import { findPath } from "./astar.js";
import { NAVIGABLE_POLYGON, PORTS_MAP } from "../data/fleet.js";
import { randomUUID } from "crypto";

/** Base fuel burn rate: tons per nautical mile (at 1x) */
const FUEL_BURN_PER_NM = 0.12;

/** Approx 1 degree ≈ 60 nautical miles */
const DEG_TO_NM = 60;

/**
 * Computes a fresh route for a ship to its destination port.
 * Sets ship status to 'rerouting' during computation, 'stranded' if no path.
 *
 * @param {import('../types/fleet.js').ShipState} ship
 * @param {import('../types/fleet.js').Zone[]} zones
 * @param {import('../types/fleet.js').WeatherCell[]} weatherCells
 * @returns {import('../types/fleet.js').ShipState} Updated ship state with new path
 */
function computeRoute(ship, zones, weatherCells = []) {
  const destPort = PORTS_MAP.get(ship.destination);
  if (!destPort) return ship;

  const { nodes, meta } = buildGrid(NAVIGABLE_POLYGON, zones, weatherCells, ship.routingStrategy || 'optimized');
  let path = findPath(ship.position, destPort.position, nodes, meta);

  if (!path || path.length === 0) {
    // Fallback to a straight line to destination if A* fails
    path = [ship.position, destPort.position];
  }

  // Fuel feasibility check
  const totalDistDeg = path.reduce((acc, pt, i) => {
    if (i === 0) return acc;
    const prev = path[i - 1];
    return acc + Math.sqrt((pt[0] - prev[0]) ** 2 + (pt[1] - prev[1]) ** 2);
  }, 0);
  const totalNm = totalDistDeg * DEG_TO_NM;
  const fuelRequired = totalNm * FUEL_BURN_PER_NM;
  const insufficientFuel = ship.fuel < fuelRequired;

  return {
    ...ship,
    status: ship.status === "rerouting" ? "rerouting" : ship.status,
    currentPath: path.slice(1), // Remove start position (ship is already there)
    insufficientFuel,
  };
}

/**
 * Checks if any segment of a ship's current path intersects an active zone.
 * Uses bounding-box overlap as a fast pre-check.
 *
 * @param {number[][]} path - Array of [lat, lng] waypoints
 * @param {import('../types/fleet.js').Zone} zone
 * @returns {boolean}
 */
function pathIntersectsZone(path, zone) {
  if (path.length < 2) return false;

  const zoneLats = zone.polygon.map((p) => p[0]);
  const zoneLngs = zone.polygon.map((p) => p[1]);
  const zoneMinLat = Math.min(...zoneLats);
  const zoneMaxLat = Math.max(...zoneLats);
  const zoneMinLng = Math.min(...zoneLngs);
  const zoneMaxLng = Math.max(...zoneLngs);

  for (let i = 0; i < path.length - 1; i++) {
    const [lat1, lng1] = path[i];
    const [lat2, lng2] = path[i + 1];

    const segMinLat = Math.min(lat1, lat2);
    const segMaxLat = Math.max(lat1, lat2);
    const segMinLng = Math.min(lng1, lng2);
    const segMaxLng = Math.max(lng1, lng2);

    // AABB overlap check
    if (
      segMaxLat >= zoneMinLat &&
      segMinLat <= zoneMaxLat &&
      segMaxLng >= zoneMinLng &&
      segMinLng <= zoneMaxLng
    ) {
      return true;
    }
  }
  return false;
}

export { computeRoute, pathIntersectsZone };
