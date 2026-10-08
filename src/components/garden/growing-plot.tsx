import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { Plant } from '@/game/garden';
import type { Season } from '@/game/seasons';
import { growingGeometry } from '@/game/garden-navigation';
import { GardenText } from './garden-ui';
import { GrowthWheel } from './growth-wheel';
import { PlantSprite, SproutSprite } from './sprites';

export function GrowingPlot({ season, width, height, plant, planted, percent, remaining, ready, label, active = false, harvesting = false, onOpenSeeds, onHarvest }: {
  season: Season;
  width: number; height: number; plant: Plant; planted: boolean; percent: number; remaining: number; ready: boolean; label: string; active?: boolean; harvesting?: boolean; onOpenSeeds: () => void; onHarvest: () => void;
}) {
  const geometry = growingGeometry(width, height, season);
  const plotWidth = geometry.width, plotHeight = geometry.height;
  const posts = Math.max(4, Math.floor(plotWidth / 22));
  const winter = season === 'winter';
  return <Pressable accessible accessibilityRole={planted && !ready ? 'image' : 'button'}
    accessibilityLabel={ready ? `Harvest ripe ${plant.name}` : planted ? `${plant.name} ${winter ? 'winter greenhouse' : 'main plot'}, ${label}` : `Empty ${winter ? 'winter greenhouse' : 'main growing plot'}, choose a crop to plant`}
    disabled={harvesting || (planted && !ready)} onPress={ready ? onHarvest : onOpenSeeds}
    style={[styles.plot, geometry]}>
    <View pointerEvents="none" style={styles.plotShadow} />
    <View pointerEvents="none" style={styles.bedFrame}>
      {[0, 1].map((side) => <View key={side} style={[styles.timberGrain, side ? { right: 3 } : { left: 3 }]} />)}
      {[0, 1].map((side) => <View key={side} style={[styles.cornerStone, side ? { right: -3 } : { left: -3 }]}><View style={styles.stoneGlint} /></View>)}
    </View>
    {winter && <View pointerEvents="none" style={styles.houseBack} />}
    <View style={[styles.soil, ready && styles.ripe]}>
      <View style={styles.rows}>{Array.from({ length: 4 }, (_, index) => <View key={index} style={styles.furrow} />)}</View>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: 18 }, (_, index) => <View key={index} style={[styles.soilCrumb, {
          left: `${8 + index * 29 % 82}%`, top: `${7 + index * 23 % 86}%`,
          width: index % 3 ? 2 : 3, backgroundColor: index % 2 ? '#d7aa79' : '#865b48',
        }]} />)}
      </View>
      <View style={styles.crop}>{planted ? <GrowingCrop key={plant.id} plant={plant} percent={ready ? 1 : percent}
        size={Math.min(plotHeight - 22, width * 0.11)} active={active} />
        : <View style={styles.seedMark}><View style={styles.leaf} /><View style={styles.leafRight} /><View style={styles.stem} /></View>}</View>
    </View>
    {!winter && [0, 1].map((side) => <View key={side} style={[styles.fence, { zIndex: side ? 3 : 1 }, side ? { bottom: 0 } : { top: -8 }]}>
      <View style={styles.rail} /><View style={[styles.rail, { top: 12 }]} />
      {Array.from({ length: posts }, (_, index) => <View key={index} style={[styles.post, { left: Math.round(index * (plotWidth - 8) / (posts - 1)) }]}>
        <View style={styles.postCap} /><View style={styles.postHighlight} />
        <View style={styles.fenceNail} /><View style={[styles.fenceNail, { top: 12 }]} />
      </View>)}
    </View>)}
    {winter ? <WinterGreenhouse /> : <><View style={[styles.sideFence, { left: 0 }]} /><View style={[styles.sideFence, { right: 0 }]} /></>}
    {!winter && <View pointerEvents="none" style={styles.bedFlowers}>
      <View style={styles.flowerStem} /><View style={styles.flowerLeaf} />
      <View style={[styles.flowerPetals, { backgroundColor: season === 'autumn' ? '#ecbb68' : '#ffcedc' }]}><View style={styles.flowerCenter} /></View>
    </View>}
    {planted && <View pointerEvents="none" style={[styles.growthWheel, { left: plotWidth / 2 - 27 }, winter && { top: -61 }]}><GrowthWheel progress={percent} remaining={remaining} ready={ready} /></View>}
    <GardenText style={[styles.label, winter && styles.winterLabel, ready && styles.readyLabel]}>{label}</GardenText>
  </Pressable>;
}

