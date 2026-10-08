import assert from 'node:assert/strict';
import { pets, initialState, gardenReducer } from '../src/game/garden.ts';
import { petArt, petDimensions, petWorldScale } from '../src/game/pet-art.ts';

function raster(art) {
  const rows = Array.from({ length: art.height }, () => Array(art.width).fill(null));
  for (const r of art.rects) {
    for (const v of [r.x, r.y, r.width, r.height]) assert(Number.isInteger(v));
    assert(r.width > 0 && r.height > 0);
    assert(r.x >= 0 && r.y >= 0 && r.x + r.width <= art.width && r.y + r.height <= art.height);
    for (let y = r.y; y < r.y + r.height; y++) for (let x = r.x; x < r.x + r.width; x++) rows[y][x] = r.color;
  }
  return rows;
}
function assertJoinedWithMargin(rows, label) {
  const height = rows.length, width = rows[0].length;
  for (let x = 0; x < width; x++) {
    assert.equal(rows[0][x], null, label + ' keeps space above its ears');
    assert.equal(rows[height - 1][x], null, label + ' keeps space below its feet');
  }
  for (let y = 0; y < height; y++) {
    assert.equal(rows[y][0], null, label + ' keeps space before its tail');
    assert.equal(rows[y][width - 1], null, label + ' keeps space after its snout');
  }
  const occupied = new Set();
  rows.forEach((row, y) => row.forEach((color, x) => { if (color) occupied.add(y * width + x); }));
  const pending = [occupied.values().next().value];
  const seen = new Set(pending);
  while (pending.length) {
    const index = pending.pop(), x = index % width, y = Math.floor(index / width);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, next = ny * width + nx;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || !occupied.has(next) || seen.has(next)) continue;
      seen.add(next); pending.push(next);
    }
  }
  assert.equal(seen.size, occupied.size, label + ' has no floating heads, ears, tails or feet, even across diagonal gaps');
}
let frames = 0;
const frontLooks = new Set();
for (const pet of pets) {
  const size = petDimensions(pet), scale = petWorldScale(pet);
  assert.equal(size.width * scale, pet.baby ? 40 : 48, 'World size stays compatible with existing collision maps');
  assert.equal(size.height * scale, pet.baby ? 40 : 48);
  for (const view of ['front', 'side']) {
    for (let frame = 0; frame < 4; frame++) {
      const art = petArt(pet, frame, view);
      assert.equal(art.width, size.width); assert.equal(art.height, size.height);
      assert(art.rects.length > 20 && art.rects.length < 180, 'Detailed art stays affordable for native rectangles');
      assert(new Set(art.rects.map(p => p.color)).size >= 5, 'Animals have outlines, coat shades, and highlights');
      assertJoinedWithMargin(raster(art), pet.id + ' ' + view + ' frame ' + frame); frames++;
    }
    const legsStart = Math.floor(size.height * 0.7);
    assert.notDeepEqual(raster(petArt(pet, 1, view)).slice(legsStart), raster(petArt(pet, 3, view)).slice(legsStart), pet.id + ' has actual moving feet in both views');
    assert.deepEqual(petArt(pet, -1, view), petArt(pet, 3, view), 'Walking frames wrap safely');
  }
  assert.notDeepEqual(petArt(pet, 0, 'front'), petArt(pet, 0, 'side'), 'Front and side are different anatomy, not the same mirrored face');
  frontLooks.add(JSON.stringify(raster(petArt(pet))));
}
assert.equal(frontLooks.size, pets.length, 'All sixteen adult and baby entries have distinct front artwork');
let state = initialState();
state = gardenReducer(state, { type: 'adoptPet', id: 'dog' });
state = gardenReducer(state, { type: 'placePet', id: 'dog', x: 0.3, y: 0.5 });
assert.equal(state.coins, 40); assert.equal(state.xp, 0);
assert.deepEqual(state.roamingPets, [{ id: 'dog', x: 0.3, y: 0.5 }]);
state = gardenReducer(state, { type: 'storePet', id: 'dog' });
assert(state.ownedPets.includes('dog')); assert.equal(state.roamingPets.length, 0);
console.log('Pet art checks passed: ' + frames + ' connected front/side frames with transparent margins, sixteen distinct pets, moving feet, preserved world sizes and adoption/storage.');
