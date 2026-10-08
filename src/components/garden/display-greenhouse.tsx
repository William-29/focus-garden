import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { getPlant, type GardenState, type Plant } from '@/game/garden';
import { displayGeometry } from '@/game/garden-navigation';
import { GardenText } from './garden-ui';
import { PlantSprite } from './sprites';

export function GreenhouseBay({ plant, index, width = 64, height = 64, selected, onPress }: {
  plant: Plant | null; index: number; width?: number; height?: number; selected?: boolean; onPress: () => void;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected }}
    accessibilityLabel={`Greenhouse display ${index + 1}, ${plant?.name ?? 'empty'}`}
    onPress={onPress} style={({ pressed }) => [styles.bay, { width, height }, (selected || pressed) && styles.selected]}>
    <View pointerEvents="none" style={styles.windowBeam} /><View pointerEvents="none" style={styles.glint} />
    <View pointerEvents="none" style={styles.shelf} />
    {plant ? <PlantSprite plant={plant} size={Math.min(width - 4, height - 8)} /> :
      <View pointerEvents="none" style={styles.pot}><View style={styles.potRim} /><View style={styles.potShine} /></View>}
    <GardenText style={styles.number}>{index + 1}</GardenText>
  </Pressable>;
}

export const DisplayGreenhouse = memo(function DisplayGreenhouse({ width, height, state, onSelect }: {
  width: number; height: number; state: GardenState; onSelect: (slot: number) => void;
}) {
  const { width: houseWidth, bayHeight, left, top } = displayGeometry(width, height);
  const bayWidth = Math.max(44, (houseWidth - 8) / state.displaySlots.length);
  return <View style={[styles.house, { left, top, width: houseWidth }]}>
    <View pointerEvents="none" style={styles.roof}><View style={styles.ridge} />
      {Array.from({ length: 8 }, (_, index) => <View key={index} style={[styles.roofBeam, { left: `${index * 12.5 + 6}%` }]} />)}
    </View>
    {state.season === 'winter' && <View pointerEvents="none" style={styles.snowCap} />}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.glass}>
      {state.displaySlots.map((id, index) => {
        const kept = state.keptPlants.find((item) => item.id === id);
        return <GreenhouseBay key={index} plant={kept ? getPlant(kept.plantId) : null} index={index}
          width={bayWidth} height={bayHeight} onPress={() => onSelect(index)} />;
      })}
    </ScrollView>
    <View pointerEvents="none" style={styles.foundation} />
  </View>;
});

const styles = StyleSheet.create({
  snowCap: { position: 'absolute', top: -3, left: 2, right: 2, height: 5, backgroundColor: '#fffdf7', borderBottomWidth: 2, borderColor: '#93b4c8', zIndex: 1 },
  house: { position: 'absolute' },
  roof: { height: 10, marginHorizontal: 4, backgroundColor: '#d5f3e5c9', borderWidth: 2, borderColor: '#527968' },
  ridge: { position: 'absolute', left: 4, right: 4, top: -5, height: 3, backgroundColor: '#eef4d7', borderTopWidth: 1, borderColor: '#527968' },
  roofBeam: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#7eaa91' },
  glass: { borderWidth: 4, borderTopWidth: 2, borderBottomWidth: 0, borderColor: '#527968', backgroundColor: '#d5f3e5b8' },
  bay: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRightWidth: 2,
    borderColor: '#6d927c', backgroundColor: '#d5f3e577', paddingBottom: 4 },
  selected: { backgroundColor: '#fff3bdce' },
  windowBeam: { position: 'absolute', top: '35%', left: 0, right: 0, height: 2, backgroundColor: '#94bca08c' },
  glint: { position: 'absolute', left: 4, top: 3, width: 6, height: 2, backgroundColor: '#f3fff0' },
  shelf: { position: 'absolute', left: 0, right: 0, bottom: 3, height: 6, backgroundColor: '#d6ab79', borderTopWidth: 2, borderColor: '#946d51' },
  pot: { width: 14, height: 13, marginTop: 12, backgroundColor: '#c48c65', borderWidth: 2, borderColor: '#8b604d' },
  potRim: { position: 'absolute', top: -4, left: -3, width: 16, height: 4, backgroundColor: '#e0b083', borderWidth: 1, borderColor: '#8b604d' },
  potShine: { position: 'absolute', top: 1, left: 1, width: 2, height: 6, backgroundColor: '#f0c291' },
  number: { position: 'absolute', bottom: 0, right: 2, fontSize: 12, color: '#4a6150', backgroundColor: '#f1e6c8' },
  foundation: { height: 4, backgroundColor: '#9b7358', borderBottomWidth: 2, borderColor: '#5a664d' },
});
