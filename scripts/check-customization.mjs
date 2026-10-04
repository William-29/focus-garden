import assert from 'node:assert/strict';
import { gardenReducer as reduce, initialState, clothing, defaultLook, getClothing, pets, MAX_ROAMING_PETS, outfitLooks } from '../src/game/garden.ts';
import { characterArt, petArt } from '../src/game/pixel-art.ts';
import { gardenLayout, petRoamPath } from '../src/game/garden-layout.ts';

let state = initialState();
assert.strictEqual(reduce(state, { type: 'buyClothing', id: 'wizard-hat' }), state, 'Level locks apply to clothing purchases');
assert.strictEqual(reduce(state, { type: 'equipClothing', id: 'wizard-hat' }), state, 'Unowned parts cannot be equipped');
assert.strictEqual(reduce(state, { type: 'buyClothing', id: 'made-up-item' }), state);
state = { ...state, xp: 300, coins: 200 };
for (const id of ['wizard-hat', 'wizard-top', 'space-pants', 'round-glasses', 'basketball']) state = reduce(state, { type: 'buyClothing', id });
assert.deepEqual(state.look, { hat: 'wizard-hat', body: 'wizard-top', pants: 'space-pants', face: 'round-glasses', accessory: 'basketball' });
assert.equal(state.coins, 105, 'Each part charges exactly once');
const mixed = state;
assert.strictEqual(reduce(state, { type: 'buyClothing', id: 'basketball' }), state);
state = reduce(state, { type: 'equipClothing', id: 'empty-hand' });
assert.equal(state.coins, mixed.coins);
assert.equal(state.look.hat, 'wizard-hat', 'Changing gear leaves the other four slots untouched');
state = reduce(state, { type: 'equipOutfit', id: 'meadow' });
assert.deepEqual(state.look, defaultLook, 'An outfit preset can be restored after mixing pieces');
state = reduce(state, { type: 'buyOutfit', id: 'rain' });
assert.deepEqual(state.look, outfitLooks.rain);
for (const id of Object.values(outfitLooks.rain)) assert(state.ownedClothing.includes(id), 'Bought sets unlock their individual pieces');
state = reduce(state, { type: 'equipClothing', id: 'wizard-hat' });
assert.equal(state.look.body, 'rain-top');
state = reduce(state, { type: 'equipOutfit', id: 'rain' });
assert.deepEqual(state.look, outfitLooks.rain, 'Restore the same set after changing just one part');
assert.strictEqual(reduce({ ...initialState(), coins: 0 }, { type: 'buyClothing', id: 'chef-hat' }).look.hat, 'straw-hat');

state = initialState();
assert.strictEqual(reduce(state, { type: 'adoptPet', id: 'bunny' }), state, 'Pets enforce level locks');
assert.strictEqual(reduce(state, { type: 'placePet', id: 'cat', x: 0.2, y: 0.4 }), state, 'Only adopted pets can roam');
state = reduce(state, { type: 'adoptPet', id: 'cat' });
assert.equal(state.coins, 40, 'First cat is free');
assert.strictEqual(reduce(state, { type: 'adoptPet', id: 'cat' }), state);
assert.strictEqual(reduce(state, { type: 'placePet', id: 'cat', x: NaN, y: Infinity }), state);
state = reduce(state, { type: 'placePet', id: 'cat', x: 0.3, y: 0.5 });
state = reduce(state, { type: 'placePet', id: 'cat', x: 0.2, y: 0.4 });
assert.equal(state.roamingPets.length, 1, 'Repositioning never duplicates a pet');
state = reduce(state, { type: 'storePet', id: 'cat' });
assert.equal(state.roamingPets.length, 0);
assert(state.ownedPets.includes('cat'), 'Resting preserves ownership');
assert.equal(state.coins, 40);
assert.equal(state.xp, 0, 'Pet placement grants no focus rewards');
state = { ...state, xp: 4400, coins: 1000 };
for (const pet of pets) {
  state = reduce(state, { type: 'adoptPet', id: pet.id });
  state = reduce(state, { type: 'placePet', id: pet.id, x: 0.3, y: 0.5 });
}
assert.equal(state.roamingPets.length, MAX_ROAMING_PETS);
assert.equal(state.ownedPets.length, pets.length);
const capped = state;
assert.strictEqual(reduce(state, { type: 'placePet', id: 'turtle', x: 0.2, y: 0.4 }), capped);
state = reduce(state, { type: 'storePet', id: 'cat' });
state = reduce(state, { type: 'placePet', id: 'turtle', x: -5, y: 4 });
assert.deepEqual(state.roamingPets.find((pet) => pet.id === 'turtle'), { id: 'turtle', x: 0.18, y: 0.62 });

// A harvest through the extended reducer must retain the mixed outfit and pets.
const before = state;
state = reduce(state, { type: 'plant', now: 0 });
state = reduce(state, { type: 'tick', now: 20000 });
state = reduce(state, { type: 'harvest' });
assert.equal(state.xp, before.xp + 60);
assert.equal(state.coins, before.coins + 29);
assert.deepEqual(state.look, before.look);
assert.deepEqual(state.roamingPets, before.roamingPets);
assert.strictEqual(reduce(state, { type: 'harvest' }), state);

function raster(art, startRow = 0) {
  const rows = Array.from({ length: art.height }, () => Array(art.width).fill(''));
  for (const r of art.rects) {
    for (const v of [r.x, r.y, r.width, r.height]) assert(Number.isInteger(v), 'Art stays on its pixel grid');
    assert(r.x >= 0 && r.y >= 0 && r.x + r.width <= art.width && r.y + r.height <= art.height);
    for (let y = r.y; y < r.y + r.height; y++) for (let x = r.x; x < r.x + r.width; x++) rows[y][x] = r.color;
  }
  return rows.slice(startRow);
}
const items = Object.fromEntries(Object.entries(mixed.look).map(([slot, id]) => [slot, getClothing(id)]));
assert.notDeepEqual(raster(characterArt(items, 'walk', 1), 25), raster(characterArt(items, 'walk', 3), 25), 'Walking changes the actual legs and boots');
for (const item of clothing) {
  const look = { ...defaultLook, [item.slot]: item.id };
  const layers = Object.fromEntries(Object.entries(look).map(([slot, id]) => [slot, getClothing(id)]));
  for (const pose of ['idle', 'walk', 'study', 'water']) raster(characterArt(layers, pose, 1));
}
for (const pet of pets) assert.notDeepEqual(raster(petArt(pet, 1), 14), raster(petArt(pet, 3), 14), `${pet.name} has moving legs`);
for (const [width, height, insets] of [[844, 390, { left: 44, right: 44, top: 0, bottom: 21 }], [800, 360, { left: 0, right: 24, top: 0, bottom: 0 }], [1024, 768, { left: 0, right: 0, top: 24, bottom: 20 }]]) {
  const layout = gardenLayout(width, height, insets);
  assert.deepEqual(layout.world, { width, height }, 'Garden fills the viewport, regardless of aspect ratio');
  assert(layout.controls.left >= insets.left && layout.bottom >= insets.bottom);
  assert(layout.toolbarWidth + layout.panelWidth < layout.controls.width);
  for (let index = 0; index < pets.length; index++) for (const point of petRoamPath(width, height, index, 48, 44)) {
    assert(point.x >= 0 && point.x + 48 <= width && point.y >= 0 && point.y + 44 <= height);
  }
}
console.log('Customization checks passed: mixed layers, economy guards, outfit sets, pet adoption/placement/storage, moving legs, full-screen layout, and preserved harvest rules.');
