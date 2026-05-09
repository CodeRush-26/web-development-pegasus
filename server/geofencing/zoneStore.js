/**
 * geofencing/zoneStore.js — In-Memory Restricted Zone Registry
 *
 * Single source of truth for all active zones. Thread-safe for
 * Node.js single-threaded model. Emits events for zone changes.
 */

import { EventEmitter } from "events";
import { randomUUID } from "crypto";

class ZoneStore extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, import('../types/fleet.js').Zone>} */
    this._zones = new Map();
  }

  /**
   * Adds a new zone. Generates a unique ID if not provided.
   *
   * @param {{ name: string, polygon: number[][], createdBy: string }} zoneInput
   * @returns {import('../types/fleet.js').Zone} The created zone
   */
  addZone(zoneInput) {
    const zone = {
      zoneId: `zone-${randomUUID().slice(0, 8)}`,
      name: zoneInput.name,
      polygon: zoneInput.polygon,
      createdAt: Date.now(),
      createdBy: zoneInput.createdBy,
    };
    this._zones.set(zone.zoneId, zone);
    this.emit("zone_added", zone);
    return zone;
  }

  /**
   * Removes a zone by ID.
   *
   * @param {string} zoneId
   * @returns {boolean} True if zone existed and was removed
   */
  removeZone(zoneId) {
    const existed = this._zones.delete(zoneId);
    if (existed) this.emit("zone_removed", zoneId);
    return existed;
  }

  /**
   * Returns all current zones as an array.
   *
   * @returns {import('../types/fleet.js').Zone[]}
   */
  getAllZones() {
    return Array.from(this._zones.values());
  }

  /**
   * Retrieves a single zone by ID.
   *
   * @param {string} zoneId
   * @returns {import('../types/fleet.js').Zone | undefined}
   */
  getZone(zoneId) {
    return this._zones.get(zoneId);
  }
}

// Export a singleton — same instance across all imports
const zoneStore = new ZoneStore();
export default zoneStore;
