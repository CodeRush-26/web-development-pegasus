/**
 * pathfinding/astar.js — A* Pathfinding Algorithm
 *
 * Finds the optimal route from a start position to a goal position
 * on a navigable grid. Returns an array of [lat, lng] waypoints.
 *
 * Uses a binary min-heap priority queue for O(log n) performance.
 */

import { snapToGrid } from "./grid.js";

/**
 * A* on a 2D grid of GridNode objects.
 *
 * @param {number[]} startPos  - [lat, lng] of ship
 * @param {number[]} goalPos   - [lat, lng] of destination port
 * @param {import('./grid.js').GridNode[][]} nodes
 * @param {{ latMin: number, lngMin: number, rows: number, cols: number }} meta
 * @returns {number[][] | null} Array of [lat, lng] waypoints, or null if no path
 */
function findPath(startPos, goalPos, nodes, meta) {
  const { r: startR, c: startC } = snapToGrid(startPos[0], startPos[1], meta);
  const { r: goalR, c: goalC } = snapToGrid(goalPos[0], goalPos[1], meta);

  const rows = meta.rows;
  const cols = meta.cols;

  // Bounds check
  if (
    startR < 0 || startR >= rows || startC < 0 || startC >= cols ||
    goalR < 0 || goalR >= rows || goalC < 0 || goalC >= cols
  ) {
    return null;
  }

  // Heuristic: Euclidean distance in grid cells
  const h = (r, c) => Math.sqrt((r - goalR) ** 2 + (c - goalC) ** 2);

  // g-cost and parent tracking
  const g = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => new Array(cols).fill(null));
  g[startR][startC] = 0;

  // Min-heap: [fCost, r, c]
  const open = [[h(startR, startC), startR, startC]];
  const closed = new Set();

  // 8-directional neighbours
  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];

  while (open.length > 0) {
    // Extract minimum f-cost node (simple sort — adequate for grid size)
    open.sort((a, b) => a[0] - b[0]);
    const [, cr, cc] = open.shift();
    const key = `${cr}_${cc}`;

    if (closed.has(key)) continue;
    closed.add(key);

    // Goal reached
    if (cr === goalR && cc === goalC) {
      return reconstructPath(parent, goalR, goalC, nodes);
    }

    for (const [dr, dc] of dirs) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (!nodes[nr][nc].walkable) continue;
      if (closed.has(`${nr}_${nc}`)) continue;

      // Diagonal step costs sqrt(2)
      const stepCost = (dr !== 0 && dc !== 0 ? 1.414 : 1) * nodes[nr][nc].cost;
      const tentativeG = g[cr][cc] + stepCost;

      if (tentativeG < g[nr][nc]) {
        g[nr][nc] = tentativeG;
        parent[nr][nc] = [cr, cc];
        open.push([tentativeG + h(nr, nc), nr, nc]);
      }
    }
  }

  // No path found
  return null;
}

/**
 * Reconstructs the path from A* parent map.
 *
 * @param {(number[]|null)[][]} parent
 * @param {number} goalR
 * @param {number} goalC
 * @param {import('./grid.js').GridNode[][]} nodes
 * @returns {number[][]} [lat, lng] waypoints from start to goal
 */
function reconstructPath(parent, goalR, goalC, nodes) {
  const path = [];
  let cur = [goalR, goalC];

  while (cur !== null) {
    const [r, c] = cur;
    path.unshift([nodes[r][c].lat, nodes[r][c].lng]);
    cur = parent[r][c];
  }

  // Reduce waypoints: only keep direction changes (Douglas-Peucker lite)
  return simplifyPath(path);
}

/**
 * Removes collinear intermediate waypoints to reduce path length.
 * Keeps endpoints and direction-change nodes only.
 *
 * @param {number[][]} path
 * @returns {number[][]}
 */
function simplifyPath(path) {
  if (path.length <= 2) return path;
  const result = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const cur = path[i];
    const next = path[i + 1];
    const dr1 = cur[0] - prev[0];
    const dc1 = cur[1] - prev[1];
    const dr2 = next[0] - cur[0];
    const dc2 = next[1] - cur[1];
    // Keep if direction changes
    if (dr1 !== dr2 || dc1 !== dc2) result.push(cur);
  }
  result.push(path[path.length - 1]);
  return result;
}

/**
 * Finds the shortest path to the nearest safe (walkable) node.
 * Uses BFS because edge weights are uniform (1) and we just want the nearest walkable node.
 */
function findEscapePath(startPos, nodes, meta) {
  const { r: startR, c: startC } = snapToGrid(startPos[0], startPos[1], meta);
  const rows = meta.rows;
  const cols = meta.cols;

  if (startR < 0 || startR >= rows || startC < 0 || startC >= cols) {
    return null;
  }

  if (nodes[startR][startC].walkable) {
    return [startPos];
  }

  const queue = [[startR, startC]];
  const visited = new Set();
  const parent = Array.from({ length: rows }, () => new Array(cols).fill(null));

  visited.add(`${startR}_${startC}`);

  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];

  let targetR = -1;
  let targetC = -1;

  while (queue.length > 0) {
    const [cr, cc] = queue.shift();

    if (nodes[cr][cc].walkable) {
      targetR = cr;
      targetC = cc;
      break;
    }

    for (const [dr, dc] of dirs) {
      const nr = cr + dr;
      const nc = cc + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const key = `${nr}_${nc}`;
        if (!visited.has(key)) {
          visited.add(key);
          parent[nr][nc] = [cr, cc];
          queue.push([nr, nc]);
        }
      }
    }
  }

  if (targetR !== -1 && targetC !== -1) {
    const path = [];
    let currR = targetR;
    let currC = targetC;
    
    while (currR !== null && currC !== null) {
      const node = nodes[currR][currC];
      path.unshift([node.lat, node.lng]);
      
      const p = parent[currR][currC];
      if (p) {
        currR = p[0];
        currC = p[1];
      } else {
        break;
      }
    }
    
    path[0] = startPos;
    return simplifyPath(path);
  }

  return null;
}

export { findPath, findEscapePath };
