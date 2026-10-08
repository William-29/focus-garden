import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { gardenReducer as reduce, initialState, pets } from '../src/game/garden.ts';
import { PET_NAME_LIMIT, normalizePetName, petDisplayName, parsePetNames } from '../src/game/pet-names.ts';
import { gardenUIReducer, initialGardenUI } from '../src/game/notices.ts';
import * as navigation from '../src/game/garden-navigation.ts';

for (const value of [null, 'broken JSON', 'null', '[]', '{}', '{"dog":3,"cat":" "}', '{"made-up":"Bob"}']) {
  assert.deepEqual(parsePetNames(value, pets), {}, 'Invalid device data is ignored safely');
}
assert.equal(normalizePetName('  Milo\n Green '), 'Milo Green');
assert.equal(normalizePetName('🌸'.repeat(40)), '🌸'.repeat(PET_NAME_LIMIT), 'Unicode is not split');
let state = initialState();
assert.strictEqual(reduce(state, { type: 'renamePet', id: 'dog', name: 'Milo' }), state, 'Unowned pets cannot be renamed');
state = reduce(state, { type: 'adoptPet', id: 'dog' });
state = reduce(state, { type: 'placePet', id: 'dog', x: 0.3, y: 0.5 });
for (const name of [' ', '', 12, null]) assert.strictEqual(reduce(state, { type: 'renamePet', id: 'dog', name }), state);
assert.strictEqual(reduce(state, { type: 'renamePet', id: 'unknown', name: 'Milo' }), state);
state = reduce(state, { type: 'plant', now: 0 });
const before = state;
state = reduce(state, { type: 'renamePet', id: 'dog', name: '  Milo\n  Green  ' });
assert.equal(state.petNames.dog, 'Milo Green');
assert.equal(petDisplayName(pets[0], state.petNames), 'Milo Green');
for (const key of ['session', 'inventory', 'roamingPets', 'ownedPets', 'look']) assert.strictEqual(state[key], before[key], 'Renaming preserves ' + key);
assert.equal(state.coins, before.coins); assert.equal(state.xp, before.xp);
assert.strictEqual(reduce(state, { type: 'renamePet', id: 'dog', name: 'Milo Green' }), state);
const restored = reduce(state, { type: 'restorePetNames', names: parsePetNames('{"dog":"Older name","cat":"Bean"}', pets) });
assert.equal(restored.petNames.dog, 'Milo Green', 'A delayed read cannot overwrite a local edit');
assert.equal(restored.petNames.cat, 'Bean', 'A quick edit preserves other saved pet names');
assert.equal(restored.message, state.message);
assert.equal(restored.noticeRevision, state.noticeRevision);
const reloaded = reduce(initialState(), { type: 'restorePetNames', names: parsePetNames(JSON.stringify(restored.petNames), pets) });
assert.deepEqual(reloaded.petNames, restored.petNames, 'Names survive the storage round trip');
assert.deepEqual(reloaded.ownedPets, [], 'Name hydration does not grant pets or change the existing economy');
state = reduce(restored, { type: 'storePet', id: 'dog' });
state = reduce(state, { type: 'placePet', id: 'dog', x: 0.2, y: 0.4 });
assert.equal(state.petNames.dog, 'Milo Green', 'Resting and placing retain the pet name');
const ui = initialGardenUI();
assert.equal(gardenUIReducer(ui, { type: 'perform', action: { type: 'restorePetNames', names: { dog: 'Milo' } }, now: 0 }).notice, null);

