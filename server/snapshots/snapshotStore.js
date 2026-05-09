/**
 * snapshots/snapshotStore.js — Fleet State Snapshot Ring Buffer
 *
 * Stores one snapshot every 30 seconds. Keeps the last 120
 * snapshots (60 minutes of history) in a circular buffer.
 */

/** Maximum number of snapshots to retain */
const MAX_SNAPSHOTS = 120;

/** Snapshot interval in simulator ticks (5 ticks = 5 seconds at 1 Hz) */
const SNAPSHOT_INTERVAL_TICKS = 5;

/**
 * @typedef {Object} Snapshot
 * @property {number} timestamp
 * @property {import('../types/fleet.js').ShipState[]} ships
 * @property {import('../types/fleet.js').Alert[]} alerts
 * @property {import('../types/fleet.js').Zone[]} zones
 */

/** @type {Snapshot[]} */
const _ring = [];

/** Current tick counter */
let _tickCount = 0;

/**
 * Called every simulator tick. Saves a snapshot every 30 ticks.
 *
 * @param {import('../types/fleet.js').ShipState[]} ships
 * @param {import('../types/fleet.js').Alert[]} alerts
 * @param {import('../types/fleet.js').Zone[]} zones
 */
function maybeSaveSnapshot(ships, alerts, zones) {
  _tickCount++;
  // Save every SNAPSHOT_INTERVAL_TICKS, or the very first one
  if (_tickCount % SNAPSHOT_INTERVAL_TICKS !== 0 && _ring.length > 0) return;

  const snapshot = {
    timestamp: Date.now(),
    ships: ships.map((s) => ({ ...s, currentPath: [...s.currentPath] })),
    alerts: [...alerts],
    zones: [...zones],
  };

  if (_ring.length >= MAX_SNAPSHOTS) {
    _ring.shift(); // Drop oldest
  }
  _ring.push(snapshot);
}

/**
 * Returns all snapshots sorted oldest-first.
 *
 * @returns {Snapshot[]}
 */
function getAllSnapshots() {
  return [..._ring];
}

/**
 * Returns the snapshot nearest to the requested timestamp.
 *
 * @param {number} timestamp - Unix ms
 * @returns {Snapshot | null}
 */
function getSnapshotAt(timestamp) {
  if (_ring.length === 0) return null;
  return _ring.reduce((best, snap) =>
    Math.abs(snap.timestamp - timestamp) < Math.abs(best.timestamp - timestamp)
      ? snap
      : best
  );
}

/**
 * Returns key event markers for the timeline UI.
 * Each marker includes timestamp and type.
 *
 * @returns {{ timestamp: number, type: string }[]}
 */
function getTimelineMarkers() {
  const markers = [];
  for (const snap of _ring) {
    for (const alert of snap.alerts) {
      if (!alert.acknowledged) {
        markers.push({ timestamp: alert.timestamp, type: alert.type });
      }
    }
  }
  return markers;
}

export { maybeSaveSnapshot, getAllSnapshots, getSnapshotAt, getTimelineMarkers };
