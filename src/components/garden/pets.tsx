import { memo, useEffect, useState } from 'react';
import { Animated, AppState, Easing, Pressable, StyleSheet, View } from 'react-native';
import { pets, type PlacedPet } from '@/game/garden';
import { petRoamPath } from '@/game/garden-layout';
import { useGardenState } from '@/game/garden-provider';
import { PixelPet } from './pixel-sprites';

function RoamingPet({ placed, width, height, onPress }: { placed: PlacedPet; width: number; height: number; onPress: () => void }) {
  const pet = pets.find((item) => item.id === placed.id)!;
  const index = pets.indexOf(pet);
  const scale = height >= 550 ? 3 : 2;
  const spriteWidth = 24 * scale, spriteHeight = 22 * scale;
  const [position] = useState(() => new Animated.ValueXY());
  const [frame, setFrame] = useState(0);
  const [walking, setWalking] = useState(false);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    let stopped = false, paused = false, timer: ReturnType<typeof setTimeout> | undefined;
    let active: Animated.CompositeAnimation | undefined;
    const path = petRoamPath(width, height, index, spriteWidth, spriteHeight);
    const start = { x: Math.round(placed.x * width - spriteWidth / 2), y: Math.round(placed.y * height - spriteHeight) };
    position.setValue(start);
    let current = start;
    let cursor = path.reduce((nearest, point, candidate) =>
      Math.hypot(point.x - start.x, point.y - start.y) < Math.hypot(path[nearest].x - start.x, path[nearest].y - start.y) ? candidate : nearest, 0);
    const walk = () => {
      if (stopped || paused) return;
      const target = path[cursor];
      setFlip(target.x < current.x); setWalking(true);
      const distance = Math.hypot(target.x - current.x, target.y - current.y);
      active = Animated.timing(position, { toValue: target, duration: Math.max(2200, distance * (pet.id === 'turtle' ? 130 : 55)),
        easing: Easing.linear, useNativeDriver: true, isInteraction: false });
      active.start(({ finished }) => {
        if (!finished || stopped) return;
        cursor = (cursor + (index % 2 ? -1 : 1) + path.length) % path.length;
        current = target; setWalking(false);
        timer = setTimeout(walk, 1100 + index * 130);
      });
    };
    const subscription = AppState.addEventListener('change', (status) => {
      paused = status !== 'active';
      if (paused) { active?.stop(); clearTimeout(timer); setWalking(false); }
      else walk();
    });
    if (AppState.currentState === 'active' || AppState.currentState === null) walk();
    return () => { stopped = true; clearTimeout(timer); active?.stop(); subscription.remove(); };
  }, [placed.x, placed.y, width, height, index, pet.id, position, spriteWidth, spriteHeight]);

  useEffect(() => {
    if (!walking) return;
    const timer = setInterval(() => setFrame((value) => (value + 1) % 4), pet.id === 'turtle' ? 280 : 170);
    return () => clearInterval(timer);
  }, [walking, pet.id]);

  return <Animated.View style={[styles.pet, { width: spriteWidth, height: spriteHeight,
    transform: [{ translateX: position.x }, { translateY: position.y }] }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${pet.name}, open pet cottage`} onPress={onPress}
      style={{ width: spriteWidth, height: Math.max(44, spriteHeight), alignItems: 'center' }}>
      <View pointerEvents="none" style={[styles.shadow, { left: scale * 4, right: scale * 3, bottom: scale * 2 }]} />
      <PixelPet pet={pet} scale={scale} frame={walking ? frame : 0} flip={flip} />
    </Pressable>
  </Animated.View>;
}

export const GardenPets = memo(function GardenPets({ width, height, onPress }: { width: number; height: number; onPress: () => void }) {
  const { state } = useGardenState();
  return <>{state.roamingPets.map((pet) => <RoamingPet key={pet.id} placed={pet} width={width} height={height} onPress={onPress} />)}</>;
});

const styles = StyleSheet.create({
  pet: { position: 'absolute', top: 0, left: 0, zIndex: 2 },
  shadow: { position: 'absolute', height: 4, backgroundColor: '#3b765033' },
});
