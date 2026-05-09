/**
 * simulator/shipState.js — Ship State Initializer
 *
 * Takes raw fleet.json data and produces the live ShipState map
 * that the engine mutates each tick.
 */

import { PORTS_MAP } from "../data/fleet.js";

/** Base fuel burn constant: tons per knot per tick */
const BASE_BURN_PER_KNOT = 0.002;

/**
 * Converts a raw ShipInit entry into a full ShipState ready for simulation.
 *
 * @param {import('../types/fleet.js').ShipInit} raw
 * @returns {import('../types/fleet.js').ShipState}
 */
function buildShipState(raw) {
  const port = PORTS_MAP.get(raw.destination);

  return {
    shipId: raw.shipId,
    name: raw.name,
    position: [...raw.position],
    speed: raw.speed,
    heading: raw.heading,
    destination: raw.destination,
    destinationName: port?.name ?? "Unknown",
    destinationPosition: port?.position ?? [0, 0],
    fuel: raw.fuel,
    fuelCapacity: raw.fuel, // Starting fuel is max capacity
    cargo: raw.cargo,
    status: "normal",
    weatherPenaltyActive: false,
    insufficientFuel: false,
    currentPath: [],   // Populated by routeManager on first tick
    activeDirective: null,
  };
}

/**
 * Initialises the live fleet map from the raw fleet data array.
 *
 * @param {import('../types/fleet.js').ShipInit[]} fleet
 * @returns {Map<string, import('../types/fleet.js').ShipState>}
 */
function initFleet(fleet) {
  const stateMap = new Map();
  for (const raw of fleet) {
    stateMap.set(raw.shipId, buildShipState(raw));
  }
  return stateMap;
}

export { initFleet, BASE_BURN_PER_KNOT };
