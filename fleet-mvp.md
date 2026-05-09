# Fleet Command MVP — Strait of Hormuz Crisis System

## What we're building

A real-time fleet command system for 15 cargo ships transiting the Strait of Hormuz. The system simulates the ships moving, lets operators draw danger zones, handles role-based communication between fleet command and ship captains, parses AI distress messages, applies weather penalties, and lets anyone rewind the last hour of fleet history.

---

## Build order

Build in this exact sequence. Nothing later works without what comes before it.

```
1. Ship simulator
2. WebSocket broadcast
3. Map rendering
4. Zone drawing + geofencing
5. Pathfinding + auto-reroute
6. Role-based UIs
7. Directives flow
8. AI distress parsing
9. Weather fuel penalty
10. Proximity warnings
11. Snapshot store + playback
```

Do not touch bonuses until all 11 steps pass end-to-end.

---

## Step 1 — Ship simulator

**What it is:** A server-side loop that advances all 15 ships once per second.

**Input:** `fleet.json` — load this at startup. It gives you the 15 ships with starting position, speed, heading, fuel, cargo, status, and destination port ID. It also gives you the navigable water polygon and the list of ports with coordinates.

**What each tick does:**
1. For each ship, compute how far it moves in one second: `distance = speed_knots × (1/3600)` degrees (approximate: 1 nautical mile ≈ 1/60 degree latitude).
2. Move the ship along its current heading by that distance.
3. Subtract fuel burned this tick. Base burn rate is `speed × some_constant`. If the ship is in adverse weather, multiply burn by 1.3.
4. Update the ship's status based on conditions:
   - `normal` — moving fine
   - `rerouting` — computing a new path around a zone
   - `distressed` — captain sent a distress escalation
   - `stopped` — holding position on directive
   - `stranded` — no valid path exists to destination
   - `arrived` — reached destination port
   - `out_of_fuel` — fuel reached zero

**Ship state shape** (keep this consistent everywhere):
```
shipId, name, position [lat, lng], speed, heading, destination,
fuel, cargo, status, currentPath (array of waypoints), weatherPenaltyActive
```

**Edge cases to handle:**
- If fuel hits zero, set status to `out_of_fuel` and stop movement.
- If a ship reaches within ~0.05 degrees of its destination port, set status to `arrived`.
- If routing finds no valid path, set status to `stranded` and fire an alert.

---

## Step 2 — WebSocket broadcast

**What it is:** A persistent connection layer that pushes state to all connected clients.

**Rules from the spec:**
- No polling. WebSocket only.
- State must reach every connected client within 500ms of the tick.
- At least 5 concurrent viewers must stay in sync without state diverging.

**What to broadcast after every tick:**
```json
{
  "type": "fleet_update",
  "timestamp": 1234567890,
  "ships": [ ...all 15 ship state objects... ],
  "alerts": [ ...any new alerts this tick... ],
  "zones": [ ...current list of all restricted zones... ]
}
```

**Other message types you need:**
- `directive_sent` — command sends an order to a captain
- `directive_response` — captain accepts or escalates
- `zone_created` — command draws a new zone (broadcast to all)
- `alert_acknowledged` — someone dismissed an alert
- `distress_parsed` — AI finished analyzing a distress message

**On connect:** Send the new client the full current state immediately so they don't wait for the next tick.

---

## Step 3 — Map rendering

**What it is:** An interactive ocean map showing all 15 ships with smooth movement.

**Bounding box from fleet.json:**
- North: 30.5°, South: 22.0°, East: 60.0°, West: 47.5°

**Ship rendering:**
- Each ship is an icon on the map showing its heading direction.
- Clicking a ship opens an info panel showing: name, cargo, fuel (as a bar), speed, destination port name, current status.
- Color-code by status: normal = blue, rerouting = orange, distressed = red, stranded = dark red, arrived = green.

**Smooth interpolation (critical requirement):**
- When a new position arrives via WebSocket, do NOT teleport the ship.
- Instead, animate it from its last known position to the new one over the ~1 second interval.
- Respect a maximum speed — if a new position implies movement faster than the ship's max speed, clamp it (this catches any weird data glitches).

**Also render:**
- The navigable water polygon (from `fleet.json`) as a subtle overlay so operators can see the safe sailing area.
- All restricted zones drawn by command (filled red polygons with semi-transparency).
- Each ship's current planned path as a faint dotted line to its destination.

---

## Step 4 — Zone drawing + geofencing

