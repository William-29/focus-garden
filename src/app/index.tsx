import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gardener } from '@/components/garden/gardener';
import { GardenPanel, PetNameEditor, type GardenPanelName } from '@/components/garden/garden-panels';
import { GardenText, palette } from '@/components/garden/garden-ui';
import { GardenHud, GardenSign } from '@/components/garden/garden-hud';
import { SeasonWeather } from '@/components/garden/season-weather';
import { GardenNotice } from '@/components/garden/garden-notice';
import { GardenToolbar } from '@/components/garden/garden-toolbar';
import { GrowingPanel } from '@/components/garden/growing-panel';
import { LevelCelebration } from '@/components/garden/level-celebration';
import { HarvestCelebration } from '@/components/garden/harvest-celebration';
import { SeasonBackground, SeasonLoading } from '@/components/garden/season-loading';
import { GrowingPlot } from '@/components/garden/growing-plot';
import { CropWheel } from '@/components/garden/crop-wheel';
import { GardenPets } from '@/components/garden/pets';
import { DisplayGreenhouse } from '@/components/garden/display-greenhouse';
import { getPlant, growth, timeLeft, pets, type PetKind } from '@/game/garden';
import { createPetNavigation, petPlacementAt } from '@/game/pet-placement';
import { gardenLayout } from '@/game/garden-layout';
import { isGardenGround, signGeometry, type WalkCommand } from '@/game/garden-navigation';
import { useGarden } from '@/game/garden-provider';

