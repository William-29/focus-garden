import assert from 'node:assert/strict';
import { gardenReducer as reduce, initialState, getPlant, growth, plants } from '../src/game/garden.ts';
import { normalizeName, parseNames } from '../src/game/personalization.ts';
import { coinArt, sproutArt, plantFallbackArt } from '../src/game/pixel-art.ts';

assert.equal(normalizeName('  George\n  Green  ', 24), 'George Green');
assert.equal(normalizeName('🌱🌸🌼', 2), '🌱🌸', 'Name truncation preserves complete Unicode characters');
for (const value of [null, 'broken json', 'null', '[]', '{}', '{"characterName":3,"gardenName":"Green"}', '{"characterName":" ","gardenName":"Green"}']) {
  assert.equal(parseNames(value), null, 'Missing or damaged saved names never crash startup');
}
assert.deepEqual(parseNames('{"characterName":"  George ","gardenName":" Clover Corner "}'), { characterName: 'George', gardenName: 'Clover Corner' });
let state = initialState();
const original = state;
assert.strictEqual(reduce(state, { type: 'rename', characterName: '  ', gardenName: 'Green' }), state, 'Empty names leave both values unchanged');
state = reduce(state, { type: 'rename', characterName: ' George ', gardenName: ' Clover\nCorner ' });
assert.equal(state.characterName, 'George');
assert.equal(state.gardenName, 'Clover Corner');
assert.equal(state.coins, original.coins);
assert.equal(state.xp, original.xp);
assert.equal(state.inventory, original.inventory);
state = reduce(state, { type: 'plant', now: 0 });
const session = state.session;
const renamed = reduce(state, { type: 'rename', characterName: 'Georgia', gardenName: 'Greenhouse' });
assert.strictEqual(renamed.session, session, 'Renaming during focus never resets its timer');
const restored = reduce(state, { type: 'restoreNames', characterName: 'George', gardenName: 'Clover Corner' });
assert.equal(restored.message, state.message, 'Restoring names never replaces timer feedback');
assert.equal(growth(session, 0), 0);
assert(growth(session, session.deadline / 2) > 0);
assert.equal(growth(session, session.deadline), 1);
state = reduce(state, { type: 'tick', now: session.deadline });
state = reduce(state, { type: 'keep' });
assert.equal(state.characterName, 'George', 'Focus and display actions preserve personalization');
assert.equal(state.displaySlots.length, 8);
assert(state.keptPlants.some((plant) => plant.id === state.displaySlots[0]), 'Kept plants remain assigned to the first greenhouse bay');

for (const art of [coinArt(), sproutArt(), sproutArt(true), ...plants.map(plantFallbackArt)]) {
  assert(art.rects.length > 0, 'Every crop has an image-independent visible drawing');
  for (const rect of art.rects) {
    assert(rect.x >= 0 && rect.y >= 0 && rect.width > 0 && rect.height > 0);
    assert(rect.x + rect.width <= art.width && rect.y + rect.height <= art.height);
  }
}
assert.notDeepEqual(sproutArt(), sproutArt(true), 'Early growth gains a second pair of leaves');
assert.notDeepEqual(plantFallbackArt(getPlant('carrot')), sproutArt(true), 'Carrot develops visibly beyond its seedling');
console.log('Personalization, saved-data validation, focus preservation, greenhouse placement, and crop fallback checks passed.');
