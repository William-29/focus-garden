import { memo, useMemo } from 'react';
import type { Plant } from '@/game/garden';
import { coinArt, plantFallbackArt, sproutArt, seasonArt } from '@/game/pixel-art';
import type { Season } from '@/game/seasons';
import { PixelSprite } from './pixel-sprites';

const goldCoin = coinArt(), seedling = sproutArt(), leafySprout = sproutArt(true);
const seasonIcons = { spring: seasonArt('spring'), summer: seasonArt('summer'), autumn: seasonArt('autumn'), winter: seasonArt('winter') };

export const PixelSeason = memo(function PixelSeason({ season, size = 24 }: { season: Season; size?: number }) {
  return <PixelSprite art={seasonIcons[season]} scale={size / 16} />;
});

export const PixelCoin = memo(function PixelCoin({ size = 32 }: { size?: number }) {
  return <PixelSprite art={goldCoin} scale={size / goldCoin.width} />;
});

export function PixelSprout({ size = 32, leafy = false }: { size?: number; leafy?: boolean }) {
  return <PixelSprite art={leafy ? leafySprout : seedling} scale={size / seedling.width} />;
}

export function PixelPlantFallback({ plant, size, muted = false }: { plant: Plant; size: number; muted?: boolean }) {
  const art = useMemo(() => {
    const source = plantFallbackArt(plant);
    return muted ? { ...source, rects: source.rects.map((pixel) => ({ ...pixel, color: '#93938d' })) } : source;
  }, [plant, muted]);
  return <PixelSprite art={art} scale={size / art.width} />;
}
