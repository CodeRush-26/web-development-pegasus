/**
 * pathfinding/grid.js — Navigable Grid Builder
 *
 * Samples a uniform grid of lat/lng points inside the navigable water
 * polygon, excluding any points inside restricted zones.
 * Used by A* to find valid ship routes.
 */

import { point, polygon, booleanPointInPolygon } from "@turf/turf";

/** Grid spacing in degrees (approx 10-12 km per cell at this latitude) */
const GRID_STEP = 0.025;

/** Cost multiplier for grid cells with adverse weather */
const WEATHER_COST_MULTIPLIER = 1.5;

/**
 * A single grid node.
 * @typedef {Object} GridNode
 * @property {number} lat
 * @property {number} lng
 * @property {boolean} walkable
 * @property {number} cost - Base traversal cost (1.0 or weather multiplier)
 * @property {string} id  - "${latIdx}_${lngIdx}"
 */

/**
 * Builds a grid of walkable nodes inside the navigable polygon,
 * avoiding any active restricted zones.
 *
 * @param {number[][]} navigablePolygon - Array of [lat, lng] vertices
 * @param {import('../types/fleet.js').Zone[]} zones - Active restricted zones
 * @param {import('../types/fleet.js').WeatherCell[]} weatherCells - Current weather
 * @returns {{ nodes: GridNode[][], meta: { latMin: number, lngMin: number, rows: number, cols: number } }}
 */
function buildGrid(navigablePolygon, zones, weatherCells = [], strategy = 'optimized', shipId = null) {
  // Convert navigable polygon to turf format [lng, lat]
  const navCoords = navigablePolygon.map((p) => [p[1], p[0]]);
  if (
    navCoords[0][0] !== navCoords[navCoords.length - 1][0] ||
    navCoords[0][1] !== navCoords[navCoords.length - 1][1]
  ) {
    navCoords.push(navCoords[0]);
  }
  const navPolygon = polygon([navCoords]);

  // Filter zones to only those that apply to this specific ship.
  // A zone applies if: it has no restrictedShipIds (applies to all),
  // OR the shipId is in its restrictedShipIds list.
  const applicableZones = shipId
    ? zones.filter(z =>
        !z.restrictedShipIds || z.restrictedShipIds.length === 0 || z.restrictedShipIds.includes(shipId)
      )
    : zones;

  // Pre-build zone polygons
  const zonePolygons = applicableZones.map((z) => {
    const coords = z.polygon.map((p) => [p[1], p[0]]);
    if (coords[0][0] !== coords[coords.length - 1][0]) coords.push(coords[0]);
    return polygon([coords]);
  });

  // Determine grid bounds from polygon
  const lats = navigablePolygon.map((p) => p[0]);
  const lngs = navigablePolygon.map((p) => p[1]);
  const latMin = Math.floor(Math.min(...lats) / GRID_STEP) * GRID_STEP;
  const latMax = Math.ceil(Math.max(...lats) / GRID_STEP) * GRID_STEP;
  const lngMin = Math.floor(Math.min(...lngs) / GRID_STEP) * GRID_STEP;
  const lngMax = Math.ceil(Math.max(...lngs) / GRID_STEP) * GRID_STEP;

  const rows = Math.round((latMax - latMin) / GRID_STEP) + 1;
  const cols = Math.round((lngMax - lngMin) / GRID_STEP) + 1;

  /** @type {GridNode[][]} */
  const nodes = [];

  for (let r = 0; r < rows; r++) {
    nodes[r] = [];
    for (let c = 0; c < cols; c++) {
      const lat = latMin + r * GRID_STEP;
      const lng = lngMin + c * GRID_STEP;
      const pt = point([lng, lat]);

      const insideNav = booleanPointInPolygon(pt, navPolygon);
      let insideZone = false;
      for (const zp of zonePolygons) {
        if (booleanPointInPolygon(pt, zp)) {
          insideZone = true;
          break;
        }
      }

      // Weather cost logic based on strategy
      let cost = 1.0;
      if (strategy !== 'fastest') {
        for (const cell of weatherCells) {
          if (
            Math.abs(cell.lat - lat) < GRID_STEP &&
            Math.abs(cell.lng - lng) < GRID_STEP &&
            cell.isAdverse
          ) {
            cost = strategy === 'fuel_efficient' ? 1000.0 : WEATHER_COST_MULTIPLIER;
            break;
          }
        }
      }

      nodes[r][c] = {
        lat,
        lng,
        walkable: insideNav && !insideZone,
        cost,
        id: `${r}_${c}`,
      };
    }
  }

  return { nodes, meta: { latMin, lngMin, rows, cols } };
}

/**
 * Snaps an arbitrary [lat, lng] point to the nearest grid index.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {{ latMin: number, lngMin: number }} meta
 * @returns {{ r: number, c: number }}
 */
function snapToGrid(lat, lng, meta) {
  const r = Math.round((lat - meta.latMin) / GRID_STEP);
  const c = Math.round((lng - meta.lngMin) / GRID_STEP);
  return { r, c };
}

export { buildGrid, snapToGrid, GRID_STEP };
