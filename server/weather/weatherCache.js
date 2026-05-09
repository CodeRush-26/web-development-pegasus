/**
 * weather/weatherCache.js — Weather Grid Cache
 *
 * Holds weather data in memory and refreshes every 30 minutes.
 * Provides a fast position-based lookup for the simulator tick.
 */

import { fetchWeatherGrid } from "./openMeteoClient.js";

/** Refresh interval in milliseconds (30 minutes) */
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

/** @type {import('../types/fleet.js').WeatherCell[]} */
let _cachedCells = [];

/** @type {NodeJS.Timeout | null} */
let _refreshTimer = null;

/**
 * Fetches the weather grid and stores in cache.
 */
async function _refresh() {
  _cachedCells = await fetchWeatherGrid();
}

/**
 * Starts the weather cache with an immediate fetch,
 * then refreshes every 30 minutes.
 *
 * @returns {Promise<void>}
 */
async function startWeatherRefresh() {
  await _refresh();
  _refreshTimer = setInterval(_refresh, REFRESH_INTERVAL_MS);
  console.log("[Weather] Cache started — refreshing every 30 minutes");
}

/**
 * Stops the refresh timer. Used for clean shutdown.
 */
function stopWeatherRefresh() {
  if (_refreshTimer) {
    clearInterval(_refreshTimer);
    _refreshTimer = null;
  }
}

/**
 * Returns all current weather cells.
 *
 * @returns {import('../types/fleet.js').WeatherCell[]}
 */
function getWeatherCells() {
  return _cachedCells;
}

/**
 * Looks up whether a specific position has adverse weather.
 * Finds the nearest cached cell within 1.5 grid steps.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {boolean}
 */
function isAdverseAt(lat, lng) {
  if (_cachedCells.length === 0) return false;
  let nearest = null;
  let minDist = Infinity;

  for (const cell of _cachedCells) {
    const d = Math.sqrt((cell.lat - lat) ** 2 + (cell.lng - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      nearest = cell;
    }
  }

  return nearest?.isAdverse ?? false;
}

export { startWeatherRefresh, stopWeatherRefresh, getWeatherCells, isAdverseAt };