function WinterGreenhouse() {
  return <View pointerEvents="none" style={styles.houseFrame}>
    <View style={styles.houseRoof}>
      {[0, 1, 2, 3].map((step) => <View key={step} style={[styles.roofStep, {
        left: `${step * 10}%`, right: `${step * 10}%`, top: -step * 5, height: 10,
      }]} />)}
      {[0.24, 0.5, 0.76].map((left) => <View key={left} style={[styles.roofBar, { left: `${left * 100}%` }]} />)}
      <View style={styles.roofEave} />
    </View>
    <View style={styles.houseGlass} />
    {[0, 1].map((side) => <View key={side} style={[styles.housePillar, side ? { right: 0 } : { left: 0 }]} />)}
    <View style={[styles.glassGlint, { left: 10, top: 12 }]} /><View style={[styles.glassGlint, { right: 12, top: 24 }]} />
    <View style={styles.houseVent}><View style={styles.ventSlat} /><View style={[styles.ventSlat, { top: 4 }]} /></View>
    <View style={styles.houseDoor}><View style={styles.doorHandle} /></View>
    <View style={styles.houseSill} /><View style={styles.sillSnow} />
  </View>;
}

function GrowingCrop({ plant, percent, size, active }: { plant: Plant; percent: number; size: number; active: boolean }) {
  const [scale] = useState(() => new Animated.Value(0.65 + percent * 0.35));
  const [sway] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.timing(scale, { toValue: 0.65 + percent * 0.35, duration: 240, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [percent, scale]);
  useEffect(() => {
    sway.setValue(0);
    if (!active) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: -2, duration: 1000, useNativeDriver: true }),
      Animated.timing(sway, { toValue: 2, duration: 1000, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [active, sway]);
  return <Animated.View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center',
    transform: [{ scale }, { rotate: sway.interpolate({ inputRange: [-2, 2], outputRange: ['-2deg', '2deg'] }) }] }}>
    {percent < 0.35 ? <SproutSprite size={size * 0.75} leafy={percent >= 0.15} /> : <PlantSprite plant={plant} size={size} centered />}
  </Animated.View>;
}