**What it is:** Command draws polygonal no-go zones at runtime. The system detects when ships enter them.

**Drawing (command only):**
- Click-to-draw polygon tool on the map.
- Each click adds a vertex. Double-click or close the polygon to finish.
- Finished zones are sent to the server, stored, and broadcast to all clients.
- Command can also delete or edit existing zones.
- Captains can see zones on their map but cannot draw or edit them.

**Geofence breach detection (server-side, every tick):**
- For each ship, run point-in-polygon check against every active zone.
- If a ship is inside a zone this tick but was NOT inside last tick → breach.
- Breach alert must fire within 1 second of the ship crossing the boundary.
- Alert stays active until someone on command acknowledges it.

**Alert payload:**
```json
{
  "type": "geofence_breach",
  "shipId": "MV-3",
  "zoneId": "zone-001",
  "timestamp": 1234567890,
  "acknowledged": false
}
```

**Special case — zone drawn around a ship already inside it:**
- Detect on zone creation: check if any ship is already inside the new polygon.
- If yes, fire the breach alert immediately for that ship.
- Trigger rerouting for that ship (it needs to get out).

**Audible + visual alerts:**
- Play a sound when a breach fires.
- Show a persistent banner/panel listing all active unacknowledged alerts.
- Alert stays visible and audible (re-ping periodically) until acknowledged.

---

## Step 5 — Pathfinding + auto-reroute

**What it is:** Each ship follows a computed path from its current position to its destination that stays in navigable water and avoids restricted zones.

**Constraints:**
- Path must stay inside the navigable water polygon from `fleet.json`.
- Path must not pass through any currently active restricted zone.
- When a new zone is drawn that intersects a ship's current planned path → auto-reroute immediately, no operator approval needed.

**Algorithm (your choice, simplest that works):**
- Treat the navigable polygon as a grid or a set of waypoints.
- Run A* from current ship position to destination port, where nodes are grid cells or polygon waypoints, and edges that pass through restricted zones are blocked.
- The spec says: "A* on a grid, visibility graph, naive head-toward-destination-and-deflect-when-blocked — all valid. We're testing the behavior, not the algorithm."

**Recommended simple approach:**
1. Sample a grid of points inside the navigable water polygon (e.g. 0.1 degree spacing).
2. Connect neighboring grid points that are both inside the polygon and not inside any zone.
3. Run A* on that graph from ship position to destination.
4. The resulting path is a list of lat/lng waypoints the ship follows tick by tick.

**On zone draw:**
- Check if the new zone polygon intersects the line segments of each ship's current path.
- If yes → set ship status to `rerouting`, recompute path, status returns to `normal` once new path is ready.

**Stranded detection:**
- If A* finds no path (zones fully block all routes to destination) → set status to `stranded`, fire a stranded alert.

**Fuel feasibility check:**
- After computing a path, calculate total distance in nautical miles.
- Estimate fuel needed = distance × burn_rate (×1.3 if weather is bad along the route).
- If fuel remaining < fuel needed → set status flag `insufficient_fuel` but do NOT stop the ship. Keep moving. Fire a warning alert.

**Weather-aware routing:**
- When computing the path, treat grid cells with adverse weather as higher cost (not blocked, just more expensive).
- A* will naturally find routes that go around bad weather when a similarly-lengthed clear route exists.

---

## Step 6 — Role-based UIs

**Two separate interfaces, same map component underneath.**

### Command interface
- Sees all 15 ships on the map.
- Left panel: list of all ships with status indicators.
- Right panel: active alerts (unacknowledged geofence breaches, proximity warnings, distress calls).
- Click any ship → info panel + directive controls.
- Drawing toolbar for restricted zones.
- Can acknowledge alerts.

### Captain interface
- URL or login scoped to a single ship (e.g. `/captain/MV-7`).
- Map centered on that one ship. Other ships visible but not interactive.
- Sees restricted zones but no drawing tools.
- Directive inbox: shows any pending directives from command.
- Response buttons: **Accept** | **Escalate with distress message**.
- Text box for distress message (only shown when escalating).

### Directive flow (command → captain → everyone):
1. Command clicks a ship → opens "Send directive" panel.
2. Fills in: directive type (reroute to port / divert to waypoint / hold position), and destination if applicable.
3. Hits send → WebSocket message goes to that captain's session.
4. Captain sees directive notification on their screen.
5. Captain hits Accept → ship adopts new course on next tick → everyone's map updates.
6. Captain hits Escalate → text box appears → captain types distress message → sent to AI module.
7. AI response + directive response both broadcast to all connected clients immediately.

