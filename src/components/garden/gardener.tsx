import { useEffect, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, View } from 'react-native';

import { gardenerActivity } from '@/game/garden';
import { useGarden } from '@/game/garden-provider';
import { GardenText } from './garden-ui';
import { PixelCharacter, PixelStudyTable } from './pixel-sprites';

export function Gardener({ width, height }: { width: number; height: number }) {
  const { state, now } = useGarden();
  const activity = gardenerActivity(state.session, now);
  const [position] = useState(() => new Animated.ValueXY());
  const [bob] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));
  const [roam] = useState(() => new Animated.Value(0));
  const [roamStarted] = useState(Date.now);
  const [frame, setFrame] = useState(0);
  const scale = height >= 550 ? 3 : 2;
  const size = 24 * scale;
  const desk = { left: width * 0.28, top: height * 0.4 };
  const walking = activity === 'roam' || activity === 'walk-to' || activity === 'walk-back';
  const pose = activity === 'study' ? 'study' : activity === 'water' ? 'water' : walking ? 'walk' : 'idle';
  const flip = activity === 'walk-back' || (activity === 'roam' && Math.floor((now - roamStarted) / 9000) % 2 === 1);
  const label = activity === 'study' ? 'Study time' : activity === 'water' ? 'Watering'
    : activity === 'walk-to' ? 'To the plot' : activity === 'walk-back' ? 'Back to study'
      : state.session?.phase === 1 ? 'Garden break' : 'Garden stroll';

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => { clearInterval(timer); timer = undefined; };
    const start = () => {
      stop();
      if (walking || activity === 'water') timer = setInterval(() => setFrame((value) => (value + 1) % 4), 170);
    };
    if (AppState.currentState === 'active' || AppState.currentState === null) start();
    const subscription = AppState.addEventListener('change', (status) => status === 'active' ? start() : stop());
    return () => { stop(); subscription.remove(); };
  }, [walking, activity]);

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(roam, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(roam, { toValue: 0, duration: 9000, easing: Easing.linear, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [roam]);

  useEffect(() => {
    const atPlant = activity === 'walk-to' || activity === 'water';
    const animation = Animated.timing(position, {
      toValue: { x: atPlant ? width * 0.075 : 0, y: atPlant ? height * 0.03 : 0 },
      duration: state.quick ? 1800 : 3800, easing: Easing.linear, useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [activity, width, height, position, state.quick]);

  useEffect(() => {
    bob.setValue(0);
    if (!walking && activity !== 'water') return;
    const duration = walking ? 220 : 450;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -1, duration, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [activity, walking, bob]);

  useEffect(() => {
    if (!state.levelEvent) return;
    const animation = Animated.sequence(Array.from({ length: 3 }, () => Animated.sequence([
      Animated.timing(hop, { toValue: -18, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(hop, { toValue: 0, duration: 240, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ])));
    animation.start();
    return () => animation.stop();
  }, [state.levelEvent, hop]);

  return <>
    {state.session && state.session.status !== 'ready' && activity !== 'study' && (
      <View pointerEvents="none" style={[styles.table, desk]}><PixelStudyTable scale={scale} /></View>
    )}
    <Animated.View pointerEvents="none" style={[styles.character, desk, { width: size,
      transform: [{ translateX: activity === 'roam' ? roam.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.075] }) : position.x },
        { translateY: Animated.add(Animated.add(position.y, bob), hop) }] }]}>
      <PixelCharacter look={state.look} pose={pose} scale={scale} frame={walking || activity === 'water' ? frame : 0} flip={flip} />
      <GardenText numberOfLines={1} style={styles.label}>{label}</GardenText>
    </Animated.View>
  </>;
}

const styles = StyleSheet.create({
  table: { position: 'absolute' }, character: { position: 'absolute', zIndex: 2, alignItems: 'center' },
  label: { fontSize: 12, paddingHorizontal: 4, paddingVertical: 2, backgroundColor: '#fff3d9e8',
    borderWidth: 2, borderColor: '#9aac89', color: '#5c775d', minWidth: 98, textAlign: 'center' },
});
