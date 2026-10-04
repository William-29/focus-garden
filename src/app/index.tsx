import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gardener } from '@/components/garden/gardener';
import { GardenPanel, type GardenPanelName } from '@/components/garden/garden-panels';
import { GardenButton, GardenText, palette, PixelSwitch, ProgressBar, WoodPanel } from '@/components/garden/garden-ui';
import { GrowingPanel } from '@/components/garden/growing-panel';
import { LevelCelebration } from '@/components/garden/level-celebration';
import { gardenBackground, PlantSprite } from '@/components/garden/sprites';
import { GrowingPlot } from '@/components/garden/growing-plot';
import { GardenPets } from '@/components/garden/pets';
import { getLevel, getPlant, growth, MAX_LEVEL, pets, unlockedAt, type PetKind } from '@/game/garden';
import { gardenLayout } from '@/game/garden-layout';
import { useGarden } from '@/game/garden-provider';

const displayPositions = [
  [0.29, 0.24], [0.41, 0.23], [0.53, 0.24], [0.65, 0.27],
  [0.65, 0.45], [0.63, 0.60], [0.37, 0.62], [0.19, 0.47],
];

export default function HomeScreen() {
  const { state, now, perform } = useGarden();
  const dimensions = useWindowDimensions(), insets = useSafeAreaInsets();
  const [panel, setPanel] = useState<GardenPanelName | null>(null);
  const [displaySlot, setDisplaySlot] = useState(0);
  const [placingPet, setPlacingPet] = useState<PetKind | null>(null);
  const closePanel = useCallback(() => setPanel(null), []);
  const openPets = useCallback(() => setPanel('pets'), []);
  const placePet = useCallback((id: PetKind) => { setPanel(null); setPlacingPet(id); }, []);
  const { width, height } = dimensions;
  const layout = gardenLayout(width, height, insets);
  const level = getLevel(state.xp), session = state.session;
  const selected = getPlant(state.selectedSeed), plant = getPlant(session?.plantId ?? state.selectedSeed);
  const percent = session ? growth(session, now) : 0;
  const displaySize = Math.max(44, width * 0.07);
  const seedShortcuts = [...new Set([selected.id, ...unlockedAt(level).filter((seed) => state.inventory[seed.id] > 0).map((seed) => seed.id), 'carrot'])].slice(0, 3).map(getPlant);
  const bedLabel = !session ? 'Main growing plot' : session.status === 'ready' ? 'Ready to harvest'
    : session.phase === 1 ? 'Resting' : session.status === 'paused' ? 'Paused' : `${Math.floor(percent * 100)}% grown`;

  function openDisplay(slot: number) { setDisplaySlot(slot); setPanel('display'); }
  function keep() {
    const full = !state.displaySlots.includes(null);
    perform({ type: 'keep' });
    if (full) openDisplay(0);
  }

  if (dimensions.height > dimensions.width) return <View style={styles.rotate}>
    <GardenText style={styles.rotateSymbol}>↻</GardenText>
    <GardenText style={styles.rotateTitle}>A little room to grow</GardenText>
    <GardenText style={styles.rotateCopy}>Turn your phone to landscape to enter your garden.</GardenText>
  </View>;

  return <View style={styles.screen}>
    <ImageBackground source={gardenBackground} resizeMode="stretch" style={[styles.world, { width, height }]}>
      <View style={[styles.header, { left: layout.controls.left, right: layout.right, top: layout.controls.top }]}>
        <WoodPanel style={styles.brand}>
          <GardenText style={styles.brandSprout}>♧</GardenText>
          <View><GardenText style={[styles.brandTitle, { fontSize: width < 700 ? 16 : 20 }]}>Focus Garden</GardenText>
            <GardenText style={styles.brandSubtitle}>Your private garden</GardenText></View>
        </WoodPanel>
        <View style={styles.hud}>
          <WoodPanel style={styles.level}>
            <View style={styles.levelBadge}><GardenText style={styles.levelNumber}>{level}</GardenText><GardenText style={styles.lv}>LV</GardenText></View>
            <View style={styles.levelCopy}>
              <GardenText style={styles.hudText}>{level === MAX_LEVEL ? 'Master gardener' : 'Growing gardener'}</GardenText>
              <GardenText style={styles.xp}>XP {level === MAX_LEVEL ? 'MAX' : `${state.xp % 100} / 100`}</GardenText>
              <ProgressBar value={level === MAX_LEVEL ? 1 : state.xp % 100 / 100} label="XP to next garden level" />
            </View>
          </WoodPanel>
          <WoodPanel style={styles.coins}><GardenText style={styles.coinSymbol}>◎</GardenText>
            <View><GardenText style={styles.coinNumber}>{state.coins}</GardenText><GardenText style={styles.lv}>Coins</GardenText></View>
          </WoodPanel>
        </View>
      </View>

      {state.displaySlots.map((id, index) => {
        const kept = state.keptPlants.find((item) => item.id === id);
        const displayed = kept ? getPlant(kept.plantId) : null;
        return <Pressable key={index} accessibilityRole="button"
          accessibilityLabel={`Display space ${index + 1}${displayed ? `, ${displayed.name}` : ', empty'}`}
          onPress={() => openDisplay(index)} style={({ pressed }) => [styles.display, displayed && styles.occupied, pressed && styles.displayPressed, {
            left: displayPositions[index][0] * width - displaySize / 2, top: displayPositions[index][1] * height - displaySize / 2,
            width: displaySize, height: displaySize,
          }]}>
          {displayed ? <PlantSprite plant={displayed} size={displaySize - 4} /> : <GardenText style={styles.emptyFlower}>✿</GardenText>}
          <GardenText style={styles.displayNumber}>{index + 1}</GardenText>
        </Pressable>;
      })}

      <GrowingPlot width={width} height={height} plant={plant} planted={!!session} percent={percent} ready={session?.status === 'ready'} label={bedLabel} />

      <Gardener width={width} height={height} />
      <GardenPets width={width} height={height} onPress={openPets} />
      <WoodPanel style={[styles.dialogue, { left: layout.controls.left, bottom: layout.bottom + 66, width: layout.toolbarWidth }]}>
        <GardenText accessibilityLiveRegion="polite" numberOfLines={2} style={styles.message}>{state.message}</GardenText>
      </WoodPanel>
      <GrowingPanel width={layout.controls.width} height={layout.controls.height} right={layout.right} bottom={layout.bottom} onKeep={keep} />

      <WoodPanel style={[styles.toolbar, { left: layout.controls.left, bottom: layout.bottom, width: layout.toolbarWidth }]}>
        <ScrollView horizontal style={styles.toolsScroll} contentContainerStyle={styles.tools} showsHorizontalScrollIndicator={false}>
          {seedShortcuts.map((seed) => <Pressable key={seed.id} accessibilityRole="button"
            accessibilityLabel={`Select ${seed.name} seed, ${state.inventory[seed.id]} owned`}
            accessibilityState={{ selected: seed.id === selected.id }} onPress={() => perform({ type: 'selectSeed', id: seed.id })}
            style={[styles.seed, seed.id === selected.id && styles.selectedSeed]}>
            <PlantSprite plant={seed} size={38} /><GardenText style={styles.seedCount}>{state.inventory[seed.id]}</GardenText>
          </Pressable>)}
          <GardenButton label={'Seed\nshed'} tone="wood" onPress={() => router.push('/shop')} style={styles.tool} />
          <GardenButton label="Wardrobe" tone="wood" onPress={() => setPanel('wardrobe')} style={styles.tool} />
          <GardenButton label={'Pet\ncottage'} tone="wood" onPress={() => setPanel('pets')} style={styles.tool} />
          <GardenButton label={'Display\nfarm'} tone="wood" onPress={() => openDisplay(0)} style={styles.tool} />
          <GardenButton label={'Garden\nstats'} tone="wood" onPress={() => setPanel('stats')} style={styles.tool} />
          <GardenButton label="···" tone="wood" accessibilityLabel="Garden settings" onPress={() => router.push('/settings')} />
        </ScrollView>
        <PixelSwitch label="Quick play" value={state.quick} disabled={!!session} onChange={(quick) => perform({ type: 'mode', quick })} />
      </WoodPanel>
      {placingPet && <View style={styles.placement}>
        <Pressable accessibilityRole="button" accessibilityLabel="Place pet in the garden"
          style={[styles.placementGrass, { left: width * 0.18, top: height * 0.3, width: width * 0.22, height: height * 0.28 }]}
          onPress={(event) => {
            perform({ type: 'placePet', id: placingPet, x: 0.18 + event.nativeEvent.locationX / width, y: 0.3 + event.nativeEvent.locationY / height });
            setPlacingPet(null);
          }}><GardenText style={styles.placementText}>Tap the grass</GardenText></Pressable>
        <WoodPanel style={[styles.placementHelp, { left: layout.controls.left, right: layout.right, bottom: layout.bottom }]}>
          <GardenText style={{ flex: 1 }}>Place {pets.find((pet) => pet.id === placingPet)?.name}. It will roam around the garden.</GardenText>
          <GardenButton label="Cancel" tone="wood" onPress={() => setPlacingPet(null)} />
        </WoodPanel>
      </View>}
      <LevelCelebration />
    </ImageBackground>
    {panel && <GardenPanel panel={panel} onClose={closePanel} initialSlot={displaySlot} onPlacePet={placePet} />}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#80dfad' },
  world: { flex: 1, overflow: 'hidden' },
  header: { position: 'absolute', top: 10, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 9 },
  brandSprout: { fontSize: 25, color: palette.leaf }, brandTitle: { fontSize: 20 },
  brandSubtitle: { fontSize: 9, color: palette.muted, marginTop: 2 }, hud: { flexDirection: 'row', gap: 7 },
  level: { flexDirection: 'row', gap: 7, alignItems: 'center', padding: 6 },
  levelBadge: { width: 28, backgroundColor: palette.gold, borderWidth: 1, borderColor: '#aa7d72', alignItems: 'center', padding: 2 },
  levelNumber: { fontSize: 17 }, lv: { fontSize: 9 }, levelCopy: { gap: 2 }, hudText: { fontSize: 10 },
  xp: { fontSize: 9, color: palette.muted }, coins: { flexDirection: 'row', gap: 7, alignItems: 'center', padding: 7 },
  coinSymbol: { fontSize: 23, color: '#b98d4e' }, coinNumber: { fontSize: 21 },
  display: { position: 'absolute', borderWidth: 1, borderStyle: 'dashed', borderColor: '#79a68688', backgroundColor: '#bdd6a833', alignItems: 'center', justifyContent: 'center' },
  occupied: { backgroundColor: '#d1e6b966', borderStyle: 'solid', borderColor: '#98b08b' }, displayPressed: { backgroundColor: '#dcf1c6aa' },
  emptyFlower: { fontSize: 18, color: '#68927366' }, displayNumber: { position: 'absolute', bottom: 1, right: 2, fontSize: 8, color: '#689273' },
  dialogue: { position: 'absolute', left: 12, bottom: 78, minHeight: 34, justifyContent: 'center', paddingVertical: 7, zIndex: 3 },
  message: { fontSize: 10, lineHeight: 14 }, toolbar: { position: 'absolute', left: 12, bottom: 12, height: 58, backgroundColor: palette.rose, padding: 4, flexDirection: 'row', alignItems: 'center', gap: 4, zIndex: 3 },
  toolsScroll: { flex: 1 }, tools: { gap: 5, alignItems: 'center', padding: 1 },
  seed: { width: 44, height: 44, borderWidth: 2, borderColor: '#a57473', backgroundColor: palette.wood, alignItems: 'center', justifyContent: 'center' },
  selectedSeed: { borderColor: palette.border, backgroundColor: palette.gold }, seedCount: { position: 'absolute', bottom: 0, right: 1, fontSize: 9 },
  tool: { minWidth: 67, paddingHorizontal: 5, paddingVertical: 3 },
  placement: { ...StyleSheet.absoluteFill, zIndex: 8, backgroundColor: '#264b3c33' },
  placementGrass: { position: 'absolute', backgroundColor: '#def4be66', borderWidth: 3, borderStyle: 'dashed',
    borderColor: '#fff4ce', alignItems: 'center', justifyContent: 'center' },
  placementText: { color: '#395a45', backgroundColor: '#fff4d9', padding: 4 },
  placementHelp: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 10 },
  rotate: { flex: 1, backgroundColor: palette.plum, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 15 },
  rotateSymbol: { color: palette.gold, fontSize: 65 }, rotateTitle: { color: palette.cream, fontSize: 23, textAlign: 'center' },
  rotateCopy: { color: palette.cream, fontSize: 14, textAlign: 'center' },
});
