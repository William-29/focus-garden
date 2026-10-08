import type { Season } from './seasons';

export type Point = { x: number; y: number };
export type Rect = { left: number; top: number; right: number; bottom: number };
export type WalkCommand = Point & { id: number };
export function growingGeometry(width: number, height: number, season: Season) {
  return { left: Math.round(width * 0.43), top: Math.round(height * (season === 'winter' ? 0.37 : 0.35)),
    width: Math.round(width * 0.17), height: Math.round(height * 0.27) };
}
export function displayGeometry(width: number, height: number) {
  return { left: Math.round(width * 0.25), top: Math.round(height * 0.17), width: Math.round(width * 0.46),
    bayHeight: Math.max(44, Math.round(height * 0.1)) };
}
export function signGeometry(width: number, height: number) {
  const signWidth = Math.min(112, Math.round(width * 0.14));
  return { left: Math.round(width * 0.54 - signWidth / 2), top: Math.round(height * 0.025), width: signWidth, height: 38 };
}

export function gardenObstacles(width: number, height: number, season: Season): Rect[] {
  const box = (left: number, top: number, right: number, bottom: number): Rect =>
    ({ left: left * width, top: top * height, right: right * width, bottom: bottom * height });
  const display = displayGeometry(width, height), plot = growingGeometry(width, height, season), sign = signGeometry(width, height);
  return [
    box(0, 0, 0.27, 0.32), // Shed, woodpile and surrounding shrubs.
    box(0, 0.32, 0.13, 0.60), box(0, 0.59, 0.20, 1), // Left bushes and blossom tree.
    box(0.79, 0, 1, 0.39), box(0.82, 0.36, 1, 0.70), // Evergreen and well.
    box(0.85, 0.68, 1, 1), box(0, 0.94, 1, 1), // Border shrubs/fence.
    box(0.27, 0, 0.46, 0.09), box(0.62, 0, 0.79, 0.13),
    { left: sign.left, top: sign.top, right: sign.left + sign.width, bottom: sign.top + sign.height },
    { left: display.left - 4, top: display.top - 5, right: display.left + display.width + 4,
      bottom: display.top + display.bayHeight + 18 },
    { left: plot.left - 9, top: plot.top - (season === 'winter' ? 25 : 13), right: plot.left + plot.width + 9,
      bottom: plot.top + plot.height + 25 },
  ];
}

export type NavigationMap = {
  bounds: Rect; obstacles: Rect[]; points: Point[]; cells: number[]; columns: number; rows: number; step: number;
};
const inside = (p: Point, r: Rect) => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
export function isWalkable(map: Pick<NavigationMap, 'bounds' | 'obstacles'>, point: Point) {
  return Number.isFinite(point.x) && Number.isFinite(point.y) && inside(point, map.bounds) && !map.obstacles.some((r) => inside(point, r));
}
export function isGardenGround(width: number, height: number, season: Season, point: Point) {
  return isWalkable({ bounds: { left: width * 0.035, right: width * 0.965, top: height * 0.07, bottom: height * 0.94 },
    obstacles: gardenObstacles(width, height, season) }, point);
}

// Coordinates refer to feet. Gardeners and roaming pets use a small ground
// footprint, allowing their heads to overlap scenery in perspective.
export function createNavigation(width: number, height: number, season: Season, spriteWidth: number, spriteHeight: number, options: { footprintHeight?: number } = {}): NavigationMap {
  const padding = 3, footprintHeight = options.footprintHeight ?? spriteHeight;
  const bounds = { left: width * 0.035 + spriteWidth / 2, right: width * 0.965 - spriteWidth / 2,
    top: height * 0.04 + spriteHeight, bottom: height * 0.94 - padding };
  const obstacles = gardenObstacles(width, height, season).map((r) => ({ left: r.left - spriteWidth / 2 - padding,
    right: r.right + spriteWidth / 2 + padding, top: r.top - padding, bottom: r.bottom + footprintHeight + padding }));
  const step = 12, columns = Math.ceil((bounds.right - bounds.left) / step) + 1, rows = Math.ceil((bounds.bottom - bounds.top) / step) + 1;
  const map: NavigationMap = { bounds, obstacles, step, columns, rows, points: [], cells: Array(columns * rows).fill(-1) };
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const point = { x: Math.min(bounds.right, bounds.left + col * step), y: Math.min(bounds.bottom, bounds.top + row * step) };
    if (isWalkable(map, point)) { map.cells[row * columns + col] = map.points.length; map.points.push(point); }
  }
  return map;
}

function hitsRect(a: Point, b: Point, rect: Rect) {
  let enter = 0, leave = 1;
  for (const [origin, delta, low, high] of [[a.x, b.x - a.x, rect.left, rect.right], [a.y, b.y - a.y, rect.top, rect.bottom]]) {
    if (Math.abs(delta) < 0.000001) { if (origin < low || origin > high) return false; }
    else {
      const near = (low - origin) / delta, far = (high - origin) / delta;
      enter = Math.max(enter, Math.min(near, far)); leave = Math.min(leave, Math.max(near, far));
      if (enter > leave) return false;
    }
  }
  return true;
}
export function clearSegment(map: NavigationMap, a: Point, b: Point) {
  return isWalkable(map, a) && isWalkable(map, b) && !map.obstacles.some((rect) => hitsRect(a, b, rect));
}
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export function nearestGround(map: NavigationMap, point: Point): Point {
  if (isWalkable(map, point)) return point;
  return map.points.reduce((best, p) => distance(point, p) < distance(point, best) ? p : best, map.points[0] ?? point);
}

