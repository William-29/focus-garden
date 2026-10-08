import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';

export function useCompletionSound(completion: number) {
  const player = useAudioPlayer(require('../../assets/audio/harvest-ding.wav'));
  const { isLoaded } = useAudioPlayerStatus(player);
  const played = useRef(completion);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers',
      allowsRecording: false, shouldPlayInBackground: false }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoaded || completion === played.current) return;
    played.current = completion;
    let active = true;
    void player.seekTo(0).then(() => {
      if (active) { player.volume = 0.75; player.play(); }
    }).catch(() => {});
    return () => { active = false; };
  }, [completion, isLoaded, player]);

  // The web implementation unlocks audio directly inside the planting gesture.
  return useCallback(() => {}, []);
}
