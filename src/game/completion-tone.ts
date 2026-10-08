// Original soft bell, shared by browser playback and the bundled native WAV.
export const COMPLETION_TONE_SECONDS = 1.1;
export function completionTone(sampleRate: number) {
  const samples = new Float32Array(Math.round(sampleRate * COMPLETION_TONE_SECONDS));
  for (let i = 0; i < samples.length; i++) {
    const time = i / sampleRate;
    const attack = Math.min(1, time / 0.004);
    const fade = Math.min(1, (COMPLETION_TONE_SECONDS - time) / 0.05);
    samples[i] = attack * fade * 0.38 * (
      Math.sin(2 * Math.PI * 1046.5 * time) * Math.exp(-time * 5)
      + 0.3 * Math.sin(2 * Math.PI * 2093 * time) * Math.exp(-time * 8)
      + 0.12 * Math.sin(2 * Math.PI * 3139.5 * time) * Math.exp(-time * 12));
  }
  return samples;
}
