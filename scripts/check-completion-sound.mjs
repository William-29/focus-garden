import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { plants } from '../src/game/garden.ts';
import { gardenUIReducer, initialGardenUI } from '../src/game/notices.ts';
import { completionTone, COMPLETION_TONE_SECONDS } from '../src/game/completion-tone.ts';

const act = (ui, action) => gardenUIReducer(ui, { type: 'perform', action, now: action.now ?? 0 });
for (const quick of [true, false]) for (const plant of plants) {
  let ui = initialGardenUI();
  ui = { ...ui, state: { ...ui.state, quick, xp: 4400, inventory: { [plant.id]: 3 } } };
  ui = act(ui, { type: 'plantSeed', id: plant.id, now: 1000 });
  assert.equal(ui.completionSound, 0, 'Planting is silent');
  ui = act(ui, { type: 'pause', now: 2000 });
  ui = act(ui, { type: 'tick', now: 1e9 });
  assert.equal(ui.completionSound, 0, 'A paused timer cannot ding');
  ui = act(ui, { type: 'resume', now: 1e9 });
  for (let phase = 0; phase < plant.minutes.length; phase++) {
    const deadline = ui.state.session.deadline;
    ui = act(ui, { type: 'tick', now: deadline - 1 });
    assert.equal(ui.completionSound, 0, 'No early sound');
    ui = act(ui, { type: 'tick', now: deadline + 60000 });
    const final = phase === plant.minutes.length - 1;
    assert.equal(ui.completionSound, final ? 1 : 0, 'Only harvest readiness rings, not intermediate focus or break phases');
    ui = act(ui, { type: 'tick', now: deadline + 120000 });
    assert.equal(ui.completionSound, final ? 1 : 0, 'Repeated ticks never replay the bell');
    if (!final) ui = act(ui, { type: 'next', now: deadline + 120000 });
  }
  ui = act(ui, { type: 'setSeason', season: 'winter' });
  assert.equal(ui.completionSound, 1, 'Scene changes do not ring again');
  const before = ui.state;
  ui = act(ui, { type: quick ? 'harvest' : 'keep' });
  assert.equal(ui.completionSound, 1, 'The completion event survives an immediate harvest/keep in the same render');
  assert.equal(ui.state.xp, before.xp + plant.xp);
  assert.equal(ui.state.coins, before.coins + (quick ? plant.coins : 0));
  ui = act(ui, { type: 'plantSeed', id: plant.id, now: 2e9 });
  assert.equal(ui.completionSound, 1, 'Planting the same species does not replay an old alert');
  for (let phase = 0; phase < plant.minutes.length; phase++) {
    ui = act(ui, { type: 'pause', now: ui.state.session.deadline + 1 });
    if (ui.state.session.status === 'awaiting') ui = act(ui, { type: 'next', now: 3e9 + phase * 1e7 });
  }
  assert.equal(ui.completionSound, 2, 'Late pauses and a second completed crop ring exactly once each');
}

const wav = readFileSync(new URL('../assets/audio/harvest-ding.wav', import.meta.url));
assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
assert.equal(wav.readUInt16LE(20), 1, 'Native sound is standard PCM');
assert.equal(wav.readUInt16LE(22), 1);
assert.equal(wav.readUInt16LE(34), 16);
assert.equal(wav.readUInt32LE(40), wav.length - 44);
const samples = completionTone(wav.readUInt32LE(24));
assert.equal(samples.length, (wav.length - 44) / 2);
assert(COMPLETION_TONE_SECONDS < 2, 'The alert is brief');
assert(samples.some(sample => Math.abs(sample) > 0.1), 'The sound is audible');
assert(samples.every(sample => Number.isFinite(sample) && Math.abs(sample) < 0.9), 'The bell does not clip');
assert.equal(samples[0], 0, 'The attack avoids a click');
assert(Math.abs(samples.at(-1)) < 0.0001, 'The bell fades out cleanly');
for (let i = 0; i < samples.length; i++) assert.equal(wav.readInt16LE(44 + i * 2), Math.round(samples[i] * 32767) || 0, 'Web and native use the same original bell');
console.log('Completion sound checks passed: all 45 crops in both timer modes, pause/resume, background catch-up, phase boundaries, repeat suppression, immediate harvesting, subsequent crops and a clean shared bell asset.');
