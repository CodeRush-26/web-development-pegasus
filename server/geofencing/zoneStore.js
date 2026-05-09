/**
 * geofencing/zoneStore.js — Persistent Restricted Zone Registry
 *
 * Single source of truth for all active zones. Syncs to MongoDB for
 * persistence across server restarts. Emits events for zone changes.
 */

import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import Zone from "../models/Zone.js";

class ZoneStore extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, import('../types/fleet.js').Zone>} */
    this._zones = new Map();
  }

  /**
   * Loads all persisted zones from MongoDB into the in-memory store.
   * Called once on server startup after DB connection is ready.
   */
  async loadFromDB() {
    try {
      const docs = await Zone.find({});
      this._zones.clear();
      for (const doc of docs) {
        this._zones.set(doc.zoneId, {
          zoneId: doc.zoneId,
          name: doc.name,
          polygon: doc.polygon,
          createdAt: doc.createdAt,
          createdBy: doc.createdBy,
          restrictedShipIds: doc.restrictedShipIds ?? [],
        });
      }
      console.log(`[ZoneStore] Loaded ${docs.length} zone(s) from DB.`);
    } catch (err) {
      console.error("[ZoneStore] Failed to load zones from DB:", err.message);
    }
  }

  /**
   * Adds a new zone. Saves to MongoDB for persistence.
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
      restrictedShipIds: zoneInput.restrictedShipIds ?? [],
    };
    this._zones.set(zone.zoneId, zone);

    // Persist to DB (fire-and-forget with error logging)
    Zone.create(zone).catch((err) =>
      console.error(`[ZoneStore] Failed to save zone "${zone.name}" to DB:`, err.message)
    );

    this.emit("zone_added", zone);
    return zone;
  }

  /**
   * Removes a zone by ID. Deletes from MongoDB.
   *
   * @param {string} zoneId
   * @returns {boolean} True if zone existed and was removed
   */
  removeZone(zoneId) {
    const existed = this._zones.delete(zoneId);
    if (existed) {
      Zone.deleteOne({ zoneId }).catch((err) =>
        console.error(`[ZoneStore] Failed to delete zone ${zoneId} from DB:`, err.message)
      );
      this.emit("zone_removed", zoneId);
    }
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
