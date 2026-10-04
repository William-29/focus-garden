import { StyleSheet, View } from 'react-native';
import type { Plant } from '@/game/garden';
import { GardenText } from './garden-ui';
import { PlantSprite, SproutSprite } from './sprites';

export function GrowingPlot({ width, height, plant, planted, percent, ready, label }: {
  width: number; height: number; plant: Plant; planted: boolean; percent: number; ready: boolean; label: string;
}) {
  const plotWidth = Math.round(width * 0.17), plotHeight = Math.round(height * 0.27);
  const posts = Math.max(4, Math.floor(plotWidth / 22));
  return <View accessible accessibilityLabel={`${plant.name} main plot, ${label}`} pointerEvents="none"
    style={[styles.plot, { left: Math.round(width * 0.43), top: Math.round(height * 0.35), width: plotWidth, height: plotHeight }]}>
    <View style={[styles.soil, ready && styles.ripe]}>
      <View style={styles.rows}>{Array.from({ length: 4 }, (_, index) => <View key={index} style={styles.furrow} />)}</View>
      <View style={styles.crop}>{planted ? percent < 0.3 ? <SproutSprite size={Math.max(22, width * 0.04)} />
        : <PlantSprite plant={plant} size={Math.min(plotHeight - 10, width * (0.075 + percent * 0.045))} />
        : <View style={styles.seedMark}><View style={styles.leaf} /><View style={styles.leafRight} /><View style={styles.stem} /></View>}</View>
    </View>
    {[0, 1].map((side) => <View key={side} style={[styles.fence, side ? { bottom: 0 } : { top: -8 }]}>
      <View style={styles.rail} /><View style={[styles.rail, { top: 12 }]} />
      {Array.from({ length: posts }, (_, index) => <View key={index} style={[styles.post, { left: Math.round(index * (plotWidth - 8) / (posts - 1)) }]}>
        <View style={styles.postCap} /><View style={styles.postHighlight} />
      </View>)}
    </View>)}
    <View style={[styles.sideFence, { left: 0 }]} /><View style={[styles.sideFence, { right: 0 }]} />
    <GardenText style={[styles.label, ready && styles.readyLabel]}>{label}</GardenText>
  </View>;
}

const styles = StyleSheet.create({
  plot: { position: 'absolute' }, soil: { ...StyleSheet.absoluteFill, margin: 6, backgroundColor: '#b98465',
    borderWidth: 3, borderTopColor: '#966552', borderLeftColor: '#966552', borderBottomColor: '#d5ad80', borderRightColor: '#d5ad80' },
  ripe: { borderColor: '#efd38b' }, rows: { ...StyleSheet.absoluteFill, padding: 5, justifyContent: 'space-around' },
  furrow: { height: 5, backgroundColor: '#9e7159', borderBottomWidth: 2, borderColor: '#d4a77a' },
  crop: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  fence: { position: 'absolute', left: 0, right: 0, height: 24 },
  rail: { position: 'absolute', top: 5, left: 0, right: 0, height: 5, backgroundColor: '#efd8b7', borderBottomWidth: 2, borderColor: '#ac7c68' },
  post: { position: 'absolute', top: 3, width: 8, height: 21, backgroundColor: '#f9e5ca', borderWidth: 2, borderColor: '#a47968' },
  postCap: { position: 'absolute', top: -5, left: 0, width: 4, height: 3, backgroundColor: '#f9e5ca' },
  postHighlight: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: '#fff3d7' },
  sideFence: { position: 'absolute', top: 8, bottom: 3, width: 4, backgroundColor: '#efd8b7', borderLeftWidth: 2, borderColor: '#ac7c68' },
  seedMark: { width: 24, height: 24 }, stem: { position: 'absolute', left: 11, top: 8, width: 3, height: 16, backgroundColor: '#719065' },
  leaf: { position: 'absolute', left: 3, top: 7, width: 9, height: 6, backgroundColor: '#9db77c' },
  leafRight: { position: 'absolute', left: 13, top: 3, width: 8, height: 6, backgroundColor: '#9db77c' },
  label: { position: 'absolute', bottom: -17, alignSelf: 'center', backgroundColor: '#936a60', borderWidth: 2,
    borderColor: '#634653', paddingHorizontal: 5, paddingVertical: 2, fontSize: 12, color: '#fff1db' },
  readyLabel: { backgroundColor: '#b3d5a0', color: '#583a49' },
});