// Exercise the real hook with controllable native-position callbacks and time.
// No source-text assertions: these checks observe stopped/resumed animation.
const compiled = ts.transpileModule(fs.readFileSync('src/hooks/use-garden-walker.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function walkerHarness() {
  const slots = [], effects = [], animations = new Set(), appListeners = new Set(), timers = new Map();
  let cursor = 0, dirty = false, time = 0, timerId = 0, starts = 0, result;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) {
        const slot = { value: typeof initial === 'function' ? initial() : initial };
        slot.set = (value) => { const next = typeof value === 'function' ? value(slot.value) : value; if (!Object.is(next, slot.value)) { slot.value = next; dirty = true; } };
        slots[index] = slot;
      }
      return [slots[index].value, slots[index].set];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(callback, deps) {
      const index = cursor++, old = slots[index];
      if (!old || deps.some((value, i) => !Object.is(value, old.deps[i]))) {
        effects.push(() => { old?.cleanup?.(); const cleanup = callback(); slots[index] = { deps, cleanup }; });
      }
    },
  };
  class ValueXY {
    constructor(point) { this.native = { ...point }; this.listeners = new Map(); }
    setValue(point) { this.native = { ...point }; for (const listener of this.listeners.values()) listener(this.native); }
    addListener(listener) { const id = String(this.listeners.size + 1); this.listeners.set(id, listener); return id; }
    removeListener(id) { this.listeners.delete(id); }
    stopAnimation(callback) { this.animation?.stop(); callback?.(this.native); }
  }
  const native = {
    Animated: { ValueXY, timing(value, options) {
      const animation = {
        value, options, start(callback) { this.callback = callback; value.animation = this; animations.add(this); starts++; },
        stop() { animations.delete(this); if (value.animation === this) value.animation = null; this.callback?.({ finished: false }); },
        finish() { animations.delete(this); value.animation = null; value.setValue(options.toValue); this.callback?.({ finished: true }); },
      };
      return animation;
    } },
    AppState: { currentState: 'active', addEventListener(_event, listener) { appListeners.add(listener); return { remove: () => appListeners.delete(listener) }; } },
    Easing: { linear: (n) => n },
  };
  function schedule(callback, delay, interval = false) { const id = ++timerId; timers.set(id, { callback, due: time + delay, delay, interval }); return id; }
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, require(id) { if (id === 'react') return react; if (id === 'react-native') return native; if (id === '@/game/garden-navigation') return navigation; throw new Error(id); },
    setTimeout: (fn, ms) => schedule(fn, ms), clearTimeout: (id) => timers.delete(id),
    setInterval: (fn, ms) => schedule(fn, ms, true), clearInterval: (id) => timers.delete(id),
  });
  return {
    render(props) {
      let attempts = 0;
      do {
        assert(attempts++ < 20, 'Hook effects settle');
        cursor = 0; dirty = false; result = exports.useGardenWalker(props);
        for (const effect of effects.splice(0)) effect();
      } while (dirty);
      return result;
    },
    advance(ms) {
      const end = time + ms;
      for (let count = 0; count < 1000; count++) {
        const next = [...timers].filter(([, timer]) => timer.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) { time = end; return; }
        const [id, timer] = next; time = timer.due;
        if (timer.interval) timer.due += timer.delay; else timers.delete(id);
        timer.callback();
      }
      throw new Error('Timers did not settle');
    },
    app(status) { native.AppState.currentState = status; for (const listener of appListeners) listener(status); },
    animations, get starts() { return starts; },
    dispose() { for (const slot of slots) slot?.cleanup?.(); },
  };
}
const map = navigation.createNavigation(844, 390, 'spring', 48, 48, { footprintHeight: 15 });
const props = { map, spawn: navigation.nearestGround(map, { x: 280, y: 300 }), speed: 22, cardinal: true };
const pet = walkerHarness(), otherPet = walkerHarness();
let walking = pet.render(props);
otherPet.render(props);
assert(walking.walking); assert.equal(pet.animations.size, 1);
const segment = [...pet.animations][0], start = { ...walking.position.native }, target = segment.options.toValue;
// Native motion can be ahead of the JS listener. Pausing must capture it.
const midway = { x: (start.x + target.x) / 2, y: (start.y + target.y) / 2 };
walking.position.native = { ...midway };
const pausedProps = { ...props, paused: true };
let stopped = pet.render(pausedProps);
assert(!stopped.walking); assert.equal(pet.animations.size, 0);
assert.deepEqual(stopped.position.native, midway, 'Tapping holds the actual native position without a jump to spawn');
assert.equal(otherPet.animations.size, 1, 'Naming one pet leaves other pets roaming');
const starts = pet.starts, frame = stopped.frame;
pet.advance(10000); pet.app('background'); pet.app('active');
stopped = pet.render({ ...pausedProps });
assert.equal(pet.starts, starts, 'Timers, rerenders and foregrounding cannot restart a paused pet');
assert.equal(stopped.frame, frame, 'Feet stop animating while naming');
assert.deepEqual(stopped.position.native, midway);
walking = pet.render(props);
assert(walking.walking); assert.equal(pet.animations.size, 1);
assert.deepEqual(walking.position.native, midway, 'Closing resumes from the held position');
const resumed = [...pet.animations][0].options.toValue;
assert(midway.x === resumed.x || midway.y === resumed.y, 'Resuming retains four-direction movement');
pet.render(pausedProps);
assert.equal(pet.animations.size, 0, 'A second tap also stops the pet');
pet.dispose(); otherPet.dispose();
assert.equal(pet.animations.size, 0); assert.equal(otherPet.animations.size, 0);
const waiting = walkerHarness();
assert(!waiting.render({ ...props, paused: true }).walking, 'A pet can start paused without wandering');
assert.equal(waiting.starts, 0);
waiting.render(props); assert(waiting.starts > 0); waiting.dispose();
console.log('Pet naming checks passed: validation, persistence round trip, delayed hydration, preserved focus/economy, stopping at the native position, frozen frames, independent pets and cardinal resume.');
