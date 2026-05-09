/**
 * types/fleet.js — JSDoc type definitions for Fleet Command
 *
 * These definitions mirror the TypeScript interfaces on the client.
 * Reference them in JSDoc @type and @param annotations throughout the server.
 */

/**
 * @typedef {Object} ShipInit
 * @property {string} shipId       - Unique identifier e.g. "MV-7"
 * @property {string} name         - Human-readable ship name
 * @property {number[]} position   - [lat, lng] current coordinates
 * @property {number} speed        - Speed in knots
 * @property {number} heading      - True heading 0-360°
 * @property {string} destination  - Port ID e.g. "KWT-1"
 * @property {number} fuel         - Current fuel level in tons
 * @property {string} cargo        - Cargo description
 * @property {string} status       - Initial status (always "normal")
 */

/**
 * @typedef {Object} ShipState
 * @property {string} shipId
 * @property {string} name
 * @property {number[]} position          - Live [lat, lng]
 * @property {number} speed               - Knots
 * @property {number} heading             - Degrees
 * @property {string} destination         - Port ID
 * @property {string} destinationName     - Human-readable port name
 * @property {number[]} destinationPosition - Port [lat, lng]
 * @property {number} fuel                - Remaining fuel in tons
 * @property {number} fuelCapacity        - Max fuel at start (for % calc)
 * @property {string} cargo
 * @property {'normal'|'rerouting'|'distressed'|'stopped'|'stranded'|'arrived'|'out_of_fuel'} status
 * @property {boolean} weatherPenaltyActive
 * @property {boolean} insufficientFuel
 * @property {number[][]} currentPath     - Remaining waypoints [lat, lng][]
 * @property {string|null} activeDirective
 */

/**
 * @typedef {Object} Alert
 * @property {string} alertId
 * @property {'geofence_breach'|'proximity_warning'|'stranded'|'insufficient_fuel'|'distress'} type
 * @property {number} severity            - 1-5
 * @property {string} shipId
 * @property {string} message
 * @property {number} timestamp           - Unix ms
 * @property {boolean} acknowledged
 * @property {string|null} relatedShipId  - For proximity warnings
 * @property {Object|null} aiParsed       - Gemini output if distress
 */

/**
 * @typedef {Object} Zone
 * @property {string} zoneId
 * @property {string} name
 * @property {number[][]} polygon         - [lat, lng][] vertices
 * @property {number} createdAt           - Unix ms
 * @property {string} createdBy           - User ID
 */

/**
 * @typedef {Object} Port
 * @property {string} id
 * @property {string} name
 * @property {number[]} position          - [lat, lng]
 */

/**
 * @typedef {Object} Directive
 * @property {string} directiveId
 * @property {string} shipId
 * @property {'reroute_to_port'|'divert_to_waypoint'|'hold_position'} type
 * @property {string|null} targetPortId
 * @property {number[]|null} targetWaypoint
 * @property {number} issuedAt
 * @property {'pending'|'accepted'|'escalated'} status
 * @property {string} issuedBy            - Admin user ID
 */

/**
 * @typedef {Object} WeatherCell
 * @property {number} lat
 * @property {number} lng
 * @property {number} windSpeedKnots
 * @property {number} waveHeightM
 * @property {boolean} isAdverse
 */

/**
 * @typedef {Object} FleetData
 * @property {{ north: number, south: number, east: number, west: number }} boundingBox
 * @property {number[][]} navigableWater
 * @property {Port[]} ports
 * @property {ShipInit[]} fleet
 */

export {};
