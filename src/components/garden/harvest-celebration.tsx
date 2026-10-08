import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { getPlant } from '@/game/garden';
import { growingGeometry } from '@/game/garden-navigation';
import { useGarden } from '@/game/garden-provider';
import { HARVEST_DURATION, type HarvestEvent } from '@/game/notices';
import type { Season } from '@/game/seasons';
import { GardenText } from './garden-ui';
import { PixelCoin } from './pixel-garden-art';
import { PlantSprite } from './sprites';

function HarvestBurst({ event, width, height, season }: { event: HarvestEvent; width: number; height: number; season: Season }) {
  const [progress] = useState(() => new Animated.Value(0));
  const plot = growingGeometry(width, height, season), size = Math.min(plot.height - 22, width * 0.11);
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: 1, duration: Math.max(0, event.expiresAt - Date.now()),
      easing: Easing.linear, useNativeDriver: true, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [event.expiresAt, progress]);
  const fade = progress.interpolate({ inputRange: [0, 0.68, 1], outputRange: [1, 1, 0] });
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[styles.origin, { left: plot.left + plot.width / 2, top: plot.top + plot.height / 2 }]}>
    <Animated.View style={{ position: 'absolute', left: -size / 2, top: -size / 2, opacity: fade,
      transform: [
        { translateY: progress.interpolate({ inputRange: [0, 0.22, 0.4, 1], outputRange: [0, -24, -15, -44] }) },
        { scale: progress.interpolate({ inputRange: [0, 0.16, 0.32, 1], outputRange: [1, 1.2, 1.05, 0.85] }) },
      ] }}><PlantSprite plant={getPlant(event.plantId)} size={size} centered /></Animated.View>
    {Array.from({ length: 9 }, (_, index) => {
      const angle = index / 9 * Math.PI * 2;
      return <Animated.View key={index} style={[styles.particle, { opacity: fade,
        transform: [
          { translateX: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, Math.cos(angle) * 55, Math.cos(angle) * 65] }) },
          { translateY: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, Math.sin(angle) * 40 - 20, Math.sin(angle) * 40 + 5] }) },
          { scale: progress.interpolate({ inputRange: [0, 0.12, 0.8, 1], outputRange: [0.2, 1, 1, 0.2] }) },
        ] }]}>
        {event.coins > 0 && index % 3 === 0 ? <PixelCoin size={16} /> : <View style={styles.spark} />}
      </Animated.View>;
    })}
    <Animated.View style={[styles.reward, { opacity: progress.interpolate({ inputRange: [0, 0.12, 0.8, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, -20] }) }] }]}>
      <GardenText style={styles.rewardText}>{event.kept ? 'Plant kept!' : '+' + event.coins + ' coins'}{'  +' + event.xp + ' XP'}</GardenText>
    </Animated.View>
  </View>;
}

export function HarvestCelebration({ width, height }: { width: number; height: number }) {
  const { harvest, state, now } = useGarden();
  // Never replay a completed burst after returning from the background.
  if (!harvest || now >= harvest.expiresAt || now < harvest.expiresAt - HARVEST_DURATION) return null;
  return <HarvestBurst key={harvest.id} event={harvest} width={width} height={height} season={state.season} />;
}

const styles = StyleSheet.create({
  origin: { position: 'absolute', zIndex: 5 },
  particle: { position: 'absolute', left: -8, top: -8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  spark: { width: 6, height: 6, backgroundColor: '#ffe793', borderWidth: 1, borderColor: '#b68042', transform: [{ rotate: '45deg' }] },
  reward: { position: 'absolute', top: 24, left: -120, width: 240, alignItems: 'center' },
  rewardText: { padding: 5, borderWidth: 2, borderColor: '#96634d', color: '#654031', backgroundColor: '#fff0bd', fontSize: 14 },
});