const styles = StyleSheet.create({
  plotShadow: { position: 'absolute', left: 3, right: -5, top: 8, bottom: -5, backgroundColor: '#4c52433d' },
  bedFrame: { ...StyleSheet.absoluteFill, backgroundColor: '#bc9163', borderWidth: 3,
    borderTopColor: '#efd3a2', borderLeftColor: '#d7b27f', borderRightColor: '#775443', borderBottomColor: '#775443' },
  timberGrain: { position: 'absolute', top: 22, bottom: 17, width: 1, backgroundColor: '#8c6449' },
  cornerStone: { position: 'absolute', bottom: -4, width: 8, height: 7, backgroundColor: '#b8b19a', borderWidth: 1, borderColor: '#777965' },
  stoneGlint: { position: 'absolute', top: 1, left: 1, width: 4, height: 1, backgroundColor: '#e6dec0' },
  soilCrumb: { position: 'absolute', height: 2 },
  fenceNail: { position: 'absolute', left: 2, top: 4, width: 1, height: 1, backgroundColor: '#775b52' },
  bedFlowers: { position: 'absolute', left: -6, bottom: 8, width: 11, height: 18, zIndex: 3 },
  flowerStem: { position: 'absolute', left: 5, top: 6, width: 2, height: 12, backgroundColor: '#547b50' },
  flowerLeaf: { position: 'absolute', left: 1, top: 12, width: 5, height: 3, backgroundColor: '#8fba69' },
  flowerPetals: { position: 'absolute', left: 1, top: 2, width: 10, height: 6, borderWidth: 1, borderColor: '#a87680' },
  flowerCenter: { position: 'absolute', left: 3, top: 1, width: 2, height: 2, backgroundColor: '#ffe199' },
  houseVent: { position: 'absolute', top: 17, right: 7, width: 16, height: 8, borderWidth: 1, borderColor: '#779ca5', backgroundColor: '#d5edeb' },
  ventSlat: { position: 'absolute', top: 1, left: 1, right: 1, height: 1, backgroundColor: '#779ca5' },
  houseDoor: { position: 'absolute', left: '35%', right: '35%', top: '58%', bottom: 7, borderWidth: 2, borderColor: '#86aeb478' },
  doorHandle: { position: 'absolute', right: 2, top: '50%', width: 2, height: 4, backgroundColor: '#e9c37e' },
  houseBack: { ...StyleSheet.absoluteFill, top: -8, bottom: -4, left: -5, right: -5,
    backgroundColor: '#b5e3e4', borderWidth: 3, borderColor: '#4e737c' },
  houseFrame: { ...StyleSheet.absoluteFill, top: -8, bottom: -4, left: -5, right: -5, zIndex: 3 },
  houseRoof: { position: 'absolute', top: 0, left: -4, right: -4, height: 12 },
  roofStep: { position: 'absolute', backgroundColor: '#c1e2e8', borderWidth: 2, borderTopColor: '#fffdf7', borderBottomColor: '#9cbcc7', borderLeftColor: '#52717d', borderRightColor: '#52717d' },
  roofBar: { position: 'absolute', top: -10, height: 22, width: 3, backgroundColor: '#779daa' },
  roofEave: { position: 'absolute', left: -2, right: -2, top: 8, height: 7, backgroundColor: '#fffdf7', borderBottomWidth: 2, borderColor: '#7299ac' },
  houseGlass: { ...StyleSheet.absoluteFill, top: 16, bottom: 8, backgroundColor: '#dcfaff16', borderWidth: 2, borderColor: '#bddde0' },
  housePillar: { position: 'absolute', top: 12, bottom: 0, width: 5, backgroundColor: '#779ca5', borderLeftWidth: 2, borderColor: '#d6eef0' },
  glassGlint: { position: 'absolute', width: 3, height: 15, backgroundColor: '#ecffffbd', transform: [{ rotate: '25deg' }] },
  houseSill: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 8, backgroundColor: '#79969f', borderWidth: 2, borderColor: '#4e737c' },
  sillSnow: { position: 'absolute', left: -2, right: -2, bottom: -2, height: 4, backgroundColor: '#f6fcff', borderBottomWidth: 1, borderColor: '#96b9cc' },
  growthWheel: { position: 'absolute', top: -47, zIndex: 5 },
  plot: { position: 'absolute' }, soil: { ...StyleSheet.absoluteFill, margin: 6, backgroundColor: '#b98465',
    borderWidth: 3, borderTopColor: '#966552', borderLeftColor: '#966552', borderBottomColor: '#d5ad80', borderRightColor: '#d5ad80' },
  ripe: { borderColor: '#efd38b' }, rows: { ...StyleSheet.absoluteFill, padding: 5, justifyContent: 'space-around' },
  furrow: { height: 7, backgroundColor: '#92634f', borderTopWidth: 1, borderTopColor: '#805744', borderBottomWidth: 2, borderBottomColor: '#d4a77a' },
  crop: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
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
  winterLabel: { bottom: -23, zIndex: 4 },
});
