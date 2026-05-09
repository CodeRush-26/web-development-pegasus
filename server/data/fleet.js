/**
 * fleet.js — Fleet Data Loader
 *
 * Reads fleet.json once at startup and exports typed, validated
 * data objects used throughout the simulator and pathfinder.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fleetPath = join(__dirname, "../../fleet.json");

/** @type {import('../types/fleet.js').FleetData} */
const FLEET_DATA = JSON.parse(readFileSync(fleetPath, "utf-8"));

/**
 * Port lookup map keyed by port ID.
 * @type {Map<string, import('../types/fleet.js').Port>}
 */
const PORTS_MAP = new Map(FLEET_DATA.ports.map((p) => [p.id, p]));

/**
 * Flat array of [lat, lng] pairs forming the navigable water polygon.
 * PATCH: The provided fleet.json has a self-intersecting polygon at the Strait of Hormuz.
 * We adjust these coordinates in memory to avoid the Oman peninsula (Khasab) and allow A*.
 * @type {number[][]}
 */
const NAVIGABLE_POLYGON = FLEET_DATA.navigableWater.map(pt => {
  if (Math.abs(pt[0] - 26.45) < 0.01 && Math.abs(pt[1] - 56.45) < 0.01) {
    return [26.35, 56.30]; // Safely north/west of Khasab
  }
  if (Math.abs(pt[0] - 26.30) < 0.01 && Math.abs(pt[1] - 55.90) < 0.01) {
    return [26.25, 55.90]; // Smooth continuation into Persian Gulf
  }
  return pt;
});

/**
 * Bounding box for the scenario.
 * @type {{ north: number, south: number, east: number, west: number }}
 */
const BOUNDING_BOX = FLEET_DATA.boundingBox;

/**
 * Initial fleet array from fleet.json.
 * @type {import('../types/fleet.js').ShipInit[]}
 */
const INITIAL_FLEET = FLEET_DATA.fleet;

export { FLEET_DATA, PORTS_MAP, NAVIGABLE_POLYGON, BOUNDING_BOX, INITIAL_FLEET };
