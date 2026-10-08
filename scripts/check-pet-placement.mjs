import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { gardenReducer, initialState, pets } from '../src/game/garden.ts';
import { createPetNavigation, petPlacementAt } from '../src/game/pet-placement.ts';
import { nearestGround, isWalkable } from '../src/game/garden-navigation.ts';
import { seasons } from '../src/game/seasons.ts';

let spots = 0;
for (const [width, height] of [[667,375], [800,360], [844,390], [915,412], [1024,768], [1366,1024]]) {
  for (const season of seasons) for (const pet of pets) {
    const map = createPetNavigation(width, height, season, pet);
    for (const [x, y] of [[0.3, 0.8], [0.5, 0.85], [0.74, 0.83], [0.72, 0.6]]) {
      const point = { x: x * width, y: y * height };
      const placement = petPlacementAt(map, width, height, point);
      assert(placement, 'All pet sizes can be placed beyond the old rectangle');
      assert(Math.abs(placement.x - x) < 1e-12); assert(Math.abs(placement.y - y) < 1e-12);
      assert.deepEqual(nearestGround(map, point), point, 'Returning to roaming does not move a valid placement');
      spots++;
    }
    for (const point of [{ x: 5, y: 5 }, { x: width * 0.08, y: height * 0.15 }, { x: width * 0.52, y: height * 0.48 },
      { x: width * 0.9, y: height * 0.5 }, { x: -1, y: 200 }, { x: width + 1, y: 200 }, { x: NaN, y: 200 }]) {
      assert.equal(petPlacementAt(map, width, height, point), null, 'Buildings, growing plot and off-screen taps cannot place a pet');
    }
    // Exercise the entire ground map, including areas beneath former UI boxes.
    for (const point of map.points.filter((_, index) => index % 15 === 0)) {
      const placement = petPlacementAt(map, width, height, point);
      assert(placement && isWalkable(map, point));
      assert(Math.abs(placement.x * width - point.x) < 1e-9);
      assert(Math.abs(placement.y * height - point.y) < 1e-9);
      spots++;
    }
  }
}
let state = gardenReducer(initialState(), { type: 'adoptPet', id: 'dog' });
state = gardenReducer(state, { type: 'plant', now: 0 });
const before = state;
state = gardenReducer(state, { type: 'placePet', id: 'dog', x: 0.74, y: 0.83 });
assert.deepEqual(state.roamingPets, [{ id: 'dog', x: 0.74, y: 0.83 }], 'Reducer preserves exact full-garden coordinates');
assert.strictEqual(state.session, before.session); assert.equal(state.coins, before.coins); assert.equal(state.xp, before.xp);
for (const [x, y] of [[-0.1, 0.5], [1.1, 0.5], [0.5, -0.1], [0.5, 1.1], [NaN, 0.5], [0.5, Infinity]]) {
  assert.strictEqual(gardenReducer(state, { type: 'placePet', id: 'dog', x, y }), state);
}
assert.strictEqual(gardenReducer(state, { type: 'placePet', id: 'cat', x: 0.7, y: 0.8 }), state, 'Unowned pets cannot be placed');

