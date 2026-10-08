import assert from 'node:assert/strict';
import { createNavigation, findGardenPath, nearestGround, randomGardenPath, clearSegment, isWalkable, gardenObstacles, isGardenGround, signGeometry, displayGeometry, growingGeometry, walkDirection } from '../src/game/garden-navigation.ts';
import { fallingPhase, seasons, weatherParticles } from '../src/game/seasons.ts';
import { initialGardenUI, gardenUIReducer, HARVEST_DURATION } from '../src/game/notices.ts';
import { characterMetrics } from '../src/game/character-metrics.ts';
import { pets } from '../src/game/garden.ts';
import { petDimensions, petWorldScale } from '../src/game/pet-art.ts';

let seed = 127;
const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
let routes = 0;
for (const [width, height] of [[667, 375], [800, 360], [844, 390], [915, 412], [1024, 768], [1366, 1024]]) {
  const farmer = characterMetrics(height, 3);
  const sign = signGeometry(width, height), display = displayGeometry(width, height);
  assert(sign.top + sign.height < display.top, 'The compact sign stands above the display houses');
  for (const season of seasons) for (const [sw, sh] of [[48, 64], [farmer.width, farmer.height], [48, 48], [40, 40]]) {
    const map = createNavigation(width, height, season, sw, sh), scenery = gardenObstacles(width, height, season);
    let position = nearestGround(map, { x: width * 0.28 + sw / 2, y: height * 0.4 + sh });
    const opposite = nearestGround(map, { x: width * 0.74, y: height * 0.6 });
    const detour = findGardenPath(map, position, opposite);
    assert(detour.length > 2, 'Walking to the far side takes a detour around the growing plot');
    assert.deepEqual(detour.at(-1), opposite, 'A reachable tap is reached exactly');
    const destinations = new Set();
    const oldSignGround = { x: width * 0.20, y: Math.max(height * 0.50, height * 0.32 + sh + 4) };
    assert(isGardenGround(width, height, season, oldSignGround), 'The old sign position accepts walking taps');
    assert(isWalkable(map, oldSignGround), 'Characters and pets fit in the space freed by the old sign');
    assert(findGardenPath(map, position, oldSignGround).length > 1, 'The former sign space is reachable');
    function inspect(path) {
      assert(path.length > 1, 'A route is available');
      assert.deepEqual(path[0], position, 'A new route begins at the actual current position');
      for (let n = 1; n < path.length; n++) {
        assert(clearSegment(map, path[n - 1], path[n]), 'Every segment clears obstacles, including diagonal corners');
        for (let t = 0; t <= 1; t += 0.1) {
          const p = { x: path[n - 1].x + (path[n].x - path[n - 1].x) * t, y: path[n - 1].y + (path[n].y - path[n - 1].y) * t };
          assert(isWalkable(map, p));
          for (const r of scenery) assert(p.x + sw / 2 < r.left || p.x - sw / 2 > r.right || p.y < r.top || p.y - sh > r.bottom,
            'The entire sprite stays off buildings, trees, fences, and the sign');
        }
      }
      routes++;
    }
    inspect(detour);
    // Interrupt halfway through a leg, as a second screen tap or foreground resume would.
    position = { x: (detour[0].x + detour[1].x) / 2, y: (detour[0].y + detour[1].y) / 2 };
    inspect(findGardenPath(map, position, opposite));
    for (let walk = 0; walk < 16; walk++) {
      const path = randomGardenPath(map, position, random); inspect(path); position = path.at(-1);
      destinations.add(JSON.stringify(position));
    }
    assert(destinations.size > 8, 'Wandering chooses varied destinations, rather than a repeating circuit');
    for (const r of scenery) assert.equal(isGardenGround(width, height, season, { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 }), false);
  }
}
let cardinalRoutes = 0;
for (const [width, height] of [[667, 375], [800, 360], [844, 390], [915, 412], [1024, 768], [1366, 1024]]) {
  const farmer = characterMetrics(height, 3);
  const walkers = [
    { ...farmer, name: 'gardener' },
    ...[false, true].map((baby) => {
      const pet = pets.find((p) => !!p.baby === baby);
      const size = petDimensions(pet), scale = petWorldScale(pet);
      return { width: size.width * scale, height: size.height * scale, scale, name: baby ? 'baby pet' : 'adult pet' };
    }),
  ];
  for (const season of seasons) for (const walker of walkers) {
    const map = createNavigation(width, height, season, walker.width, walker.height, { footprintHeight: 10 * walker.scale });
    let position = nearestGround(map, { x: width * 0.30, y: height * 0.55 });
    const plot = growingGeometry(width, height, season);
    // Several separate rows south of the bed must stay reachable, not one lane.
    for (const y of [plot.top + plot.height + 30 + 10 * walker.scale, height * 0.82, height * 0.90]) {
      const target = { x: plot.left + plot.width / 2, y };
      assert(isWalkable(map, target), 'Open grass below the bed accepts the ' + walker.name + ' footprint');
      inspectCardinal(findGardenPath(map, position, target, true));
    }
    function inspectCardinal(route) {
      assert(route.length > 1);
      assert.deepEqual(route[0], position);
      for (let i = 1; i < route.length; i++) {
        const a = route[i - 1], b = route[i];
        assert(a.x === b.x || a.y === b.y, 'Every movement is north, south, east, or west');
        assert(clearSegment(map, a, b), 'Right-angle routes avoid all ground obstacles');
      }
      cardinalRoutes++;
    }
    for (let i = 0; i < 20; i++) {
      const route = randomGardenPath(map, position, random, true);
      inspectCardinal(route);
      const interrupted = { x: (route[0].x + route[1].x) / 2, y: (route[0].y + route[1].y) / 2 };
      position = interrupted;
      const resumed = findGardenPath(map, position, route.at(-1), true);
      inspectCardinal(resumed);
      assert.deepEqual(resumed.at(-1), route.at(-1), 'Interrupted cardinal walks still reach the exact tap');
      position = resumed.at(-1);
    }
  }
}
assert.equal(walkDirection({ x: 0, y: 0 }, { x: 1, y: 0 }), 'east');
assert.equal(walkDirection({ x: 0, y: 0 }, { x: -1, y: 0 }), 'west');
assert.equal(walkDirection({ x: 0, y: 0 }, { x: 0, y: 1 }), 'south');
assert.equal(walkDirection({ x: 0, y: 0 }, { x: 0, y: -1 }), 'north');
console.log('Cardinal movement checks passed: ' + cardinalRoutes + ' gardener/adult-pet/baby-pet routes and three separate walking rows below each plot.');
// A solid wall must produce no path rather than silently crossing it.
const split = createNavigation(844, 390, 'spring', 44, 44);
split.obstacles.push({ left: 390, right: 410, top: 0, bottom: 390 });
assert.deepEqual(findGardenPath(split, { x: 300, y: 280 }, { x: 620, y: 280 }), []);
assert.deepEqual(findGardenPath(split, { x: 300, y: 280 }, { x: 620, y: 280 }, true), [], 'Cardinal routes cannot cross a solid wall');
for (const season of seasons) for (const { phase, duration } of weatherParticles(season)) {
  let previous = fallingPhase(0, phase, duration), wraps = 0;
  for (let elapsed = 100; elapsed <= 600000; elapsed += 100) {
    const next = fallingPhase(elapsed, phase, duration);
    assert(next >= 0 && next < 1);
    if (next < previous) { wraps++; assert(previous > 0.99 && next < 0.01, 'Wrap happens offscreen at the end of each fall'); }
    else assert(next > previous, 'Weather keeps moving downward for ten minutes');
    previous = next;
  }
  assert(wraps >= 20, 'Snow, leaves and petals repeatedly enter again from the top');
}
for (const action of ['harvest', 'keep']) {
  let ui = initialGardenUI();
  const perform = (command, now = 0) => { ui = gardenUIReducer(ui, { type: 'perform', action: command, now }); };
  perform({ type: action }); assert.equal(ui.harvest, null, 'Empty plots cannot emit a harvest burst');
  perform({ type: 'plant', now: 0 });
  perform({ type: action }); assert.equal(ui.harvest, null, 'Unripe crops cannot emit a harvest burst');
  perform({ type: 'tick', now: ui.state.session.deadline });
  const before = ui.state;
  perform({ type: action }, 21000);
  const burst = ui.harvest;
  assert(burst && burst.plantId === 'carrot');
  assert.equal(burst.coins, action === 'keep' ? 0 : 29);
  assert.equal(burst.xp, 60);
  assert.equal(burst.expiresAt, 21000 + HARVEST_DURATION);
  assert.equal(ui.state.coins, before.coins + burst.coins, 'Rewards arrive immediately with the animation');
  assert.equal(ui.state.xp, before.xp + 60);
  perform({ type: action }, 21100);
  assert.strictEqual(ui.harvest, burst, 'Repeated taps cannot replay the burst or award again');
  assert.equal(ui.state.xp, before.xp + 60);
  assert.strictEqual(gardenUIReducer(ui, { type: 'expireHarvest', id: burst.id - 1 }), ui, 'Stale cleanup cannot cancel a newer burst');
  ui = gardenUIReducer(ui, { type: 'expireHarvest', id: burst.id });
  assert.equal(ui.harvest, null);
}
console.log('Motion checks passed: ' + routes + ' collision-free routes, interrupted taps, random wandering, continuous weather loops, and exactly-once harvest/keep bursts.');