---

## Step 7 — Directives flow (detail)

**Directive types:**
- `reroute_to_port` — change destination to a different port from the ports list
- `divert_to_waypoint` — go to a specific lat/lng coordinate, then resume to original destination
- `hold_position` — stop and stay at current position

**On Accept:**
- Server updates ship's destination or inserts waypoint into its path.
- Next tick's routing picks up the change automatically.
- Status flips back to `normal` (or `rerouting` briefly while path recomputes).

**On Escalate:**
- Ship does NOT change course.
- Captain's distress message is passed to the AI module (Step 8).
- Distress alert fires in command's alert panel with the AI-parsed severity.

---

## Step 8 — AI distress parsing

**What it is:** When a captain escalates, their free-form text message is sent to an LLM. The LLM extracts structured data that feeds into alert prioritization.

**Input:** Raw captain message, e.g.:
> "Engine room flooding, cannot comply with reroute. Three crew injured, taking on water fast. Need immediate assistance."

**Prompt to LLM:**
```
You are analyzing a maritime distress message from a ship captain.
Extract the following fields as JSON:
- severity: integer 1–5 (1 = minor, 5 = immediate life threat)
- issue_type: short string (e.g. "flooding", "mechanical failure", "medical emergency")
- injury_count: integer or null if not mentioned
- damage_estimate: short string or null (e.g. "engine room flooded", "hull breach")
- recommended_action: short string (e.g. "dispatch rescue", "reroute nearby ships")
- can_continue_voyage: boolean

Respond ONLY with valid JSON, no explanation.
```

**Output used for:**
- Alert priority: severity 5 alerts show at the top of command's alert panel in red.
- Alert card shows: ship name, issue type, injury count, damage estimate, recommended action.
- Alerts are sorted by severity descending in the command alert panel.

---

## Step 9 — Weather fuel penalty

**What it is:** Ships in bad weather burn 30% more fuel. Routes prefer to avoid bad weather.

**Weather data:**
- Call Open-Meteo API on startup and every 30 minutes.
- Endpoint: `https://api.open-meteo.com/v1/forecast` with wind speed and wave height variables.
- Request a grid covering the bounding box (22°N–30.5°N, 47.5°E–60°E).
- Store as a grid of weather cells: `{ lat, lng, wind_speed_knots, is_adverse }`.
- Define adverse as: wind speed > 25 knots OR wave height > 3m (adjust to taste, document your threshold).

**Each tick:**
- Check the ship's current position against the weather grid.
- If the cell is adverse → multiply fuel burn by 1.3.
- Set a flag `weatherPenaltyActive: true` on the ship state (so the client can show a weather icon).

**In routing:**
- Treat adverse weather grid cells as higher cost in A* (e.g. cost multiplier 1.5).
- This makes the router naturally prefer routes that go around bad weather when distance difference is small.

---

## Step 10 — Proximity warnings

**What it is:** Continuous check for ships getting dangerously close to each other.

**Rule:** Any two ships within 2 km of each other → fire a proximity warning.

**Every tick:**
- Check all pairs of ships (15 ships = 105 pairs, fast enough).
- Compute distance between each pair using the Haversine formula.
- If distance < 2 km AND no warning already active for this pair → fire warning.
- If distance goes back above 2 km → auto-resolve the warning.

**Haversine formula (pseudocode):**
```
R = 6371 km
dlat = (lat2 - lat1) in radians
dlng = (lng2 - lng1) in radians
a = sin(dlat/2)² + cos(lat1) × cos(lat2) × sin(dlng/2)²
distance = 2 × R × asin(√a)
```

**Alert payload:**
```json
{
  "type": "proximity_warning",
  "ship1": "MV-3",
  "ship2": "MV-7",
  "distance_km": 1.4,
  "timestamp": 1234567890,
  "resolved": false
}
```

Goes into the same alert pipeline — visual + audible in command's alert panel.

---

## Step 11 — Snapshot store + playback

**What it is:** Save fleet state every 30 seconds. Let users scrub back through the last hour.

**Snapshot storage:**
- Every 30 seconds, write a snapshot object:
```json
{
  "timestamp": 1234567890,
  "ships": [ ...all 15 ship state objects... ],
  "alerts": [ ...alerts active at this moment... ],
  "zones": [ ...zones active at this moment... ]
}
```
- Keep the last 120 snapshots (= 60 minutes at 30-second resolution) in a ring buffer.
- Older snapshots are dropped automatically.

