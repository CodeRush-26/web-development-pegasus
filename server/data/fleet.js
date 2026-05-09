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
 * @type {number[][]}
 */
const NAVIGABLE_POLYGON = FLEET_DATA.navigableWater;

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
