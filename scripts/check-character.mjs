import assert from 'node:assert/strict';
import { clothing, clothingSlots, defaultLook, gardenReducer as reduce, getClothing, initialState, outfitLooks, outfitWithFeatures } from '../src/game/garden.ts';
import { characterArt, studyTableArt } from '../src/game/pixel-art.ts';
import { characterMetrics, CHARACTER_WIDTH, CHARACTER_HEIGHT } from '../src/game/character-metrics.ts';

const items = (look) => Object.fromEntries(Object.entries(look).map(([slot, id]) => [slot, getClothing(id)]));
const draw = (look, pose = 'idle', frame = 0, farmer = 'girl') => characterArt(items(look), pose, frame, farmer);
assert.equal(new Set(clothing.map(item => item.id)).size, clothing.length, 'Every item has a unique ID');
for (const { id: slot } of clothingSlots) {
  assert.equal(getClothing(defaultLook[slot]).slot, slot);
  assert(clothing.some(item => item.slot === slot && item.cost === 0 && item.level === 1), `${slot} has a starter option`);
}

let state = { ...initialState(), xp: 300, coins: 200 };
for (const id of ['hair-braids', 'hair-rose', 'full-beard', 'mint-mask', 'round-glasses', 'wizard-hat', 'chef-top', 'space-pants', 'basketball']) {
  const before = state, item = getClothing(id);
  state = reduce(state, { type: state.ownedClothing.includes(id) ? 'equipClothing' : 'buyClothing', id });
  assert.equal(state.look[item.slot], id);
  for (const { id: slot } of clothingSlots) if (slot !== item.slot) assert.equal(state.look[slot], before.look[slot], `Changing ${item.slot} preserves ${slot}`);
}
const personal = state.look;
for (const action of [{ type: 'equipOutfit', id: 'meadow' }, { type: 'buyOutfit', id: 'rain' }]) {
  state = reduce(state, action);
  for (const slot of ['hair', 'hairColor', 'beard', 'mask']) assert.equal(state.look[slot], personal[slot], 'Outfit changes preserve facial and hair customization');
  assert.deepEqual(state.look, outfitWithFeatures(personal, outfitLooks[action.id]), 'The outfit preview matches the worn result');
}
state = reduce(state, { type: 'equipClothing', id: 'no-mask' });
assert.equal(state.look.beard, 'full-beard', 'Removing a mask reveals the same beard');
state = reduce(state, { type: 'setFarmer', farmerStyle: 'boy' });
assert.equal(state.look.hair, 'hair-braids', 'Custom hairstyles are available to both farmers');
assert.equal(state.look.hairColor, 'hair-rose');
const focused = reduce(state, { type: 'plant', now: 0 });
const restyled = reduce(focused, { type: 'equipClothing', id: 'hair-curls' });
assert.strictEqual(restyled.session, focused.session, 'Hair changes leave the focus deadline intact');
assert.equal(restyled.coins, focused.coins, 'Free personal features do not spend coins');

const uncovered = { ...defaultLook, hat: 'bare-head', hair: 'hair-crop' };
const signature = (look) => JSON.stringify(draw(look));
for (const slot of ['hair', 'hairColor', 'mask', 'beard']) {
  const variants = clothing.filter(item => item.slot === slot && item.id !== 'starter-hair');
  const renderings = variants.map(item => signature({ ...uncovered, [slot]: item.id }));
  assert.equal(new Set(renderings).size, variants.length, `${slot} options are visibly distinct`);
}
const bare = draw({ ...uncovered, hair: 'hair-bald' });
const span = (art, y) => {
  const row = art.rects.filter(r => r.y <= y && r.y + r.height > y);
  return Math.max(...row.map(r => r.x + r.width)) - Math.min(...row.map(r => r.x));
};
assert(span(bare, 10) > span(bare, 25), 'The rounded head is wider than the shoulders');
for (const height of [360, 390, 768]) for (const density of [1, 1.5, 2, 2.625, 3, 4]) {
  const m = characterMetrics(height, density);
  assert(Math.abs(m.scale * density - Math.round(m.scale * density)) < 0.00001, 'Source pixels align to the physical screen grid');
  assert(m.height < (height >= 550 ? 96 : 64), 'The detailed character stays smaller in the garden');
}
let frames = 0;
for (const item of clothing) for (const farmer of ['girl', 'boy']) for (const pose of ['idle', 'walk', 'water', 'study']) for (let frame = 0; frame < 4; frame++) {
  const art = draw({ ...defaultLook, [item.slot]: item.id }, pose, frame, farmer);
  assert.equal(art.width, CHARACTER_WIDTH); assert.equal(art.height, CHARACTER_HEIGHT);
  for (const r of art.rects) {
    assert(/^#[0-9a-f]{6}$/i.test(r.color), 'Character pixels are opaque palette colors');
    assert([r.x, r.y, r.width, r.height].every(Number.isInteger));
    assert(r.x >= 0 && r.y >= 0 && r.x + r.width <= art.width && r.y + r.height <= art.height);
  }
  frames++;
}
const legs = (frame) => draw(uncovered, 'walk', frame).rects.filter(r => r.y >= 31);
assert.notDeepEqual(legs(1), legs(3), 'Tiny feet alternate while walking');
const table = studyTableArt();
assert.equal(table.width, CHARACTER_WIDTH); assert.equal(table.height, CHARACTER_HEIGHT);
// Test the final composited pixels, rather than only the clipping helper. A
// bright hair palette exposes stray crown/side pixels under every headwear item.
const palette = getClothing('hair-rose');
const hairColors = new Set([palette.color, palette.shade, palette.highlight]);
const brim = { straw: 15, cap: 14, wizard: 12, chef: 12 };
let hatCombinations = 0;
for (const hat of clothing.filter(item => item.slot === 'hat' && item.style !== 'none')) {
  for (const hair of clothing.filter(item => item.slot === 'hair')) for (const pose of ['idle', 'walk', 'study', 'water']) for (const farmer of ['girl', 'boy']) {
    const art = draw({ ...defaultLook, hat: hat.id, hair: hair.id, hairColor: 'hair-rose' }, pose, 1, farmer);
    for (const r of art.rects.filter(r => hairColors.has(r.color))) {
      for (let y = r.y; y < r.y + r.height; y++) for (let x = r.x; x < r.x + r.width; x++) {
        if (hat.style === 'hood' || hat.style === 'helmet') {
          assert(y >= 10, 'No hair escapes an enclosed crown');
          if (y < 20) assert(x >= 10 && x <= 23 && y <= 18, 'Enclosed headwear only exposes hair in the face opening');
          else assert(x >= 7 && x <= 24, 'Lower locks stay beneath enclosed headwear');
        } else {
          assert(y >= brim[hat.style], `Hair cannot protrude above the ${hat.name} crown`);
          if (y < 16) assert(x >= 8 && x <= 23, 'Only front bangs appear immediately beneath a brim; side locks start by the ears');
        }
      }
    }
    hatCombinations++;
  }
  const longHair = draw({ ...defaultLook, hat: hat.id, hair: 'hair-long', hairColor: 'hair-rose' });
  assert(longHair.rects.some(r => hairColors.has(r.color) && r.y >= 16), 'Long locks remain visible below the hat near the ears');
}
console.log(`Character checks passed: ${frames} item/pose/farmer frames, independent nine-slot customization, personal features retained by outfits, tiny moving feet, and device-pixel sizing.`);
console.log(`Hat coverage checks passed: ${hatCombinations} hat/hair/pose/farmer combinations and visible lower locks.`);