**Playback UI:**
- A timeline bar at the bottom of the screen showing the last 60 minutes.
- Scrubbing to a timestamp loads the nearest snapshot and renders the fleet as it was then.
- Playback mode is read-only — no zone drawing, no directives while scrubbing.
- A "return to live" button snaps back to the current real-time state.
- Key events (alerts, zone draws, status changes) are marked as dots on the timeline.

---

## Data structures reference

### Ship state
```json
{
  "shipId": "MV-7",
  "name": "Gharial",
  "position": [26.50, 53.50],
  "speed": 14,
  "heading": 270,
  "destination": "KWT-1",
  "destinationName": "Kuwait City",
  "destinationPosition": [29.48, 48.34],
  "fuel": 750,
  "fuelCapacity": 10000,
  "cargo": "crude oil",
  "status": "normal",
  "weatherPenaltyActive": false,
  "insufficientFuel": false,
  "currentPath": [[26.50, 53.00], [27.00, 51.00], [28.00, 49.50], [29.48, 48.34]],
  "pathIndex": 0,
  "activeDirective": null
}
```

### Alert
```json
{
  "alertId": "alert-001",
  "type": "geofence_breach | proximity_warning | stranded | insufficient_fuel | distress",
  "severity": 3,
  "shipId": "MV-3",
  "message": "MV-3 Cygnus entered restricted zone Zone-Alpha",
  "timestamp": 1234567890,
  "acknowledged": false,
  "relatedShipId": null,
  "aiParsed": null
}
```

### Restricted zone
```json
{
  "zoneId": "zone-001",
  "name": "Zone Alpha",
  "polygon": [[26.0, 54.0], [26.5, 54.0], [26.5, 55.0], [26.0, 55.0]],
  "createdAt": 1234567890,
  "createdBy": "command"
}
```

---

## Key numbers from the spec (must hit these)

| Requirement | Target |
|---|---|
| Active ships | Exactly 15 |
| Simulator tick rate | 1 Hz or faster |
| State delivery to all clients | Within 500ms, 95% of the time |
| Geofence breach alert latency | Within 1 second of boundary cross |
| Proximity warning threshold | 2 km between any two ships |
| Weather fuel penalty | 30% extra burn in adverse conditions |
| Concurrent viewers | At least 5, all in sync |
| Snapshot resolution | Every 30 seconds |
| Playback history | Last 60 minutes |

---

## docker-compose setup

The spec requires `docker compose up` to start everything. You need at minimum:

```
services:
  server      — backend + simulator + WebSocket + routing + alert engine
  client      — frontend serving Command and Captain UIs
  (optional)  — separate AI service if you want to isolate LLM calls
```

Document all required environment variables in the README:
```
OPENMETEO_BASE_URL=https://api.open-meteo.com/v1
LLM_API_KEY=your_key_here
LLM_API_URL=https://...
```

---

## What NOT to hardcode

The spec is explicit: only map/basemap tile URLs may be hardcoded. Everything else must be live:
- Ship positions, speeds, headings → from simulator (initialized from `fleet.json`)
- Alert data → generated at runtime
- AI outputs → real LLM calls, not canned responses
- Weather → real API calls

---

## Grading weights (keep these in mind)

| Criterion | Weight |
|---|---|
| Core functionality, consistent state across all clients | 60% |
| AI / NLP integration depth | 20% |
| Geospatial accuracy and UI/UX | 15% |
| Code quality and structure | 5% |

The 60% core is Steps 1–7 + 10. Lock those down before touching AI depth or UI polish.

---

## Bonuses (only after all 11 steps work)

Each bonus is worth up to +5%, additive, capped at 110% total.

- **Multiple route options** — when rerouting, generate 3 candidate paths (faster, safer, most fuel-efficient) and let command choose.
- **Ship-to-ship assistance** — distressed ship requests help from nearby fleet ships (fuel transfer, medical, escort). Receiving captain accepts or declines.
- **Predictive alerts** — fire before the event: "MV-3 will enter Zone Alpha in 3 minutes", "MV-7 will run out of fuel 40 km short of Kuwait City."
- **AI fleet advisor** — beyond reacting to distress, AI proactively suggests actions to command (who to reroute, where to draw a zone, who can send aid) with reasoning the operator can accept or reject.
