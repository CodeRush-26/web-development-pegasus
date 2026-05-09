import { point, polygon, booleanPointInPolygon } from "@turf/turf";
import fs from "fs";

const fleet = JSON.parse(fs.readFileSync("../fleet.json", "utf-8"));
const navCoords = fleet.navigableWater.map((p) => [p[1], p[0]]); // [lng, lat]
if (
  navCoords[0][0] !== navCoords[navCoords.length - 1][0] ||
  navCoords[0][1] !== navCoords[navCoords.length - 1][1]
) {
  navCoords.push(navCoords[0]);
}
const navPolygon = polygon([navCoords]);

import { buildGrid, snapToGrid } from "./pathfinding/grid.js";
import { findPath } from "./pathfinding/astar.js";

const { nodes, meta } = buildGrid(fleet.navigableWater, [], []);
console.log(`Grid: ${meta.rows} rows x ${meta.cols} cols`);

// Test MV-2 -> DXB-1 route
const mv2 = fleet.fleet.find(s => s.shipId === "MV-2");
const dxb1 = fleet.ports.find(p => p.id === "DXB-1");
console.log(`MV-2 pos: [${mv2.position}], DXB-1 pos: [${dxb1.position}]`);

const path = findPath(mv2.position, dxb1.position, nodes, meta);
if (path) {
  console.log(`✅ MV-2 → DXB-1: Path found! ${path.length} waypoints`);
  console.log(`   Start: [${path[0]}] → End: [${path[path.length-1]}]`);
} else {
  console.log(`❌ MV-2 → DXB-1: No path found`);
}

// Test ALL ships
console.log("\n--- All Ships ---");
for (const ship of fleet.fleet) {
  const dest = fleet.ports.find(p => p.id === ship.destination);
  if (!dest) { console.log(`${ship.shipId}: no dest port`); continue; }
  const p = findPath(ship.position, dest.position, nodes, meta);
  console.log(`${ship.shipId} (${ship.name}) → ${dest.name}: ${p ? `✅ ${p.length} waypoints` : '❌ NO PATH'}`);
}
