import { Image } from 'expo-image';
import { useState } from 'react';
import { Image as NativeImage, View } from 'react-native';

import atlasInfo from '../../../focus-garden-handoff/assets/atlas-info.json';
import type { Category, Plant } from '@/game/garden';
import { PixelPlantFallback, PixelSprout } from './pixel-garden-art';
import { centeredPlantPlacement, plantInkBounds } from '@/game/plant-placement';
import type { Season } from '@/game/seasons';

export const gardenBackground = require('../../../focus-garden-handoff/assets/garden-background.png');
export const loadingCottage = require('../../../assets/images/loading-cottage.png');
export const seasonalBackgrounds: Record<Season, number> = {
  spring: gardenBackground,
  summer: require('../../../assets/images/seasons/summer.png'),
  autumn: require('../../../assets/images/seasons/autumn.png'),
  winter: require('../../../assets/images/seasons/winter.png'),
};
const plantSources: Record<Category, number> = {
  Flowers: require('../../../focus-garden-handoff/assets/flowers.png'),
  Fruits: require('../../../focus-garden-handoff/assets/fruits.png'),
  Vegetables: require('../../../focus-garden-handoff/assets/vegetables.png'),
};
const plantGrids = {
  Flowers: atlasInfo['flowers.png'], Fruits: atlasInfo['fruits.png'], Vegetables: atlasInfo['vegetables.png'],
};

export async function preloadGardenArt() {
  // In Expo Go, bundled assets arrive from Metro on first use. Warm every atlas
  // so an unlock celebration can show its new seed immediately.
  await Promise.allSettled([
    Image.prefetch(NativeImage.resolveAssetSource(loadingCottage).uri, 'memory-disk'),
    Image.prefetch(Object.values(seasonalBackgrounds).map((source) => NativeImage.resolveAssetSource(source).uri), 'memory-disk'),
    Image.prefetch(Object.values(plantSources).map((source) => NativeImage.resolveAssetSource(source).uri), 'memory-disk'),
  ]);
}

// Clip an atlas cell; offsets are in scaled pixels rather than CSS backgrounds.
function AtlasCell({ source, width, height, x, y, cellWidth, cellHeight, size, plant, centered, muted }: {
  source: number; width: number; height: number; x: number; y: number;
  cellWidth: number; cellHeight: number; size: number; plant: Plant; centered: boolean; muted: boolean;
}) {
  const [displayed, setDisplayed] = useState(false);
  const placement = centered ? centeredPlantPlacement(size, plantInkBounds[plant.category][plant.sprite]) : null;
  const scaleX = placement?.scale ?? size / cellWidth, scaleY = placement?.scale ?? size / cellHeight;
  return (
    <View pointerEvents="none" style={{ width: size, height: size, overflow: 'hidden' }}>
      {!displayed && <PixelPlantFallback plant={plant} size={size} muted={muted} />}
      <View style={{ position: 'absolute', overflow: 'hidden', width: cellWidth * scaleX, height: cellHeight * scaleY,
        left: placement?.left ?? 0, top: placement?.top ?? 0 }}>
      <Image accessible={false} source={source} tintColor={muted ? '#93938d' : undefined} contentFit="fill" transition={0} cachePolicy="memory-disk"
        onDisplay={() => setDisplayed(true)} onError={() => setDisplayed(false)}
        style={{ position: 'absolute', width: width * scaleX, height: height * scaleY,
          left: -x * scaleX, top: -y * scaleY }} />
      </View>
    </View>
  );
}

export function PlantSprite({ plant, size = 52, centered = false, muted = false }: { plant: Plant; size?: number; centered?: boolean; muted?: boolean }) {
  const grid = plantGrids[plant.category];
  const column = plant.sprite % grid.columns, row = Math.floor(plant.sprite / grid.columns);
  const x = Math.round(column * grid.width / grid.columns), y = Math.round(row * grid.height / grid.rows);
  const cellWidth = Math.round((column + 1) * grid.width / grid.columns) - x, cellHeight = Math.round((row + 1) * grid.height / grid.rows) - y;
  return <AtlasCell key={plant.id} plant={plant} source={plantSources[plant.category]} width={grid.width} height={grid.height}
    cellWidth={cellWidth} cellHeight={cellHeight} x={x} y={y} size={size} centered={centered} muted={muted} />;
}

export function SproutSprite({ size = 32, leafy = false }: { size?: number; leafy?: boolean }) {
  return <PixelSprout size={size} leafy={leafy} />;
}
