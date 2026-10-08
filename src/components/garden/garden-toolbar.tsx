import { router } from 'expo-router';
import { memo, useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { getLevel, getPlant, unlockedAt } from '@/game/garden';
import { useGardenState } from '@/game/garden-provider';
import { useIdlePanel } from '@/hooks/use-idle-panel';
import { GardenButton, GardenText, palette, PixelSwitch, WoodPanel, useGardenControlScale, useGardenControlStyles } from './garden-ui';
import { PlantSprite } from './sprites';

export const GardenToolbar = memo(function GardenToolbar({ left, bottom, width, onWardrobe, onPets, onStats }: {
  left: number; bottom: number; width: number;
  onWardrobe: () => void; onPets: () => void; onStats: () => void;
}) {
  const scale = useGardenControlScale();
  const styles = useGardenControlStyles(baseStyles);
  const { state, perform } = useGardenState();
  const idle = useIdlePanel(), { collapsed } = idle;
  const interact = (action: () => void) => () => { idle.touchEnd(); action(); };
  const [fold] = useState(() => new Animated.Value(collapsed ? 1 : 0));
  const selected = getPlant(state.selectedSeed), level = getLevel(state.xp);
  const shortcuts = [...new Set([selected.id, ...unlockedAt(level).filter((seed) => state.inventory[seed.id] > 0).map((seed) => seed.id), 'carrot'])]
    .slice(0, 3).map(getPlant);
  useEffect(() => {
    const animation = Animated.timing(fold, { toValue: collapsed ? 1 : 0, duration: 220, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [collapsed, fold]);
  return <>
    <Animated.View onTouchStart={idle.touchStart} onTouchEnd={idle.touchEnd} onTouchCancel={idle.touchEnd}
      pointerEvents={collapsed ? 'none' : 'auto'} accessibilityElementsHidden={collapsed}
      importantForAccessibility={collapsed ? 'no-hide-descendants' : 'auto'}
      style={[styles.expanded, { left, bottom, width, opacity: fold.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [{ translateY: fold.interpolate({ inputRange: [0, 1], outputRange: [0, 70 * scale + bottom] }) }] }]}>
      <WoodPanel style={styles.bar}>
        <ScrollView horizontal style={styles.scroll} contentContainerStyle={styles.tools} showsHorizontalScrollIndicator={false} onScroll={idle.activity} scrollEventThrottle={150}>
          {shortcuts.map((seed) => <Pressable key={seed.id} accessibilityRole="button"
            accessibilityLabel={`Select ${seed.name} seed, ${state.inventory[seed.id]} owned`}
            accessibilityState={{ selected: seed.id === selected.id }} onPress={interact(() => perform({ type: 'selectSeed', id: seed.id }))}
            style={[styles.seed, seed.id === selected.id && styles.selectedSeed]}>
            <PlantSprite plant={seed} size={38 * scale} /><GardenText style={styles.seedCount}>{state.inventory[seed.id]}</GardenText>
          </Pressable>)}
          <GardenButton label={'Seed\nshed'} tone="wood" onPress={interact(() => router.push('/shop'))} style={styles.tool} />
          <GardenButton label="Wardrobe" tone="wood" onPress={interact(onWardrobe)} style={styles.tool} />
          <GardenButton label={'Pet\ncottage'} tone="wood" onPress={interact(onPets)} style={styles.tool} />
          <GardenButton label={'Garden\nstats'} tone="wood" onPress={interact(onStats)} style={styles.tool} />
          <GardenButton label="···" tone="wood" accessibilityLabel="Garden settings" onPress={interact(() => router.push('/settings'))} style={styles.settings} />
        </ScrollView>
        <PixelSwitch label="Quick play" value={state.quick} disabled={!!state.session} onChange={(quick) => { idle.touchEnd(); perform({ type: 'mode', quick }); }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Fold garden toolbar" accessibilityState={{ expanded: true }}
          onPress={idle.close} style={({ pressed }) => [styles.foldButton, pressed && styles.pressed]}>
          <PixelChevron />
        </Pressable>
      </WoodPanel>
    </Animated.View>
    {collapsed && <Pressable accessibilityRole="button" accessibilityLabel={`Open garden toolbar, ${selected.name} seed selected`}
      accessibilityState={{ expanded: false }} onPress={idle.open} style={({ pressed }) => [styles.pocket, { left, bottom }, pressed && styles.pressed]}>
      <WoodPanel style={styles.pocketPanel}><PlantSprite plant={selected} size={32 * scale} />
        <GardenText style={styles.pocketLabel}>Tools</GardenText><View style={styles.upArrow}><PixelChevron up /></View>
      </WoodPanel>
    </Pressable>}
  </>;
});

function PixelChevron({ up = false }: { up?: boolean }) {
  const scale = useGardenControlScale();
  return <View pointerEvents="none" style={{ width: 14 * scale, height: 8 * scale, transform: [{ scaleY: up ? -1 : 1 }] }}>
    {[0, 1, 2, 3].map((step) => <View key={step} style={{ position: 'absolute', top: step * 2 * scale, left: step * 2 * scale,
      width: (14 - step * 4) * scale, height: 2 * scale, borderLeftWidth: 2 * scale, borderRightWidth: 2 * scale, borderColor: palette.ink }} />)}
  </View>;
}

const baseStyles = StyleSheet.create({
  expanded: { position: 'absolute', height: 58, zIndex: 3 },
  bar: { height: 58, backgroundColor: palette.rose, padding: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  scroll: { flex: 1 }, tools: { flexGrow: 1, gap: 5, alignItems: 'center', padding: 1 },
  seed: { width: 44, height: 44, borderWidth: 2, borderColor: '#a57473', backgroundColor: palette.wood, alignItems: 'center', justifyContent: 'center' },
  selectedSeed: { borderColor: palette.border, backgroundColor: palette.gold }, seedCount: { position: 'absolute', bottom: 0, right: 1, fontSize: 12 },
  settings: { minWidth: 44, paddingHorizontal: 5 },
  tool: { flexGrow: 1, minWidth: 67, paddingHorizontal: 5, paddingVertical: 3 },
  foldButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#a57473', backgroundColor: palette.wood },
  pocket: { position: 'absolute', zIndex: 3, width: 64, minHeight: 58 },
  pocketPanel: { minHeight: 58, padding: 5, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  pocketLabel: { fontSize: 12 }, upArrow: { position: 'absolute', right: 7, top: 7 }, pressed: { opacity: 0.75 },
});
