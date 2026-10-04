import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { getPlant } from '@/game/garden';
import { useGardenState } from '@/game/garden-provider';
import { GardenText, palette, WoodPanel } from './garden-ui';
import { PlantSprite } from './sprites';

export function LevelCelebration() {
  const { state } = useGardenState();
  const [dismissedKey, setDismissedKey] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));
  const event = state.levelEvent?.key !== dismissedKey ? state.levelEvent : null;
  useEffect(() => {
    if (!state.levelEvent) return;
    const key = state.levelEvent.key;
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration: 800, useNativeDriver: true });
    animation.start();
    const timeout = setTimeout(() => setDismissedKey(key), 4500);
    return () => { clearTimeout(timeout); animation.stop(); };
  }, [state.levelEvent, progress]);
  if (!event) return null;
  return <View pointerEvents="box-none" style={styles.overlay}>
    <View pointerEvents="none" style={styles.confetti}>
      {Array.from({ length: 16 }, (_, index) => <Animated.View key={index} style={[styles.piece, {
        backgroundColor: ['#eecc70', '#eb93b0', '#91bf94', '#ac9edc'][index % 4],
        opacity: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 0] }),
        transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(index * 2.4) * 175] }) },
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(index * 2.4) * 110] }) },
          { rotate: `${index * 37}deg` }],
      }]} />)}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Dismiss level up celebration" onPress={() => setDismissedKey(event.key)}>
      <WoodPanel style={styles.card}>
        <GardenText style={styles.eyebrow}>✦ LEVEL UP! ✦</GardenText>
        <GardenText style={styles.title}>Level {event.to}</GardenText>
        <GardenText style={styles.subtitle}>{event.seeds.length === 1 ? 'One new seed unlocked' : `${event.seeds.length} new seeds unlocked`}</GardenText>
        <View style={styles.seeds}>{event.seeds.map((id) => <PlantSprite key={id} plant={getPlant(id)} size={44} />)}</View>
        <GardenText style={styles.subtitle}>{event.seeds.map((id) => getPlant(id).name).join(' · ')}</GardenText>
      </WoodPanel>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 6, alignItems: 'center', justifyContent: 'center' },
  card: { maxWidth: 310, padding: 18, alignItems: 'center', gap: 7 },
  eyebrow: { color: palette.leaf, fontSize: 13 }, title: { fontSize: 30 }, subtitle: { fontSize: 12, textAlign: 'center' },
  seeds: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  confetti: { position: 'absolute' }, piece: { position: 'absolute', width: 7, height: 10 },
});