export type WalkDirection = 'north' | 'south' | 'west' | 'east';
export function walkDirection(from: Point, to: Point): WalkDirection {
  return Math.abs(to.x - from.x) > Math.abs(to.y - from.y)
    ? to.x < from.x ? 'west' : 'east' : to.y < from.y ? 'north' : 'south';
}

// Connect exact taps and interrupted positions without a diagonal first/last leg.
function cardinalConnection(map: NavigationMap, from: Point, to: Point): Point[] {
  for (const elbow of [{ x: to.x, y: from.y }, { x: from.x, y: to.y }]) {
    if (clearSegment(map, from, elbow) && clearSegment(map, elbow, to)) return [from, elbow, to];
  }
  return [];
}
function compressCardinal(route: Point[]): Point[] {
  const result: Point[] = [];
  for (const point of route) {
    if (result.length && distance(result[result.length - 1], point) < 0.000001) continue;
    const a = result[result.length - 2], b = result[result.length - 1];
    if (a && ((a.x === b.x && b.x === point.x) || (a.y === b.y && b.y === point.y))) result.pop();
    result.push(point);
  }
  return result;
}

export function findGardenPath(map: NavigationMap, from: Point, destination: Point, cardinal = false): Point[] {
  const start = nearestGround(map, from), goal = nearestGround(map, destination);
  if (!isWalkable(map, start) || !isWalkable(map, goal)) return [];
  if (cardinal) {
    const direct = cardinalConnection(map, start, goal);
    if (direct.length) return compressCardinal(direct);
  } else if (clearSegment(map, start, goal)) return [start, goal];
  // Connect arbitrary tap/current positions to visible grid nodes. Checking the
  // connecting segments prevents corner cutting even when interrupting a walk.
  const nearestVisible = (p: Point) => {
    let best = -1, bestDistance = Infinity;
    map.points.forEach((node, index) => {
      const d = distance(p, node);
      if (d < bestDistance && (cardinal ? cardinalConnection(map, p, node).length > 0 : clearSegment(map, p, node))) { best = index; bestDistance = d; }
    });
    return best;
  };
  const first = nearestVisible(start), last = nearestVisible(goal);
  if (first < 0 || last < 0) return [];
  const costs = new Float64Array(map.points.length).fill(Infinity), parents = new Int32Array(map.points.length).fill(-1);
  const cellsByPoint = new Int32Array(map.points.length);
  map.cells.forEach((index, cell) => { if (index >= 0) cellsByPoint[index] = cell; });
  const open = new Set([first]), closed = new Set<number>(); costs[first] = 0;
  while (open.size) {
    let current = -1, score = Infinity;
    for (const index of open) {
      const f = costs[index] + distance(map.points[index], map.points[last]);
      if (f < score) { score = f; current = index; }
    }
    if (current === last) {
      const route = [goal]; let cursor = last;
      while (cursor !== -1) { route.unshift(map.points[cursor]); cursor = parents[cursor]; }
      if (cardinal) {
        return compressCardinal([
          ...cardinalConnection(map, start, map.points[first]),
          ...route.slice(0, -1),
          ...cardinalConnection(map, map.points[last], goal),
        ]);
      }
      route.unshift(start);
      const smooth = [start]; let head = 0;
      while (head < route.length - 1) {
        let next = route.length - 1;
        while (next > head + 1 && !clearSegment(map, route[head], route[next])) next--;
        smooth.push(route[next]); head = next;
      }
      return smooth;
    }
    open.delete(current); closed.add(current);
    const cell = cellsByPoint[current], col = cell % map.columns, row = Math.floor(cell / map.columns);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || (cardinal && dx !== 0 && dy !== 0) || col + dx < 0 || col + dx >= map.columns || row + dy < 0 || row + dy >= map.rows) continue;
      const next = map.cells[(row + dy) * map.columns + col + dx];
      if (next < 0 || closed.has(next) || !clearSegment(map, map.points[current], map.points[next])) continue;
      const cost = costs[current] + distance(map.points[current], map.points[next]);
      if (cost < costs[next]) { costs[next] = cost; parents[next] = current; open.add(next); }
    }
  }
  return [];
}

export function randomGardenPath(map: NavigationMap, from: Point, random = Math.random, cardinal = false): Point[] {
  for (let attempt = 0; attempt < 24; attempt++) {
    const target = map.points[Math.min(map.points.length - 1, Math.floor(random() * map.points.length))];
    if (!target || distance(from, target) < 35) continue;
    const path = findGardenPath(map, from, target, cardinal);
    if (path.length > 1) return path;
  }
  return [];
}
