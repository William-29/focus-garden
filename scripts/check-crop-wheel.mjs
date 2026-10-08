import assert from 'node:assert/strict';
import { initialState, gardenReducer as reduce, plants, getPlant, growth } from '../src/game/garden.ts';
import { filteredCrops, cropFilters, canPlantCrop, cropWheelEntries, wheelSector, wheelAngleDelta, wrapCropIndex } from '../src/game/crop-wheel.ts';
import { gardenUIReducer, initialGardenUI } from '../src/game/notices.ts';

let state = initialState();
assert.equal(filteredCrops(state).length, 45, 'The main wheel includes every plant');
assert(filteredCrops(state).every((p, i, list) => !i || p.unlockLevel >= list[i - 1].unlockLevel), 'All plants use level order');
for (const category of ['Flowers', 'Vegetables', 'Fruits']) {
  const list = filteredCrops(state, category);
  assert.equal(list.length, 15);
  assert(list.every(p => p.category === category));
}
assert.deepEqual(cropFilters, ['All', 'Owned', 'Flowers', 'Vegetables', 'Fruits']);
assert.deepEqual(filteredCrops(state, 'Owned').map(p => p.id), ['carrot']);
assert.deepEqual(filteredCrops({ ...state, inventory: { carrot: 0 } }, 'Owned'), []);
assert(filteredCrops({ ...state, inventory: { rose: 2 } }, 'Owned').some(p => p.id === 'rose'), 'Owned includes locked seeds, while planting remains disabled');
assert.equal(canPlantCrop(state, 'carrot'), true);
assert.equal(canPlantCrop(state, 'rose'), false);
assert.equal(canPlantCrop({ ...state, inventory: {} }, 'carrot'), false);
assert.equal(canPlantCrop({ ...state, inventory: { rose: 2 } }, 'rose'), false);
assert.equal(canPlantCrop(state, 'unknown'), false);
const stocked = { ...state, xp: 4400, inventory: Object.fromEntries(plants.map(p => [p.id, 3])) };
assert.equal(filteredCrops(stocked, 'Owned').length, 45, 'Every stocked seed can be browsed');
const unlocked = filteredCrops(stocked, 'Owned');
assert(unlocked.every((p, i) => !i || p.unlockLevel > unlocked[i - 1].unlockLevel));

for (let count = 0; count <= 45; count++) {
  const reached = new Set();
  for (let step = -count * 2; step <= count * 2; step++) {
    for (const fraction of [0, 0.49, 0.51]) {
      const entries = cropWheelEntries(count, step + fraction);
      assert.equal(new Set(entries.map(item => item.index)).size, entries.length, 'No duplicates or overlapping crop indices during a turn');
      assert(entries.length <= 8, 'A large bag never crowds the wheel with 45 buttons');
      for (const { index, angle } of entries) {
        assert(index >= 0 && index < count && Number.isFinite(angle));
        reached.add(index);
      }
    }
  }
  assert.equal(reached.size, count, 'Rotation in either direction reaches every crop');
}
assert.equal(wrapCropIndex(-1, 45), 44);
assert.equal(wrapCropIndex(45, 45), 0);
assert(Math.abs(wheelAngleDelta(Math.PI - 0.1, -Math.PI + 0.1) - 0.2) < 1e-10, 'The angular seam does not skip crops');
assert(Math.abs(wheelAngleDelta(-Math.PI + 0.1, Math.PI - 0.1) + 0.2) < 1e-10);
assert.equal(wheelSector(45), wheelSector(8), 'Large inventories keep readable spacing');

for (const quick of [true, false]) for (const crop of plants) {
  const before = { ...stocked, quick, selectedSeed: crop.id === 'carrot' ? 'daisy' : 'carrot' };
  const planted = reduce(before, { type: 'plantSeed', id: crop.id, now: 1000 });
  assert.equal(planted.selectedSeed, crop.id, 'The tapped crop is selected and planted in one action');
  assert.equal(planted.session.plantId, crop.id);
  assert.equal(planted.session.deadline, 1000 + crop.minutes[0] * (quick ? 1000 : 60000));
  assert.equal(planted.inventory[crop.id], before.inventory[crop.id] - 1);
  assert.equal(planted.coins, before.coins, 'Planting an owned seed spends no coins');
  assert.equal(planted.xp, before.xp);
  assert.equal(planted.look, before.look);
  assert.equal(growth(planted.session, 1000), 0);
  for (const status of ['running', 'paused', 'awaiting', 'ready']) {
    const active = { ...planted, session: { ...planted.session, status } };
    assert.strictEqual(reduce(active, { type: 'plantSeed', id: 'carrot', now: 1001 }), active, 'Delayed and repeated taps cannot replace a crop or consume another seed');
  }
}
for (const action of [{ id: 'unknown', now: 0 }, { id: 'carrot', now: NaN }, { id: 'carrot', now: Infinity }, { id: 'rose', now: 0 }]) {
  assert.strictEqual(reduce(state, { type: 'plantSeed', ...action }), state, 'Invalid or unavailable selections leave the entire state intact');
}
const empty = { ...state, inventory: { ...state.inventory, carrot: 0 } };
assert.strictEqual(reduce(empty, { type: 'plantSeed', id: 'carrot', now: 0 }), empty);
const locked = { ...state, inventory: { ...state.inventory, rose: 2 } };
assert.strictEqual(reduce(locked, { type: 'plantSeed', id: 'rose', now: 0 }), locked);

let ui = initialGardenUI();
ui = gardenUIReducer(ui, { type: 'perform', action: { type: 'plantSeed', id: 'carrot', now: 500 }, now: 500 });
assert(ui.notice.text.startsWith('Carrot is growing'), 'Direct planting gets normal short feedback');
ui = gardenUIReducer(ui, { type: 'perform', action: { type: 'tick', now: ui.state.session.deadline }, now: ui.state.session.deadline });
ui = gardenUIReducer(ui, { type: 'perform', action: { type: 'harvest' }, now: 20500 });
assert.equal(ui.harvest.plantId, 'carrot', 'Wheel-grown crops retain the harvest celebration');
assert.equal(ui.state.coins, state.coins + getPlant('carrot').coins);
console.log('Crop wheel checks passed: all 45 crops reachable in either direction, angular seam, inventory/level filtering, atomic planting, focus modes, duplicate-tap guards and harvest rewards.');
