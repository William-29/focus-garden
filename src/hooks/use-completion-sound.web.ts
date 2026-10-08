import { useCallback, useEffect, useRef } from 'react';
import { completionTone } from '@/game/completion-tone';

export function useCompletionSound(completion: number) {
  const context = useRef<AudioContext | null>(null);
  const buffer = useRef<AudioBuffer | null>(null);
  const played = useRef(completion);

  // Browsers require activation from a real click/tap. This prepares the bell
  // silently when planting, so the timer can play it later without another tap.
  const prepare = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const Audio = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      if (!context.current || context.current.state === 'closed') {
        context.current = new Audio();
        const samples = completionTone(context.current.sampleRate);
        buffer.current = context.current.createBuffer(1, samples.length, context.current.sampleRate);
        buffer.current.getChannelData(0).set(samples);
      }
      void context.current.resume().catch(() => {});
    } catch { /* Audio restrictions must not interrupt a focus session. */ }
  }, []);

  useEffect(() => {
    if (completion === played.current) return;
    played.current = completion;
    const audio = context.current;
    const clip = buffer.current;
    if (!audio || !clip) return;
    void audio.resume().then(() => {
      if (audio.state !== 'running') return;
      const bell = audio.createBufferSource();
      const volume = audio.createGain();
      bell.buffer = clip;
      volume.gain.value = 0.75;
      bell.connect(volume); volume.connect(audio.destination);
      bell.onended = () => { bell.disconnect(); volume.disconnect(); };
      bell.start();
    }).catch(() => { /* The harvest controls still work if audio is blocked. */ });
  }, [completion]);

  useEffect(() => () => {
    const audio = context.current;
    context.current = null; buffer.current = null;
    if (audio && audio.state !== 'closed') void audio.close().catch(() => {});
  }, []);

  return prepare;
}
