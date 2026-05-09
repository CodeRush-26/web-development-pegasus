import fs from "fs";
import { computeRoute } from "./pathfinding/routeManager.js";
import { NAVIGABLE_POLYGON, PORTS_MAP, INITIAL_FLEET } from "./data/fleet.js";
import { initFleet } from "./simulator/shipState.js";

async function run() {
  const fleet = initFleet(INITIAL_FLEET);

  for (const [id, ship] of fleet) {
    const routed = computeRoute(ship, [], []);
    console.log(`[Route] ${id}: ${routed.currentPath.length} waypoints, A* ${routed.currentPath.length > 14 ? 'succeeded' : 'failed'}`);
  }
}
run();
