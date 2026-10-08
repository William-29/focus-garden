import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGardenState } from '@/game/garden-provider';
import { seasonNames } from '@/game/seasons';
import { GardenButton, GardenText, palette, WoodPanel } from './garden-ui';
import { loadingCottage, seasonalBackgrounds } from './sprites';

export function SeasonBackground() {
  const { scene, sceneAction } = useGardenState();
  const id = scene.id;
  return <Image key={id} source={seasonalBackgrounds[scene.season]} style={StyleSheet.absoluteFill}
    accessible={false} pointerEvents="none" contentFit="fill" transition={0} cachePolicy="memory-disk" priority="high"
    onDisplay={() => sceneAction({ type: 'displayed', id, now: Date.now() })}
    onError={() => sceneAction({ type: 'failed', id, now: Date.now() })} />;
}

export function SeasonLoading() {
  const { scene, sceneAction, perform } = useGardenState();
  const insets = useSafeAreaInsets();
  const loading = scene.phase !== 'ready', failed = scene.phase === 'error';
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!loading || failed) return;
    const timer = setInterval(() => setStep((value) => (value + 1) % 3), 320);
    return () => clearInterval(timer);
  }, [loading, failed]);
  if (!loading) return null;
  return <View style={styles.cover} accessibilityViewIsModal onStartShouldSetResponder={() => true}>
    <Image key={scene.id} source={loadingCottage} style={StyleSheet.absoluteFill} contentFit="cover" transition={0}
      accessible={false} cachePolicy="memory-disk" priority="high"
      onDisplay={() => sceneAction({ type: 'artReady', now: Date.now() })}
      onError={() => sceneAction({ type: 'artReady', now: Date.now() })} />
    <View pointerEvents="none" style={styles.shade} />
    <View style={[styles.footer, { bottom: insets.bottom + 16, left: insets.left + 20, right: insets.right + 20 }]}>
      <WoodPanel style={styles.card}>
        <GardenText accessibilityLiveRegion="polite" style={styles.title}>
          {failed ? 'A little pause on the path' : 'Wandering into ' + seasonNames[scene.season] + '...'}
        </GardenText>
        <GardenText style={styles.copy}>{failed ? 'The scenery could not load. Try again when you are ready.' : 'Making room for a new season in your garden.'}</GardenText>
        {failed ? <View style={styles.actions}>
          <GardenButton label="Try again" onPress={() => sceneAction({ type: 'retry', now: Date.now() })} />
          {scene.lastReady && scene.lastReady !== scene.season && <GardenButton label={'Back to ' + seasonNames[scene.lastReady]}
            tone="wood" onPress={() => perform({ type: 'setSeason', season: scene.lastReady! })} />}
        </View> : <View accessibilityRole="progressbar" accessibilityLabel={'Loading ' + seasonNames[scene.season] + ' scenery'} style={styles.dots}>
          {[0, 1, 2].map((index) => <View key={index} style={[styles.dot, { opacity: index === step ? 1 : 0.3 }]} />)}
        </View>}
      </WoodPanel>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  cover: { ...StyleSheet.absoluteFill, zIndex: 30, backgroundColor: '#577962' },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: '#25332912' },
  footer: { position: 'absolute', alignItems: 'center' },
  card: { maxWidth: 400, width: '100%', alignItems: 'center', padding: 12, gap: 5, backgroundColor: '#fff0d5' },
  title: { fontSize: 19, textAlign: 'center' }, copy: { fontSize: 12, color: palette.muted, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 7, height: 12, alignItems: 'center' },
  dot: { width: 7, height: 7, backgroundColor: palette.leaf, borderWidth: 1, borderColor: '#44604a' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
});
