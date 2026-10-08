import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';
import { gardenerActivity } from '@/game/garden';
import { createNavigation, type WalkCommand } from '@/game/garden-navigation';
import { characterMetrics } from '@/game/character-metrics';
import { useGarden } from '@/game/garden-provider';
import { useGardenWalker } from '@/hooks/use-garden-walker';
import { PixelCharacter, PixelStudyTable } from './pixel-sprites';

export function Gardener({ width, height, command, onRename, onWardrobe }: {
  width: number; height: number; command: WalkCommand | null; onRename: () => void; onWardrobe: () => void;
}) {
  const { state, now } = useGarden();
  const activity = gardenerActivity(state.session, now);
  const { scale, width: spriteWidth, height: spriteHeight } = characterMetrics(height, PixelRatio.get());
  const touchWidth = Math.max(44, spriteWidth), touchHeight = Math.max(44, spriteHeight);
  const desk = { left: width * 0.28, top: height * 0.4 };
  const spawn = { x: desk.left + spriteWidth / 2, y: desk.top + spriteHeight };
  const map = useMemo(() => createNavigation(width, height, state.season, spriteWidth, spriteHeight, { footprintHeight: 10 * scale }),
    [width, height, state.season, spriteWidth, spriteHeight, scale]);
  const anchor = activity === 'study' || activity === 'walk-back' ? spawn
    : activity === 'water' || activity === 'walk-to' ? { x: width * 0.37, y: height * 0.58 } : undefined;
  const { position, walking, flip, frame, followingTap } = useGardenWalker({ map, spawn, command, anchor, speed: 42, cardinal: true });
  const [hop] = useState(() => new Animated.Value(0));
  const [waterFrame, setWaterFrame] = useState(0);
  const pose = walking ? 'walk' : followingTap ? 'idle' : activity === 'study' ? 'study' : activity === 'water' ? 'water' : 'idle';
  useEffect(() => {
    if (pose !== 'water') return;
    const timer = setInterval(() => setWaterFrame((value) => (value + 1) % 4), 250);
    return () => clearInterval(timer);
  }, [pose]);
  useEffect(() => {
    hop.setValue(0);
    if (!state.levelEvent) return;
    const animation = Animated.sequence(Array.from({ length: 3 }, () => Animated.sequence([
      Animated.timing(hop, { toValue: -18, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true, isInteraction: false }),
      Animated.timing(hop, { toValue: 0, duration: 240, easing: Easing.in(Easing.quad), useNativeDriver: true, isInteraction: false }),
    ])));
    animation.start();
    return () => animation.stop();
  }, [state.levelEvent, hop]);
  return <>
    {state.session && state.session.status !== 'ready' && pose !== 'study' && (
      <View pointerEvents="none" style={[styles.table, desk]}><PixelStudyTable scale={scale} /></View>
    )}
    <Animated.View pointerEvents="box-none" style={[styles.character, { left: -touchWidth / 2, top: -touchHeight, width: touchWidth,
      transform: [{ translateX: position.x }, { translateY: Animated.add(position.y, hop) }] }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={'Open wardrobe for ' + state.characterName} onPress={onWardrobe}
        style={{ width: touchWidth, height: touchHeight, alignItems: 'center', justifyContent: 'flex-end' }}>
        <PixelCharacter look={state.look} farmerStyle={state.farmerStyle} pose={pose} scale={scale}
          frame={walking ? frame : pose === 'water' ? waterFrame : 0} flip={flip} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={'Rename character, ' + state.characterName} onPress={onRename} style={styles.nameButton}>
        <Text numberOfLines={1} style={styles.label}>{state.characterName}</Text>
      </Pressable>
    </Animated.View>
  </>;
}
const styles = StyleSheet.create({
  table: { position: 'absolute' }, character: { position: 'absolute', zIndex: 2, alignItems: 'center' },
  nameButton: { minHeight: 44, minWidth: 44, maxWidth: 120, justifyContent: 'flex-start', alignItems: 'center' },
  label: { fontFamily: 'GardenPixel', fontSize: 9, lineHeight: 12, color: '#fff0a6', maxWidth: 120, textAlign: 'center',
    textShadowColor: '#493745', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
});