export default function HomeScreen() {
  const { state, now, perform, scene, harvest } = useGarden();
  const dimensions = useWindowDimensions(), insets = useSafeAreaInsets();
  const [panel, setPanel] = useState<GardenPanelName | null>(null);
  const [displaySlot, setDisplaySlot] = useState(0);
  const [placingPet, setPlacingPet] = useState<PetKind | null>(null);
  const [editingPet, setEditingPet] = useState<PetKind | null>(null);
  const [walkCommand, setWalkCommand] = useState<WalkCommand | null>(null);
  const [cropWheelOpen, setCropWheelOpen] = useState(false);
  const openCropWheel = useCallback(() => setCropWheelOpen(true), []);
  const closeCropWheel = useCallback(() => setCropWheelOpen(false), []);
  const closePanel = useCallback(() => setPanel(null), []);
  const openPetName = useCallback((id: PetKind) => { setPanel(null); setEditingPet(id); }, []);
  const closePetName = useCallback(() => setEditingPet(null), []);
  const openPets = useCallback(() => setPanel('pets'), []);
  const openNames = useCallback(() => setPanel('names'), []);
  const openWardrobe = useCallback(() => setPanel('wardrobe'), []);
  const openStats = useCallback(() => setPanel('stats'), []);
  const openSeasons = useCallback(() => setPanel('seasons'), []);
  const openSeeds = useCallback(() => router.push('/shop'), []);
  const harvestCrop = useCallback(() => perform({ type: 'harvest' }), [perform]);
  const openDisplay = useCallback((slot: number) => { setDisplaySlot(slot); setPanel('display'); }, []);
  const placePet = useCallback((id: PetKind) => {
    setPanel(null); setEditingPet(null); setCropWheelOpen(false); setPlacingPet(id);
  }, []);
  const cancelPlacement = useCallback(() => setPlacingPet(null), []);
  useEffect(() => {
    if (!placingPet) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { cancelPlacement(); return true; });
    return () => subscription.remove();
  }, [placingPet, cancelPlacement]);
  const { width, height } = dimensions;
  const placementPet = pets.find((pet) => pet.id === placingPet);
  const placementMap = useMemo(() => placementPet ? createPetNavigation(width, height, state.season, placementPet) : null,
    [width, height, state.season, placementPet]);
  const worldVisible = !placingPet && scene.phase === 'ready';
  const layout = gardenLayout(width, height, insets);
  const sign = signGeometry(width, height);
  const session = state.session;
  const plant = getPlant(session?.plantId ?? state.selectedSeed);
  const percent = session ? growth(session, now) : 0;
  const bedLabel = !session ? (state.season === 'winter' ? 'Winter greenhouse' : 'Main growing plot') : session.status === 'ready' ? 'Ready to harvest'
    : session.phase === 1 ? 'Resting' : session.status === 'paused' ? 'Paused' : session.status === 'awaiting' ? 'Next phase ready' : 'Growing';

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
    <View style={[styles.world, { width, height }]}>
      {/* Scenery belongs INSIDE the native screen; the navigator can be opaque on iOS. */}
      <SeasonBackground />
      <View style={[StyleSheet.absoluteFill, placingPet && styles.hiddenWorld]} pointerEvents={worldVisible ? 'box-none' : 'none'}
        accessibilityElementsHidden={!worldVisible} importantForAccessibility={worldVisible ? 'auto' : 'no-hide-descendants'}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Tap open ground to walk here" onPress={(event) => {
        const point = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
        if (isGardenGround(width, height, state.season, point)) setWalkCommand((previous) => ({ ...point, id: (previous?.id ?? 0) + 1 }));
      }} />
      <GardenHud minute={Math.floor(now / 60000) * 60000} coins={state.coins} xp={state.xp} season={state.season}
        left={layout.controls.left} right={layout.right} top={layout.controls.top} onProfile={openStats} onSeason={openSeasons} />
      <GardenSign name={state.gardenName} season={state.season} {...sign} onRename={openNames} />

      <DisplayGreenhouse width={width} height={height} state={state} onSelect={openDisplay} />

      <GrowingPlot season={state.season} width={width} height={height} plant={plant} planted={!!session} percent={percent} remaining={session ? timeLeft(session, now) : 0} ready={session?.status === 'ready'}
        active={session?.status === 'running' && session.phase !== 1} harvesting={!!harvest} label={bedLabel} onOpenSeeds={openCropWheel} onHarvest={harvestCrop} />

      <Gardener width={width} height={height} command={walkCommand} onRename={openNames} onWardrobe={openWardrobe} />
      <GardenPets width={width} height={height} onPress={openPetName} pausedPet={editingPet} />
      <HarvestCelebration width={width} height={height} />
      <SeasonWeather season={state.season} width={width} height={height} />
      <GardenNotice style={[styles.dialogue, { left: layout.controls.left, bottom: layout.bottom + 66, width: layout.toolbarWidth }]} />
      <GrowingPanel width={layout.controls.width} height={layout.controls.height} right={layout.right} bottom={layout.bottom} onKeep={keep} />

      <GardenToolbar left={layout.controls.left} bottom={layout.bottom} width={layout.toolbarWidth}
        onWardrobe={openWardrobe} onPets={openPets} onStats={openStats} />
      <LevelCelebration />
      {cropWheelOpen && !session && !harvest && <CropWheel width={width} height={height} onClose={closeCropWheel} onOpenShed={openSeeds} />}
      </View>
      {placingPet && <Pressable accessibilityRole="button" accessibilityLabel="Tap open ground to place your pet"
        accessibilityHint="The whole garden is available. Tap a clear ground spot to finish placement."
        onAccessibilityEscape={cancelPlacement} style={styles.placement} disabled={scene.phase !== 'ready'}
        onPress={(event) => {
          if (!placementMap) return;
          const point = petPlacementAt(placementMap, width, height,
            { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
          if (!point) return;
          perform({ type: 'placePet', id: placingPet, ...point });
          setPlacingPet(null);
        }} />}
      <SeasonLoading />
    </View>
    {!placingPet && panel && <GardenPanel panel={panel} onClose={closePanel} initialSlot={displaySlot} onPlacePet={placePet} onRenamePet={openPetName} />}
    {!placingPet && editingPet && <PetNameEditor key={editingPet} id={editingPet} onClose={closePetName} />}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  world: { flex: 1, overflow: 'hidden' },
  dialogue: { position: 'absolute', zIndex: 3 },
  hiddenWorld: { opacity: 0 },
  placement: { ...StyleSheet.absoluteFill, zIndex: 8 },
  rotate: { flex: 1, backgroundColor: palette.plum, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 15 },
  rotateSymbol: { color: palette.gold, fontSize: 65 }, rotateTitle: { color: palette.cream, fontSize: 23, textAlign: 'center' },
  rotateCopy: { color: palette.cream, fontSize: 14, textAlign: 'center' },
});