// Render the real screen with native controls represented as element objects.
// Drive its public callbacks to test hidden controls, placement and restoration.
const jsx = (type, props) => ({ type, props: props ?? {} });
const Fragment = 'Fragment', components = new Map();
function catalogModule(names) { return Object.fromEntries(names.map((name) => {
  const type = name; components.set(name, type); return [name, type];
})); }
const slots = [], effects = [];
let cursor = 0, currentTree;
const changed = (old, deps) => !old || deps.some((dep, i) => !Object.is(dep, old.deps[i]));
const react = {
  useState(initial) {
    const index = cursor++;
    if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
    return [slots[index].value, (value) => { slots[index].value = typeof value === 'function' ? value(slots[index].value) : value; }];
  },
  useMemo(callback, deps) {
    const index = cursor++, old = slots[index];
    if (changed(old, deps)) slots[index] = { deps, value: callback() };
    return slots[index].value;
  },
  useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
  useEffect(callback, deps) {
    const index = cursor++, old = slots[index];
    if (changed(old, deps)) effects.push(() => { old?.cleanup?.(); slots[index] = { deps, cleanup: callback() }; });
  },
};
let hardwareBack;
const native = {
  Pressable: 'Pressable', View: 'View',
  StyleSheet: { absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }, create: (styles) => styles },
  useWindowDimensions: () => ({ width: 844, height: 390 }),
  BackHandler: { addEventListener(_event, callback) { hardwareBack = callback; return { remove() { hardwareBack = undefined; } }; } },
};
state = gardenReducer(state, { type: 'renamePet', id: 'dog', name: 'Milo' });
const performed = [];
const files = {
  '@/components/garden/gardener': ['Gardener'],
  '@/components/garden/garden-panels': ['GardenPanel', 'PetNameEditor'],
  '@/components/garden/garden-ui': ['GardenText'],
  '@/components/garden/garden-hud': ['GardenHud', 'GardenSign'],
  '@/components/garden/season-weather': ['SeasonWeather'],
  '@/components/garden/garden-notice': ['GardenNotice'],
  '@/components/garden/garden-toolbar': ['GardenToolbar'],
  '@/components/garden/growing-panel': ['GrowingPanel'],
  '@/components/garden/level-celebration': ['LevelCelebration'],
  '@/components/garden/harvest-celebration': ['HarvestCelebration'],
  '@/components/garden/season-loading': ['SeasonBackground', 'SeasonLoading'],
  '@/components/garden/growing-plot': ['GrowingPlot'],
  '@/components/garden/crop-wheel': ['CropWheel'],
  '@/components/garden/pets': ['GardenPets'],
  '@/components/garden/display-greenhouse': ['DisplayGreenhouse'],
};
const modules = Object.fromEntries(Object.entries(files).map(([id, names]) => [id, catalogModule(names)]));
modules['@/components/garden/garden-ui'].palette = {};
const exports = {};
const game = await import('../src/game/garden.ts');
const navigation = await import('../src/game/garden-navigation.ts');
const placement = await import('../src/game/pet-placement.ts');
const layout = await import('../src/game/garden-layout.ts');
const compiled = ts.transpileModule(fs.readFileSync('src/app/index.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
vm.runInNewContext(compiled, { exports, require(id) {
  if (id === 'react') return react;
  if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment };
  if (id === 'react-native') return native;
  if (id === 'expo-router') return { router: { push() {} } };
  if (id === 'react-native-safe-area-context') return { useSafeAreaInsets: () => ({ left: 44, right: 44, top: 0, bottom: 21 }) };
  if (id === '@/game/garden') return game;
  if (id === '@/game/garden-navigation') return navigation;
  if (id === '@/game/pet-placement') return placement;
  if (id === '@/game/garden-layout') return layout;
  if (id === '@/game/garden-provider') return { useGarden: () => ({
    state, now: 0, scene: { phase: 'ready' }, harvest: null,
    perform(action) { performed.push(action); state = gardenReducer(state, action); },
  }) };
  if (modules[id]) return modules[id];
  throw new Error('Unexpected module ' + id);
} });
function render() { cursor = 0; currentTree = exports.default(); for (const effect of effects.splice(0)) effect(); return currentTree; }
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  const children = tree.props?.children;
  return [tree, ...(Array.isArray(children) ? children : [children]).flatMap((child) => Array.isArray(child) ? child.flatMap((item) => nodes(item)) : nodes(child))];
}
function node(type, predicate = () => true) { return nodes(currentTree).find((element) => element.type === type && predicate(element.props)); }
function beginPlacement() {
  node('GardenToolbar').props.onPets(); render();
  node('GardenPanel').props.onPlacePet('dog'); render();
}
render();
assert(node('GardenPets'), 'Existing animals remain mounted');
beginPlacement();
const layer = node('View', (props) => props.importantForAccessibility === 'no-hide-descendants');
assert(layer && layer.props.pointerEvents === 'none', 'Hidden controls cannot intercept any ground tap');
assert(layer.props.style.some((style) => style?.opacity === 0), 'All normal garden overlays disappear visually');
assert(node('SeasonBackground'), 'The backdrop remains mounted');
assert(!node('GardenPanel') && !node('PetNameEditor'), 'No modal remains over placement');
const surface = node('Pressable', (props) => props.accessibilityLabel === 'Tap open ground to place your pet');
assert(surface && !surface.props.children && !surface.props.style.backgroundColor, 'Placement adds no box, label, tint or visible controls');
assert.equal(surface.props.style.left, 0); assert.equal(surface.props.style.right, 0);
assert.equal(surface.props.style.top, 0); assert.equal(surface.props.style.bottom, 0);
surface.props.onPress({ nativeEvent: { locationX: 50, locationY: 50 } }); render();
assert(node('Pressable', (props) => props.accessibilityLabel === surface.props.accessibilityLabel), 'An invalid tap leaves placement active');
surface.props.onPress({ nativeEvent: { locationX: 844 * 0.74, locationY: 390 * 0.83 } }); render();
assert(!node('Pressable', (props) => props.accessibilityLabel === surface.props.accessibilityLabel), 'A valid tap closes placement automatically');
const placedDog = state.roamingPets.find((pet) => pet.id === 'dog');
assert(Math.abs(placedDog.x - 0.74) < 1e-12 && Math.abs(placedDog.y - 0.83) < 1e-12);
assert(node('View', (props) => props.importantForAccessibility === 'auto' && props.pointerEvents === 'box-none'), 'The full garden returns');
assert.equal(state.petNames.dog, 'Milo', 'Placement retains the name');
node('GardenPets').props.onPress('dog'); render();
assert.equal(node('PetNameEditor').props.id, 'dog', 'Pet tapping still opens its name feature');
assert.equal(node('GardenPets').props.pausedPet, 'dog');
node('PetNameEditor').props.onClose(); render();
beginPlacement();
const beforeCancel = state;
assert(hardwareBack()); render();
assert.strictEqual(state, beforeCancel, 'Cancelling placement does not reposition or spend anything');
assert(!hardwareBack, 'The placement back handler is removed afterward');
assert(!node('Pressable', (props) => props.accessibilityLabel === surface.props.accessibilityLabel));
console.log('Pet placement checks passed: ' + spots + ' exact full-garden ground spots, blocked taps, preserved rewards/names, backdrop-only placement, disabled hidden controls, automatic restoration, cancellation and tap-to-name.');
