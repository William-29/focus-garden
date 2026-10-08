import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getLevel, getPlant, growth, timeLeft } from '@/game/garden';
import { useGarden } from '@/game/garden-provider';
import { useIdlePanel } from '@/hooks/use-idle-panel';
import { durationLabel, formatClock, GardenButton, GardenText, palette, WoodPanel, useGardenControlScale, useGardenControlStyles } from './garden-ui';
import { PlantSprite } from './sprites';
import { GrowthWheel } from './growth-wheel';

export function GrowingPanel({ width, height, right = 12, bottom = 12, onKeep }: {
  width: number; height: number; right?: number; bottom?: number; onKeep: () => void;
}) {
  const scale = useGardenControlScale();
  const styles = useGardenControlStyles(baseStyles);
  const { state, now, perform } = useGarden();
  const idle = useIdlePanel();
  const session = state.session, plant = getPlant(session?.plantId ?? state.selectedSeed);
  const ready = session?.status === 'ready', awaiting = session?.status === 'awaiting';
  const canPlant = state.inventory[plant.id] > 0 && plant.unlockLevel <= getLevel(state.xp);
  const percent = session ? growth(session, now) : 0;
  const remaining = session ? timeLeft(session, now) : plant.minutes[0] * (state.quick ? 1000 : 60000);
  const heading = !session ? 'Plant a seed' : ready ? 'Ready to harvest' : session.phase === 1 ? 'Taking a break' : 'Growing';
  const compactHeading = ready ? plant.name : session?.status === 'paused' ? 'Paused' : awaiting ? 'Next phase ready' : heading;
  const actionLabel = !session ? 'Plant seed' : ready ? 'Harvest' : awaiting
    ? session.phase === 0 ? 'Start break' : 'Start focus session' : session.status === 'paused'
      ? session.phase === 1 ? 'Resume break' : 'Resume growing' : session.phase === 1 ? 'Pause break' : 'Pause growing';
  const note = !session ? plant.unlockLevel > getLevel(state.xp) ? `Unlocks at level ${plant.unlockLevel}`
    : `${state.inventory[plant.id]} seeds in your bag` : ready ? `Either choice earns ${plant.xp} XP. Keeping gives 0 coins.`
      : awaiting ? 'Start the next phase when you are ready.' : session.phase === 1 ? 'Resting. No growth or focus credit.' : 'One plant, one focus session at a time.';

  function primary() {
    idle.touchEnd();
    const timestamp = Date.now();
    if (!session) perform({ type: 'plant', now: timestamp });
    else if (ready) perform({ type: 'harvest' });
    else if (awaiting) perform({ type: 'next', now: timestamp });
    else perform({ type: session.status === 'paused' ? 'resume' : 'pause', now: timestamp });
  }

  if (idle.collapsed) return <Pressable accessibilityRole="button" accessibilityState={{ expanded: false }}
    accessibilityLabel={`Expand growing panel, ${ready ? heading : compactHeading}${session && !ready ? `, ${formatClock(remaining)} remaining` : ''}`}
    onPress={idle.open} style={[styles.folded, { right, bottom, maxWidth: width }]}>
    <WoodPanel style={[styles.foldedPanel, ready && { backgroundColor: palette.gold }]}>
      <PlantSprite plant={plant} size={28 * scale} />
      <View style={styles.foldedCopy}><GardenText numberOfLines={1} style={styles.small}>{compactHeading}</GardenText>
        {ready && <GardenText style={styles.small}>Harvest ready</GardenText>}
      </View>
      {session && <GrowthWheel progress={percent} remaining={remaining} ready={ready} size={48 * scale} />}
      <View style={styles.expandIcon}><View style={styles.minus} /><View style={styles.plusStem} /></View>
    </WoodPanel>
  </Pressable>;

  return <WoodPanel onTouchStart={idle.touchStart} onTouchEnd={idle.touchEnd} onTouchCancel={idle.touchEnd}
    style={[styles.panel, { width: width, maxHeight: height - 72 * scale, right, bottom }]}>
    <View style={styles.titleRow}>
      <View style={styles.headingCopy}><GardenText style={styles.headingText}>{heading}</GardenText>
        <GardenText style={styles.badge}>{state.quick ? 'Quick play' : 'Focus session'}</GardenText></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Minimize growing panel" accessibilityState={{ expanded: true }}
        onPress={idle.close} style={styles.foldButton}><View style={styles.minus} /></Pressable>
    </View>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.details} showsVerticalScrollIndicator={false} onScroll={idle.activity} scrollEventThrottle={150}>
      <View style={styles.plantRow}>
        <PlantSprite plant={plant} size={36 * scale} />
        <View style={styles.plantName}><GardenText style={styles.name}>{plant.name}</GardenText>
          <GardenText style={styles.small}>{plant.rarity}</GardenText></View>
        <GrowthWheel progress={percent} remaining={remaining} ready={ready} size={56 * scale} />
      </View>
      <GardenText style={styles.small}>{durationLabel(plant)}</GardenText>
      {session && plant.minutes.length > 1 && <View style={styles.phases}>
        {plant.minutes.map((minutes, index) => <GardenText key={index}
          style={[styles.phase, session.phase === index && styles.currentPhase]}>{index === 1 ? 'Break' : 'Focus'} {minutes}m</GardenText>)}
      </View>}
      <GardenText style={styles.rewards}>+{plant.coins} coins · +{plant.xp} XP</GardenText>
      <GardenText style={styles.note}>{note}</GardenText>
    </ScrollView>
    <View style={styles.actions}>
      {!session && !canPlant ? <GardenButton label="Open seed shed" tone="wood" onPress={() => { idle.touchEnd(); router.push('/shop'); }} />
        : <GardenButton label={actionLabel} onPress={primary} />}
      {ready && <GardenButton label="Keep for display" tone="wood" onPress={() => { idle.touchEnd(); onKeep(); }} />}
    </View>
  </WoodPanel>;
}

const baseStyles = StyleSheet.create({
  panel: { position: 'absolute', right: 12, bottom: 12, padding: 9, zIndex: 3 },
  folded: { position: 'absolute', zIndex: 3, minHeight: 48 },
  foldedPanel: { padding: 8, minHeight: 48, flexDirection: 'row', gap: 5, alignItems: 'center' },
  foldedCopy: { flexShrink: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#c99e91', marginBottom: 6 },
  headingCopy: { flex: 1, gap: 3 }, foldButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  minus: { width: 12, height: 2, backgroundColor: palette.ink },
  expandIcon: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  plusStem: { position: 'absolute', width: 2, height: 12, backgroundColor: palette.ink },
  scroll: { flexShrink: 1 }, details: { gap: 6, paddingBottom: 7 },
  headingText: { fontSize: 14 }, badge: { fontSize: 9, color: palette.muted, alignSelf: 'flex-start', backgroundColor: '#ebcebd', paddingHorizontal: 4 },
  plantRow: { flexDirection: 'row', alignItems: 'center', gap: 3 }, plantName: { flex: 1 },
  name: { fontSize: 13 }, small: { fontSize: 10, color: palette.muted },
  rewards: { fontSize: 10, textAlign: 'center', color: palette.muted }, note: { fontSize: 10, color: palette.muted, lineHeight: 14 },
  actions: { gap: 6 }, phases: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  phase: { fontSize: 9, padding: 3, backgroundColor: '#eddbcb', color: palette.muted },
  currentPhase: { backgroundColor: palette.green, color: palette.ink },
});
