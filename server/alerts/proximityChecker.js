/**
 * alerts/proximityChecker.js — Ship Proximity Warning System
 *
 * Checks all 105 ship pairs per tick using the Haversine formula.
 * Fires an alert when two ships are within 2 km, auto-resolves when apart.
 */

import { haversineKm } from "../simulator/physics.js";
import { randomUUID } from "crypto";

/** Proximity threshold in kilometres */
const PROXIMITY_THRESHOLD_KM = 0.5;

/**
 * Active proximity pairs: key = `${shipA}-${shipB}` (sorted), value = alertId
 * @type {Map<string, string>}
 */
const _activePairs = new Map();

/**
 * Checks all ship pairs for proximity warnings.
 * Returns new alerts (pairs that just entered threshold) and
 * resolved alert IDs (pairs that left threshold).
 *
 * @param {import('../types/fleet.js').ShipState[]} ships
 * @returns {{ newAlerts: import('../types/fleet.js').Alert[], resolvedAlertIds: string[] }}
 */
function checkProximity(ships) {
  const newAlerts = [];
  const resolvedAlertIds = [];
  const activeShips = ships.filter(
    (s) => s.status !== "arrived" && s.status !== "out_of_fuel"
  );

  for (let i = 0; i < activeShips.length; i++) {
    for (let j = i + 1; j < activeShips.length; j++) {
      const shipA = activeShips[i];
      const shipB = activeShips[j];
      const pairKey = [shipA.shipId, shipB.shipId].sort().join("|");

      const distKm = haversineKm(shipA.position, shipB.position);

      if (distKm < PROXIMITY_THRESHOLD_KM && !_activePairs.has(pairKey)) {
        // New proximity warning
        const alertId = `alert-${randomUUID().slice(0, 8)}`;
        _activePairs.set(pairKey, alertId);
        newAlerts.push({
          alertId,
          type: "proximity_warning",
          severity: 3,
          shipId: shipA.shipId,
          message: `${shipA.name} and ${shipB.name} are ${distKm.toFixed(2)} km apart`,
          timestamp: Date.now(),
          acknowledged: false,
          relatedShipId: shipB.shipId,
          aiParsed: null,
        });
      } else if (distKm >= PROXIMITY_THRESHOLD_KM && _activePairs.has(pairKey)) {
        // Resolved — ships are now safely apart
        resolvedAlertIds.push(_activePairs.get(pairKey));
        _activePairs.delete(pairKey);
      }
    }
  }

  return { newAlerts, resolvedAlertIds };
}

export { checkProximity, PROXIMITY_THRESHOLD_KM };
