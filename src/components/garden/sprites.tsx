import { Image, View, type ImageSourcePropType } from 'react-native';

import atlasInfo from '../../../focus-garden-handoff/assets/atlas-info.json';
import type { Category, Plant } from '@/game/garden';

export const gardenBackground = require('../../../focus-garden-handoff/assets/garden-background.png');
const plantSources: Record<Category, ImageSourcePropType> = {
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
  const sources = [gardenBackground, ...Object.values(plantSources),
    require('../../../focus-garden-handoff/assets/plant-sprites.png')];
  await Promise.allSettled(sources.map((source) => Image.prefetch(Image.resolveAssetSource(source).uri)));
}

// Clip an atlas cell; offsets are in scaled pixels rather than CSS backgrounds.
function AtlasCell({ source, width, height, x, y, cellWidth, cellHeight, size }: {
  source: ImageSourcePropType; width: number; height: number; x: number; y: number;
  cellWidth: number; cellHeight: number; size: number;
}) {
  return (
    <View pointerEvents="none" style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image accessible={false} source={source} resizeMode="stretch" fadeDuration={0}
        style={{ position: 'absolute', width: width * size / cellWidth, height: height * size / cellHeight,
          left: -x * size / cellWidth, top: -y * size / cellHeight }} />
    </View>
  );
}

export function PlantSprite({ plant, size = 52 }: { plant: Plant; size?: number }) {
  const grid = plantGrids[plant.category];
  const cellWidth = grid.width / grid.columns, cellHeight = grid.height / grid.rows;
  return <AtlasCell source={plantSources[plant.category]} width={grid.width} height={grid.height}
    cellWidth={cellWidth} cellHeight={cellHeight} x={(plant.sprite % grid.columns) * cellWidth}
    y={Math.floor(plant.sprite / grid.columns) * cellHeight} size={size} />;
}

export function SproutSprite({ size = 32 }: { size?: number }) {
  const grid = atlasInfo['plant-sprites.png'];
  return <AtlasCell source={require('../../../focus-garden-handoff/assets/plant-sprites.png')}
    width={grid.width} height={grid.height} x={0} y={0} cellWidth={362} cellHeight={302} size={size} />;
}
