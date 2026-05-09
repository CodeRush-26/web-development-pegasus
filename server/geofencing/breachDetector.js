/**
 * geofencing/breachDetector.js — Geofence Breach Detection
 *
 * Runs point-in-polygon checks every tick to detect when ships
 * enter restricted zones. Uses @turf for accurate geospatial math.
 */

import { point, polygon } from "@turf/turf";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { randomUUID } from "crypto";

/**
 * Tracks which ships are currently inside which zones.
 * Key: `${shipId}-${zoneId}`, Value: true
 * @type {Set<string>}
 */
const _insideSet = new Set();

/**
 * Checks all ships against all zones for geofence breaches.
 * Only fires a new breach alert when a ship transitions from outside → inside.
 *
 * @param {import('../types/fleet.js').ShipState[]} ships
 * @param {import('../types/fleet.js').Zone[]} zones
 * @returns {import('../types/fleet.js').Alert[]} New breach alerts this tick
 */
function detectBreaches(ships, zones) {
  const newAlerts = [];

  for (const ship of ships) {
    if (ship.status === "arrived" || ship.status === "out_of_fuel") continue;

    const shipPoint = point([ship.position[1], ship.position[0]]); // turf uses [lng, lat]

    for (const zone of zones) {
      if (zone.restrictedShipIds && zone.restrictedShipIds.length > 0 && !zone.restrictedShipIds.includes(ship.shipId)) {
        continue;
      }
      const key = `${ship.shipId}-${zone.zoneId}`;

      // Close the polygon ring if needed (turf requires first === last)
      const coords = [...zone.polygon.map((p) => [p[1], p[0]])]; // convert [lat,lng] → [lng,lat]
      if (
        coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1]
      ) {
        coords.push(coords[0]);
      }

      const zonePolygon = polygon([coords]);
      const isInside = booleanPointInPolygon(shipPoint, zonePolygon);

      if (isInside && !_insideSet.has(key)) {
        // New breach: ship just entered this zone
        _insideSet.add(key);
        newAlerts.push({
          alertId: `alert-${randomUUID().slice(0, 8)}`,
          type: "geofence_breach",
          severity: 4,
          shipId: ship.shipId,
          message: `${ship.name} entered restricted zone "${zone.name}"`,
          timestamp: Date.now(),
          acknowledged: false,
          relatedShipId: null,
          aiParsed: null,
        });
      } else if (!isInside && _insideSet.has(key)) {
        // Ship has exited the zone — clear tracking
        _insideSet.delete(key);
      }
    }
  }

  return newAlerts;
}

/**
 * Checks if any ships are already inside a newly created zone.
 * Called immediately when command draws a new zone.
 *
 * @param {import('../types/fleet.js').ShipState[]} ships
 * @param {import('../types/fleet.js').Zone} zone
 * @returns {import('../types/fleet.js').Alert[]} Immediate breach alerts
 */
function checkNewZoneAgainstFleet(ships, zone) {
  const newAlerts = [];
  const coords = [...zone.polygon.map((p) => [p[1], p[0]])];
  if (
    coords[0][0] !== coords[coords.length - 1][0] ||
    coords[0][1] !== coords[coords.length - 1][1]
  ) {
    coords.push(coords[0]);
  }
  const zonePolygon = polygon([coords]);

  for (const ship of ships) {
    if (zone.restrictedShipIds && zone.restrictedShipIds.length > 0 && !zone.restrictedShipIds.includes(ship.shipId)) {
      continue;
    }
    if (ship.status === "arrived" || ship.status === "out_of_fuel") continue;
    const shipPoint = point([ship.position[1], ship.position[0]]);
    if (booleanPointInPolygon(shipPoint, zonePolygon)) {
      const key = `${ship.shipId}-${zone.zoneId}`;
      _insideSet.add(key);
      newAlerts.push({
        alertId: `alert-${randomUUID().slice(0, 8)}`,
        type: "geofence_breach",
        severity: 4,
        shipId: ship.shipId,
        message: `${ship.name} is inside newly created zone "${zone.name}"`,
        timestamp: Date.now(),
        acknowledged: false,
        relatedShipId: null,
        aiParsed: null,
      });
    }
  }

  return newAlerts;
}

export { detectBreaches, checkNewZoneAgainstFleet };
