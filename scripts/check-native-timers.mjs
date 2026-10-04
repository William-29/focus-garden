import assert from 'node:assert/strict';
import { gardenReducer as reduce, initialState, growth, timeLeft } from '../src/game/garden.ts';

// The native clock dispatches a single tick on foregrounding, just like these
// long background gaps. It must never skip the manual Sunflower phase starts.
let state = reduce(initialState(), { type: 'mode', quick: false });
state = reduce(state, { type: 'plant', now: 1000 });
state = reduce(state, { type: 'tick', now: 3_600_000 });
assert.equal(state.session.status, 'ready');
assert.equal(state.xp, 0);
const ready = state;
assert.strictEqual(reduce(ready, { type: 'mode', quick: true }), ready);
state = reduce(state, { type: 'harvest' });
assert.equal(state.focusedSeconds, 1200);
assert.equal(state.harvests, 1);
assert.strictEqual(reduce(state, { type: 'harvest' }), state);

state = reduce(initialState(), { type: 'plant', now: 0 });
state = reduce(state, { type: 'pause', now: 6500 });
const paused = state;
assert.strictEqual(reduce(state, { type: 'tick', now: 9_000_000 }), paused);
assert.equal(timeLeft(state.session, 9_000_000), 13_500);
state = reduce(state, { type: 'resume', now: 9_000_000 });
assert.equal(state.session.deadline, 9_013_500);
assert.strictEqual(reduce(state, { type: 'resume', now: 10_000_000 }), state);
state = reduce(state, { type: 'pause', now: 9_013_501 });
assert.equal(state.session.status, 'ready', 'A late pause completes instead of freezing an expired timer');

state = { ...initialState(), xp: 800, coins: 500 };
state = reduce(state, { type: 'mode', quick: false });
state = reduce(state, { type: 'buy', id: 'sunflower' });
state = reduce(state, { type: 'plant', now: 0 });
state = reduce(state, { type: 'tick', now: 86_400_000 });
assert.equal(state.session.phase, 0);
assert.equal(state.session.status, 'awaiting');
assert.equal(growth(state.session, 86_400_000), 0.5);
assert.strictEqual(reduce(state, { type: 'tick', now: 172_800_000 }), state);
state = reduce(state, { type: 'next', now: 172_800_000 });
assert.equal(state.session.deadline, 173_400_000);
state = reduce(state, { type: 'pause', now: 172_950_000 });
assert.equal(timeLeft(state.session, 999_999_999), 450_000);
assert.equal(growth(state.session, 999_999_999), 0.5);
state = reduce(state, { type: 'resume', now: 200_000_000 });
state = reduce(state, { type: 'tick', now: 300_000_000 });
assert.equal(state.session.phase, 1);
assert.equal(state.session.status, 'awaiting');
assert.equal(state.focusedSeconds, 0);
state = reduce(state, { type: 'next', now: 300_000_000 });
assert.equal(state.session.deadline, 302_700_000);
state = reduce(state, { type: 'tick', now: 400_000_000 });
state = reduce(state, { type: 'keep' });
assert.equal(state.focusedSeconds, 5400, 'Only the two 45-minute focus phases count');
assert.equal(state.coins, 485);
assert.equal(state.keptPlants.length, 1);
console.log('Native timer edge cases passed: background catch-up, manual phases, late pause, paused break, and real focus credit.');
