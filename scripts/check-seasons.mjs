import assert from 'node:assert/strict';
import { gardenReducer as reduce, initialState, pets, plants } from '../src/game/garden.ts';
import { isSeason, localGardenDate, seasons, weatherParticles } from '../src/game/seasons.ts';
import { isFarmerStyle } from '../src/game/farmer.ts';
import { petDimensions, petArt } from '../src/game/pixel-art.ts';
import { centeredPlantPlacement, plantInkBounds } from '../src/game/plant-placement.ts';

const beginning = new Date(2026, 11, 31, 23, 59).getTime();
assert.deepEqual(localGardenDate(beginning), { time: '23:59', date: 'Thu 31 Dec' });
assert.deepEqual(localGardenDate(beginning + 60000), { time: '00:00', date: 'Fri 1 Jan' }, 'Clock and date turn over together in device-local time');
for (const invalid of [null, '', 'monsoon', '{}', 42]) assert.equal(isSeason(invalid), false);
let state = reduce(initialState(), { type: 'plant', now: 0 });
const growing = state;
for (const season of seasons) {
  const particles = weatherParticles(season);
  assert.equal(particles.length, season === 'summer' ? 0 : 5, 'Falling effects stay sparse, including a maximum of five autumn leaves');
  for (const particle of particles) {
    assert(particle.phase > 0.04 && particle.phase < 0.94, 'Particles are visible immediately, without waiting for a first fall');
    assert(particle.x > 0.05 && particle.x < 0.95);
  }
  assert.equal(new Set(particles.map((particle) => particle.x)).size, particles.length, 'Particles span different horizontal lanes');
  state = reduce(state, { type: 'setSeason', season });
  assert.equal(state.season, season);
  assert.strictEqual(state.session, growing.session, 'Changing scenery preserves the active focus timer');
  assert.equal(state.coins, growing.coins);
  assert.equal(state.noticeRevision, growing.noticeRevision, 'Changing season never repeats an old receipt');
}
assert.strictEqual(reduce(state, { type: 'setSeason', season: 'invalid' }), state);
for (const invalid of [null, '', 'wizard', 42, {}]) assert.equal(isFarmerStyle(invalid), false);
assert.strictEqual(reduce(state, { type: 'setFarmer', farmerStyle: 'invalid' }), state);
const boy = reduce(state, { type: 'setFarmer', farmerStyle: 'boy' });
assert.equal(boy.farmerStyle, 'boy');
assert.equal(boy.look.pants, 'garden-trousers');
assert.strictEqual(boy.session, state.session, 'Farmer choice never interrupts a focus session');
assert.equal(boy.coins, state.coins);
assert.equal(boy.xp, state.xp);
assert.equal(boy.noticeRevision, state.noticeRevision, 'Restoring the saved farmer never replays a receipt');
const girl = reduce(boy, { type: 'setFarmer', farmerStyle: 'girl' });
assert.equal(girl.look.pants, 'garden-pants');
const dressed = { ...boy, look: { ...boy.look, pants: 'space-pants', hat: 'wizard-hat' } };
const changed = reduce(dressed, { type: 'setFarmer', farmerStyle: 'girl' });
assert.strictEqual(changed.look, dressed.look, 'Both farmers keep custom clothes and accessories');
assert.strictEqual(changed.ownedClothing, dressed.ownedClothing);
assert.deepEqual(pets.slice(0, 3).map((pet) => pet.id), ['dog', 'cat', 'bunny']);
for (const baby of pets.filter((pet) => pet.baby)) {
  const adult = pets.find((pet) => pet.species === baby.species && !pet.baby);
  assert(adult && baby.level > adult.level, 'Baby animals unlock after the adult of their species');
  assert(petDimensions(baby).width < petDimensions(adult).width, 'Babies are visibly smaller');
  const locked = { ...initialState(), xp: (baby.level - 2) * 100, coins: 1000 };
  assert.strictEqual(reduce(locked, { type: 'adoptPet', id: baby.id }), locked);
  const unlocked = { ...locked, xp: (baby.level - 1) * 100 };
  assert(reduce(unlocked, { type: 'adoptPet', id: baby.id }).ownedPets.includes(baby.id));
  assert.notDeepEqual(petArt(baby, 1), petArt(baby, 3));
}
for (const plant of plants) for (const size of [36, 84, 120]) {
  const bounds = plantInkBounds[plant.category][plant.sprite];
  const { scale, left, top } = centeredPlantPlacement(size, bounds);
  assert(Math.abs(left + (bounds[0] + bounds[2] / 2) * scale - size / 2) < 0.00001);
  assert(Math.abs(top + (bounds[1] + bounds[3] / 2) * scale - size / 2) < 0.00001);
  assert(bounds[2] * scale <= size && bounds[3] * scale <= size, 'Centered crops fit inside the plot sprite');
}
console.log('Season, midnight rollover, baby-pet progression, active focus preservation, and all 45 centered crop checks passed.');
