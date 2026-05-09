/**
 * simulator/physics.js — Ship Movement Physics
 *
 * Computes one-tick position/fuel/status update for a single ship.
 * Pure function — no side effects, easily unit-testable.
 */

import { BASE_BURN_PER_KNOT } from "./shipState.js";

/** 1 nautical mile ≈ 1/60 degree latitude */
const NM_TO_DEG = 1 / 60;

/** Distance in degrees below which a ship is considered "arrived" */
const ARRIVAL_THRESHOLD_DEG = 0.05;

/** Weather fuel burn multiplier */
const WEATHER_BURN_MULTIPLIER = 1.3;

/**
 * Computes the haversine distance between two [lat, lng] points in km.
 *
 * @param {number[]} a - [lat, lng]
 * @param {number[]} b - [lat, lng]
 * @returns {number} Distance in km
 */
function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Computes the heading in degrees from point a to point b.
 *
 * @param {number[]} a - [lat, lng]
 * @param {number[]} b - [lat, lng]
 * @returns {number} Heading 0-360
 */
function bearingDeg(a, b) {
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Advances a ship by one simulator tick (1 second).
 * Returns a new ShipState object — does not mutate the original.
 *
 * @param {import('../types/fleet.js').ShipState} ship
 * @param {boolean} weatherPenalty - Whether the ship's current cell is adverse
 * @returns {import('../types/fleet.js').ShipState}
 */
function advanceShip(ship, weatherPenalty = false) {
  // Immutable copy — never mutate source
  const next = { ...ship, currentPath: [...ship.currentPath] };

  // Terminal states — no movement
  if (
    next.status === "arrived" ||
    next.status === "out_of_fuel" ||
    next.status === "stopped"
  ) {
    return next;
  }

  // Fuel burn this tick
  const burnMultiplier = weatherPenalty ? WEATHER_BURN_MULTIPLIER : 1;
  const fuelBurn = BASE_BURN_PER_KNOT * next.speed * burnMultiplier;
  next.weatherPenaltyActive = weatherPenalty;

  // Out-of-fuel check
  if (next.fuel <= 0) {
    next.fuel = 0;
    next.status = "out_of_fuel";
    return next;
  }

  next.fuel = Math.max(0, next.fuel - fuelBurn);

  // If no path yet, stay in place (routeManager will assign one)
  if (next.currentPath.length === 0) {
    return next;
  }

  // Move toward next waypoint
  const target = next.currentPath[0];
  const distNm = next.speed / 3600; // nautical miles per second
  const distDeg = distNm * NM_TO_DEG;
  const totalDistDeg = Math.sqrt(
    (target[0] - next.position[0]) ** 2 + (target[1] - next.position[1]) ** 2
  );

  // Update heading to face the waypoint
  next.heading = bearingDeg(next.position, target);

  if (totalDistDeg <= distDeg) {
    // Reached this waypoint — snap to it and remove from path
    next.position = [...target];
    next.currentPath.shift();

    // If path is now empty, check arrival at destination port
    if (next.currentPath.length === 0) {
      const distToDestDeg = Math.sqrt(
        (next.destinationPosition[0] - next.position[0]) ** 2 +
          (next.destinationPosition[1] - next.position[1]) ** 2
      );
      if (distToDestDeg <= ARRIVAL_THRESHOLD_DEG) {
        next.status = "arrived";
      }
    }
  } else {
    // Move a fraction of the way toward the waypoint
    const ratio = distDeg / totalDistDeg;
    next.position = [
      next.position[0] + (target[0] - next.position[0]) * ratio,
      next.position[1] + (target[1] - next.position[1]) * ratio,
    ];
  }

  // Restore status to normal if it was rerouting and now has a valid path
  if (next.status === "rerouting" && next.currentPath.length > 0) {
    next.status = "normal";
  }

  return next;
}

export { advanceShip, haversineKm, bearingDeg, ARRIVAL_THRESHOLD_DEG };
