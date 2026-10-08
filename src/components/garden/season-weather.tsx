import { memo, useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { fallingPhase, weatherParticles, type Season } from '@/game/seasons';
import { PixelSeason } from './pixel-garden-art';

type WeatherSeason = Exclude<Season, 'summer'>;
function FallingPixel({ index, width, height, season, elapsed }: {
  index: number; width: number; height: number; season: WeatherSeason; elapsed: SharedValue<number>;
}) {
  const { phase: start, duration, x } = weatherParticles(season)[index];
  const snow = season === 'winter';
  const movement = useAnimatedStyle(() => {
    const phase = fallingPhase(elapsed.get(), start, duration);
    return {
      opacity: Math.min(1, phase / 0.04, (1 - phase) / 0.04),
      transform: [
        { translateY: -18 + phase * (height + 36) },
        { translateX: Math.sin(phase * Math.PI * 4 + index) * 10 },
        { rotate: `${phase * (snow ? 90 : 160)}deg` },
      ],
    };
  });
  return <Animated.View style={[{ position: 'absolute', left: Math.round(x * width), top: 0, width: 16, height: 16 }, movement]}>
    {snow ? <View style={styles.snow}>
      <View style={styles.snowVertical} /><View style={styles.snowHorizontal} />
      <View style={styles.snowLightVertical} /><View style={styles.snowLightHorizontal} />
      {[1, 7].flatMap((left) => [1, 7].map((top) => <View key={`${left}-${top}`} style={[styles.snowTip, { left, top }]} />))}
    </View> : <PixelSeason season={season === 'autumn' ? 'autumn' : 'spring'} size={season === 'autumn' ? 16 : 12} />}
  </Animated.View>;
}

function WeatherLayer({ season, width, height }: { season: WeatherSeason; width: number; height: number }) {
  const elapsed = useSharedValue(0);
  // One UI-thread clock drives all five particles. It has no nested animation
  // completion callbacks or accessibility branch that can freeze the fall.
  useFrameCallback((frame) => { elapsed.set(elapsed.get() + (frame.timeSincePreviousFrame ?? 0)); });
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.sky}>
    {weatherParticles(season).map((_, index) => <FallingPixel key={index} index={index}
      width={width} height={height} season={season} elapsed={elapsed} />)}
  </View>;
}

export const SeasonWeather = memo(function SeasonWeather({ season, width, height }: { season: Season; width: number; height: number }) {
  const [active, setActive] = useState(AppState.currentState === 'active' || AppState.currentState === null);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => setActive(status === 'active'));
    return () => subscription.remove();
  }, []);
  return active && season !== 'summer' ? <WeatherLayer key={season} season={season} width={width} height={height} /> : null;
});

const styles = StyleSheet.create({
  sky: { ...StyleSheet.absoluteFill, overflow: 'hidden', zIndex: 2 },
  snow: { width: 10, height: 10 },
  snowVertical: { position: 'absolute', left: 4, top: 0, width: 2, height: 10, backgroundColor: '#7297b6' },
  snowHorizontal: { position: 'absolute', left: 0, top: 4, width: 10, height: 2, backgroundColor: '#7297b6' },
  snowLightVertical: { position: 'absolute', left: 4, top: 0, width: 1, height: 9, backgroundColor: '#ffffff' },
  snowLightHorizontal: { position: 'absolute', left: 0, top: 4, width: 9, height: 1, backgroundColor: '#ffffff' },
  snowTip: { position: 'absolute', width: 2, height: 2, backgroundColor: '#faffff', borderBottomWidth: 1, borderColor: '#7297b6' },
});
