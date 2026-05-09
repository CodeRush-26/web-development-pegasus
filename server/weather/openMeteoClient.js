/**
 * weather/openMeteoClient.js — Open-Meteo Weather API Client
 *
 * Fetches wind speed and wave height over the Strait of Hormuz bounding box.
 * No API key required. Thresholds: wind > 25 knots OR wave > 3m = adverse.
 */

import { BOUNDING_BOX } from "../data/fleet.js";

const BASE_URL = process.env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1";

/** Wind speed adverse threshold in knots */
const WIND_ADVERSE_KNOTS = 25;

/** Wave height adverse threshold in metres */
const WAVE_ADVERSE_M = 3;

/** Knots to m/s conversion */
const KNOTS_TO_MS = 0.514444;

/**
 * Fetches current weather data and converts to WeatherCell array.
 *
 * @returns {Promise<import('../types/fleet.js').WeatherCell[]>}
 */
async function fetchWeatherGrid() {
  try {
    const { north, south, east, west } = BOUNDING_BOX;

    // Sample a 5x5 grid across the bounding box
    const cells = [];
    const latSteps = 5;
    const lngSteps = 5;
    const latStep = (north - south) / (latSteps - 1);
    const lngStep = (east - west) / (lngSteps - 1);

    // Batch: one call per grid point (Open-Meteo is free, lightweight)
    const requests = [];
    for (let r = 0; r < latSteps; r++) {
      for (let c = 0; c < lngSteps; c++) {
        const lat = south + r * latStep;
        const lng = west + c * lngStep;
        const url = `${BASE_URL}/forecast?latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&current=wind_speed_10m,wave_height&wind_speed_unit=ms&timezone=UTC&forecast_days=1`;
        requests.push(
          fetch(url)
            .then((r) => r.json())
            .then((data) => {
              const windMs = data?.current?.wind_speed_10m ?? 0;
              const windKnots = windMs / KNOTS_TO_MS;
              const waveM = data?.current?.wave_height ?? 0;
              cells.push({
                lat,
                lng,
                windSpeedKnots: windKnots,
                waveHeightM: waveM,
                isAdverse: windKnots > WIND_ADVERSE_KNOTS || waveM > WAVE_ADVERSE_M,
              });
            })
            .catch(() => {
              // Fail silently per cell — non-adverse default
              cells.push({ lat, lng, windSpeedKnots: 0, waveHeightM: 0, isAdverse: false });
            })
        );
      }
    }

    await Promise.all(requests);
    console.log(`[Weather] Fetched ${cells.length} weather cells`);
    return cells;
  } catch (err) {
    console.error("[Weather] Failed to fetch weather grid:", err.message);
    return [];
  }
}

export { fetchWeatherGrid };
