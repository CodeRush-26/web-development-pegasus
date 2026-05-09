/**
 * pathfinding/routeManager.js — Route Computation & Management
 *
 * Orchestrates path computation for ships. Handles initial route assignment,
 * re-routing on zone changes, and fuel feasibility checks.
 */

import { buildGrid } from "./grid.js";
import { findPath, findEscapePath } from "./astar.js";
import { NAVIGABLE_POLYGON, PORTS_MAP } from "../data/fleet.js";
import { randomUUID } from "crypto";

/** Base fuel burn rate: tons per nautical mile (at 1x) */
const FUEL_BURN_PER_NM = 0.12;

/** Approx 1 degree ≈ 60 nautical miles */
const DEG_TO_NM = 60;

/**
 * Finds the index of the nearest polygon vertex to a given point.
 */
function nearestVertexIndex(pos, polygon) {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const d = (polygon[i][0] - pos[0]) ** 2 + (polygon[i][1] - pos[1]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Routes along the navigable polygon boundary from startIdx to endIdx.
 * Tries both clockwise and counter-clockwise, returns the shorter path.
 */
function routeAlongPolygon(startPos, endPos, polygon) {
  const n = polygon.length - 1; // last vertex = first vertex (closed polygon)
  const startIdx = nearestVertexIndex(startPos, polygon);
  const endIdx = nearestVertexIndex(endPos, polygon);

  if (startIdx === endIdx) {
    return [startPos, polygon[startIdx], endPos];
  }

  // Clockwise path
  const cwPath = [startPos];
  let i = startIdx;
  while (i !== endIdx) {
    cwPath.push([...polygon[i]]);
    i = (i + 1) % n;
  }
  cwPath.push([...polygon[endIdx]]);
  cwPath.push(endPos);

  // Counter-clockwise path
  const ccwPath = [startPos];
  i = startIdx;
  while (i !== endIdx) {
    ccwPath.push([...polygon[i]]);
    i = (i - 1 + n) % n;
  }
  ccwPath.push([...polygon[endIdx]]);
  ccwPath.push(endPos);

  // Calculate distances and return shorter
  const dist = (path) =>
    path.reduce((acc, pt, idx) => {
      if (idx === 0) return 0;
      const prev = path[idx - 1];
      return acc + Math.sqrt((pt[0] - prev[0]) ** 2 + (pt[1] - prev[1]) ** 2);
    }, 0);

  return dist(cwPath) <= dist(ccwPath) ? cwPath : ccwPath;
}

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

  const { nodes, meta } = buildGrid(NAVIGABLE_POLYGON, zones, weatherCells, ship.routingStrategy || 'optimized', ship.shipId);
  let path = findPath(ship.position, destPort.position, nodes, meta);

  if (!path || path.length === 0) {
    // Fallback: Hold Position. We do not use routeAlongPolygon because it ignores red zones.
    path = [ship.position];
    ship.status = "holding";
    console.log(`[Route] ${ship.shipId}: A* failed (likely blocked by zone), holding position.`);
  } else {
    console.log(`[Route] ${ship.shipId}: A* found path (${path.length} waypoints)`);
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

/**
 * Computes an escape route to the nearest safe node outside restricted zones.
 */
function computeEscapeRoute(ship, zones, weatherCells) {
  const { nodes, meta } = buildGrid(NAVIGABLE_POLYGON, zones, weatherCells, ship.routingStrategy || 'optimized', ship.shipId);
  const path = findEscapePath(ship.position, nodes, meta);
  
  if (path) {
    return {
      path,
      estimatedFuel: path.length * FUEL_BURN_PER_NM * 1.5, // slightly higher burn for evacuation
      feasible: true
    };
  }
  return { path: [], estimatedFuel: 0, feasible: false };
}

export { computeRoute, pathIntersectsZone, computeEscapeRoute };
