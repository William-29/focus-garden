import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getLevel, getPlant, growth, timeLeft } from '@/game/garden';
import { useGarden } from '@/game/garden-provider';
import { durationLabel, formatClock, GardenButton, GardenText, palette, ProgressBar, WoodPanel } from './garden-ui';
import { PlantSprite } from './sprites';

export function GrowingPanel({ width, height, right = 12, bottom = 12, onKeep }: {
  width: number; height: number; right?: number; bottom?: number; onKeep: () => void;
}) {
  const { state, now, perform } = useGarden();
  const session = state.session, plant = getPlant(session?.plantId ?? state.selectedSeed);
  const ready = session?.status === 'ready', awaiting = session?.status === 'awaiting';
  const canPlant = state.inventory[plant.id] > 0 && plant.unlockLevel <= getLevel(state.xp);
  const percent = session ? growth(session, now) : 0;
  const remaining = session ? timeLeft(session, now) : plant.minutes[0] * (state.quick ? 1000 : 60000);
  const heading = !session ? 'Plant a seed' : ready ? 'Ready to harvest' : session.phase === 1 ? 'Taking a break' : 'Growing';
  const actionLabel = !session ? 'Plant seed' : ready ? 'Harvest' : awaiting
    ? session.phase === 0 ? 'Start break' : 'Start focus session' : session.status === 'paused'
      ? session.phase === 1 ? 'Resume break' : 'Resume growing' : session.phase === 1 ? 'Pause break' : 'Pause growing';
  const note = !session ? plant.unlockLevel > getLevel(state.xp) ? `Unlocks at level ${plant.unlockLevel}`
    : `${state.inventory[plant.id]} seeds in your bag` : ready ? `Either choice earns ${plant.xp} XP. Keeping gives 0 coins.`
      : awaiting ? 'Start the next phase when you are ready.' : session.phase === 1 ? 'Resting. No growth or focus credit.' : 'One plant, one focus session at a time.';

  function primary() {
    const timestamp = Date.now();
    if (!session) perform({ type: 'plant', now: timestamp });
    else if (ready) perform({ type: 'harvest' });
    else if (awaiting) perform({ type: 'next', now: timestamp });
    else perform({ type: session.status === 'paused' ? 'resume' : 'pause', now: timestamp });
  }

  return <WoodPanel style={[styles.panel, { width: width * 0.28, maxHeight: height - 72, right, bottom }]}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.details} showsVerticalScrollIndicator={false}>
      <View style={styles.heading}>
        <GardenText style={styles.headingText}>{heading}</GardenText>
        <GardenText style={styles.badge}>{state.quick ? 'Quick play' : 'Focus session'}</GardenText>
      </View>
      <View style={styles.plantRow}>
        <PlantSprite plant={plant} size={36} />
        <View style={styles.plantName}><GardenText style={styles.name}>{plant.name}</GardenText>
          <GardenText style={styles.small}>{plant.rarity}</GardenText></View>
        <GardenText accessibilityRole="timer" accessibilityLabel="Growing time remaining" style={styles.clock}>
          {ready ? '✓' : formatClock(remaining)}
        </GardenText>
      </View>
      <GardenText style={styles.small}>{durationLabel(plant)}</GardenText>
      {session && plant.minutes.length > 1 && <View style={styles.phases}>
        {plant.minutes.map((minutes, index) => <GardenText key={index}
          style={[styles.phase, session.phase === index && styles.currentPhase]}>{index === 1 ? 'Break' : 'Focus'} {minutes}m</GardenText>)}
      </View>}
      <ProgressBar value={percent} label="Plant growth" />
      <GardenText style={styles.rewards}>+{plant.coins} coins · +{plant.xp} XP</GardenText>
      <GardenText style={styles.note}>{note}</GardenText>
    </ScrollView>
    <View style={styles.actions}>
      {!session && !canPlant ? <GardenButton label="Open seed shed" tone="wood" onPress={() => router.push('/shop')} />
        : <GardenButton label={actionLabel} onPress={primary} />}
      {ready && <GardenButton label="Keep for display" tone="wood" onPress={onKeep} />}
    </View>
  </WoodPanel>;
}

const styles = StyleSheet.create({
  panel: { position: 'absolute', right: 12, bottom: 12, padding: 9, zIndex: 3 },
  scroll: { flexShrink: 1 }, details: { gap: 6, paddingBottom: 7 },
  heading: { paddingBottom: 5, borderBottomWidth: 1, borderColor: '#c99e91', gap: 3 },
  headingText: { fontSize: 14 }, badge: { fontSize: 9, color: palette.muted, alignSelf: 'flex-start', backgroundColor: '#ebcebd', paddingHorizontal: 4 },
  plantRow: { flexDirection: 'row', alignItems: 'center', gap: 3 }, plantName: { flex: 1 },
  name: { fontSize: 13 }, small: { fontSize: 10, color: palette.muted }, clock: { fontSize: 21 },
  rewards: { fontSize: 10, textAlign: 'center', color: palette.muted }, note: { fontSize: 10, color: palette.muted, lineHeight: 14 },
  actions: { gap: 6 }, phases: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  phase: { fontSize: 9, padding: 3, backgroundColor: '#eddbcb', color: palette.muted },
  currentPhase: { backgroundColor: palette.green, color: palette.ink },
});
