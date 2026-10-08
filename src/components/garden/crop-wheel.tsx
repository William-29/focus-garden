import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, PanResponder, Pressable, ScrollView, StyleSheet, View, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { canPlantCrop, cropFilters, filteredCrops, type CropFilter, cropWheelEntries, wheelAngleDelta, wheelSector, wrapCropIndex } from '@/game/crop-wheel';
import { growingGeometry } from '@/game/garden-navigation';
import { useGardenState } from '@/game/garden-provider';
import type { Plant } from '@/game/garden';
import { GardenButton, GardenText, palette, WoodPanel } from './garden-ui';
import { PlantSprite } from './sprites';

const CropIcon = memo(function CropIcon({ plant, count, size, muted }: { plant: Plant; count: number; size: number; muted: boolean }) {
  return <><PlantSprite plant={plant} size={size - 22} centered muted={muted} />
    <GardenText style={styles.quantity}>x{count}</GardenText></>;
});

export function CropWheel({ width, height, onClose, onOpenShed }: {
  width: number; height: number; onClose: () => void; onOpenShed: () => void;
}) {
  const { state, perform } = useGardenState();
  const [filter, setFilter] = useState<CropFilter>('All');
  const crops = useMemo(() => filteredCrops(state, filter), [state, filter]);
  const insets = useSafeAreaInsets(), count = crops.length;
  const [turn, setTurn] = useState(() => Math.max(0, crops.findIndex((plant) => plant.id === state.selectedSeed)));
  const [rotation] = useState(() => new Animated.Value(turn));
  const currentTurn = useRef(turn), submitted = useRef(false), suppressTapUntil = useRef(0);
  const ring = useRef<View>(null), center = useRef({ x: 0, y: 0 }), lastAngle = useRef(0);
  const size = Math.min(count < 4 ? 200 : 232, Math.max(168, height - insets.top - insets.bottom - 164));
  const iconSize = size < 220 ? 44 : 54, radius = (size - iconSize) / 2 - 4;
  const plot = growingGeometry(width, height, state.season), panelWidth = size + 16, panelHeight = size + 152;
  const left = Math.max(insets.left + 8, Math.min(width - insets.right - panelWidth - 8, plot.left + plot.width / 2 - panelWidth / 2));
  const top = Math.max(insets.top + 8, Math.min(height - insets.bottom - panelHeight - 8, plot.top + plot.height / 2 - panelHeight / 2));
  const focusedIndex = wrapCropIndex(Math.round(turn), count), focused = crops[focusedIndex];

  useEffect(() => {
    const listener = rotation.addListener(({ value }) => { currentTurn.current = value; setTurn(value); });
    return () => { rotation.removeListener(listener); rotation.stopAnimation(); };
  }, [rotation]);
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => back.remove();
  }, [onClose]);

  const snap = useCallback(() => {
    suppressTapUntil.current = Date.now() + 150;
    Animated.timing(rotation, { toValue: Math.round(currentTurn.current), duration: 140, useNativeDriver: false }).start();
  }, [rotation]);
  const beginTurn = useCallback((_: GestureResponderEvent, gesture: PanResponderGestureState) => {
    rotation.stopAnimation();
    lastAngle.current = Math.atan2(gesture.y0 - center.current.y, gesture.x0 - center.current.x);
  }, [rotation]);
  const moveTurn = useCallback((_: GestureResponderEvent, gesture: PanResponderGestureState) => {
    // The hub has no useful angle; ignore movements through its center.
    if (Math.hypot(gesture.moveX - center.current.x, gesture.moveY - center.current.y) < 24) return;
    const angle = Math.atan2(gesture.moveY - center.current.y, gesture.moveX - center.current.x);
    const delta = wheelAngleDelta(lastAngle.current, angle);
    lastAngle.current = angle;
    rotation.setValue(currentTurn.current - delta / wheelSector(count));
  }, [count, rotation]);
  // PanResponder stores these event callbacks; it never reads their refs during
  // construction. The compiler cannot infer that contract from the native API.
  // eslint-disable-next-line react-hooks/refs
  const responder = useMemo(() => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => count > 1 && Math.hypot(gesture.dx, gesture.dy) > 6,
      onMoveShouldSetPanResponderCapture: (_, gesture) => count > 1 && Math.hypot(gesture.dx, gesture.dy) > 6,
      onPanResponderGrant: beginTurn,
      onPanResponderMove: moveTurn,
      onPanResponderRelease: snap,
      onPanResponderTerminate: snap,
    }), [count, beginTurn, moveTurn, snap]);

  function changeFilter(next: CropFilter) {
    rotation.stopAnimation();
    currentTurn.current = 0;
    rotation.setValue(0);
    setTurn(0);
    setFilter(next);
  }

  function rotate(direction: number) {
    rotation.stopAnimation();
    Animated.timing(rotation, { toValue: Math.round(currentTurn.current) + direction, duration: 160, useNativeDriver: false }).start();
  }
  const plant = useCallback((id: string) => {
    if (submitted.current || Date.now() < suppressTapUntil.current || !canPlantCrop(state, id)) return;
    submitted.current = true;
    perform({ type: 'plantSeed', id, now: Date.now() });
    onClose();
  }, [perform, onClose, state]);
  function measureCenter() {
    ring.current?.measureInWindow((x, y, w, h) => { center.current = { x: x + w / 2, y: y + h / 2 }; });
  }

  return <View style={styles.overlay} accessibilityViewIsModal onAccessibilityEscape={onClose}>
    <Pressable style={styles.backdrop} accessibilityRole="button" accessibilityLabel="Dismiss crop wheel" onPress={onClose} />
    <WoodPanel style={[styles.panel, { left, top, width: panelWidth }]}>
      <View style={styles.heading}><GardenText style={styles.title}>Plant a seed</GardenText>
        <Pressable style={styles.close} accessibilityRole="button" accessibilityLabel="Close crop wheel" onPress={onClose}>
          <GardenText>X</GardenText>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.filters} contentContainerStyle={styles.filterRow}>
        {cropFilters.map((option) => <Pressable key={option} accessibilityRole="button"
          accessibilityLabel={option === 'All' ? 'All plants in level order' : option === 'Owned' ? 'All owned seeds' : option}
          accessibilityState={{ selected: filter === option }} onPress={() => changeFilter(option)}
          style={[styles.filter, filter === option && styles.selectedFilter]}>
          <GardenText style={styles.filterText}>{option}</GardenText>
        </Pressable>)}
      </ScrollView>
      {count ? <>
        <View ref={ring} style={{ width: size, height: size }} onLayout={measureCenter} onTouchStart={measureCenter} {...responder.panHandlers}>
          <View pointerEvents="none" style={[styles.rim, { inset: iconSize / 2 - 8, borderRadius: size / 2 }]} />
          <View pointerEvents="none" style={[styles.rimInset, { inset: iconSize / 2, borderRadius: size / 2 }]} />
          <View pointerEvents="none" style={[styles.hub, { left: size / 2 - 48, top: size / 2 - 30 }]}>
            <GardenText numberOfLines={1} style={styles.cropName}>{focused.name}</GardenText>
            <GardenText style={styles.duration}>{focused.minutes[0]}m {state.quick ? 'quick' : 'focus'}</GardenText>
            <GardenText style={styles.position}>Lv {focused.unlockLevel} · {focusedIndex + 1}/{count}</GardenText>
          </View>
          {cropWheelEntries(count, turn).map(({ index, angle }) => {
            const crop = crops[index], owned = state.inventory[crop.id] ?? 0;
            const enabled = canPlantCrop(state, crop.id);
            return <Pressable key={crop.id} accessibilityRole="button" accessibilityLabel={`${crop.name}, level ${crop.unlockLevel}, ${owned} seeds${enabled ? ", tap to plant" : ", unavailable"}`} disabled={!enabled} accessibilityState={{ disabled: !enabled }}
              onPress={() => plant(crop.id)} style={({ pressed }) => [styles.crop, index === focusedIndex && styles.focusedCrop, !enabled && styles.unavailableCrop,
                { width: iconSize, height: iconSize, left: Math.round(size / 2 + Math.cos(angle) * radius - iconSize / 2),
                  top: Math.round(size / 2 + Math.sin(angle) * radius - iconSize / 2) }, pressed && styles.pressed]}>
              <CropIcon plant={crop} count={owned} size={iconSize} muted={!enabled} />
            </Pressable>;
          })}
        </View>
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous crop" disabled={count < 2} onPress={() => rotate(-1)} style={[styles.arrow, count < 2 && styles.disabled]}>
            <GardenText>{'<'}</GardenText>
          </Pressable>
          <GardenText style={styles.hint}>{canPlantCrop(state, focused.id) ? 'Tap a crop to plant' : (state.inventory[focused.id] ?? 0) === 0 ? 'x0 · No seeds owned' : `Unlocks at level ${focused.unlockLevel}`}</GardenText>
          <Pressable accessibilityRole="button" accessibilityLabel="Next crop" disabled={count < 2} onPress={() => rotate(1)} style={[styles.arrow, count < 2 && styles.disabled]}>
            <GardenText>{'>'}</GardenText>
          </Pressable>
        </View>
      </> : <View style={[styles.empty, { minHeight: size + 44 }]}>
        <GardenText style={styles.emptyTitle}>Your seed bag is empty</GardenText>
        <GardenText style={styles.hint}>Pick up seeds at the shed, then plant them here.</GardenText>
        <GardenButton label="Open seed shed" tone="wood" onPress={() => { onClose(); onOpenShed(); }} />
      </View>}
    </WoodPanel>
  </View>;
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 12 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#352b3a55' },
  panel: { position: 'absolute', padding: 8 },
  filters: { height: 44, flexGrow: 0, marginBottom: 4 },
  filterRow: { gap: 4, alignItems: 'center' },
  filter: { height: 44, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: '#dfbe8c', borderWidth: 2, borderColor: '#a77b58' },
  selectedFilter: { backgroundColor: palette.green, borderColor: '#53734b' },
  filterText: { fontSize: 12 },
  unavailableCrop: { backgroundColor: '#d1d1ca', borderColor: '#999b94' },
  heading: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 14, paddingLeft: 4 }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  rim: { position: 'absolute', borderWidth: 7, borderColor: '#87624e', backgroundColor: '#d4ab75' },
  rimInset: { position: 'absolute', borderWidth: 3, borderColor: '#edcf95', backgroundColor: '#fae7d4' },
  hub: { position: 'absolute', width: 96, height: 60, alignItems: 'center', justifyContent: 'center', gap: 2 },
  cropName: { fontSize: 12, textAlign: 'center', maxWidth: 92 }, duration: { fontSize: 12, color: palette.muted },
  position: { fontSize: 12, color: palette.muted },
  crop: { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9e6c7',
    borderWidth: 3, borderTopColor: '#fff4d9', borderLeftColor: '#fff4d9', borderBottomColor: '#a77b58', borderRightColor: '#a77b58' },
  focusedCrop: { backgroundColor: '#edce85', borderColor: '#866346' },
  quantity: { fontSize: 12, lineHeight: 14 }, pressed: { backgroundColor: palette.green },
  footer: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#dfbe8c',
    borderWidth: 2, borderTopColor: '#fff1ca', borderLeftColor: '#fff1ca', borderBottomColor: '#916a51', borderRightColor: '#916a51' },
  disabled: { opacity: 0.35 }, hint: { flexShrink: 1, fontSize: 12, color: palette.muted, textAlign: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 15, padding: 12 }, emptyTitle: { fontSize: 14, textAlign: 'center' },
});
