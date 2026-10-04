import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { getClothing, type Clothing, type ClothingSlot, type Look, type Pet } from '@/game/garden';
import { characterArt, petArt, type CharacterPose, type PixelArt } from '@/game/pixel-art';

function PixelSprite({ art, scale, flip = false }: { art: PixelArt; scale: number; flip?: boolean }) {
  return <View pointerEvents="none" style={{ width: art.width * scale, height: art.height * scale, transform: [{ scaleX: flip ? -1 : 1 }] }}>
    {art.rects.map((pixel, index) => <View key={index} style={{ position: 'absolute', left: pixel.x * scale,
      top: pixel.y * scale, width: pixel.width * scale, height: pixel.height * scale, backgroundColor: pixel.color }} />)}
  </View>;
}

export const PixelCharacter = memo(function PixelCharacter({ look, scale = 2, pose = 'idle', frame = 0, flip = false }: {
  look: Look; scale?: number; pose?: CharacterPose; frame?: number; flip?: boolean;
}) {
  const art = useMemo(() => {
    const items = Object.fromEntries(Object.entries(look).map(([slot, id]) => [slot, getClothing(id)])) as Record<ClothingSlot, Clothing>;
    return characterArt(items, pose, frame);
  }, [look, pose, frame]);
  return <PixelSprite art={art} scale={scale} flip={flip} />;
});

export const PixelPet = memo(function PixelPet({ pet, scale = 2, frame = 0, flip = false }: {
  pet: Pet; scale?: number; frame?: number; flip?: boolean;
}) {
  const art = useMemo(() => petArt(pet, frame), [pet, frame]);
  return <PixelSprite art={art} scale={scale} flip={flip} />;
});

export function PixelStudyTable({ scale = 2 }: { scale?: number }) {
  return <View pointerEvents="none" style={{ width: 24 * scale, height: 32 * scale }}>
    <View style={{ position: 'absolute', left: 3 * scale, top: 23 * scale, width: 19 * scale, height: 5 * scale,
      backgroundColor: '#c18b63', borderWidth: scale, borderColor: '#503b50' }} />
    {[4, 19].map((left) => <View key={left} style={{ position: 'absolute', left: left * scale, top: 28 * scale,
      width: 2 * scale, height: 3 * scale, backgroundColor: '#503b50' }} />)}
    <View style={{ position: 'absolute', left: 8 * scale, top: 22 * scale, width: 9 * scale, height: 3 * scale,
      backgroundColor: '#fff2d6', borderWidth: scale, borderColor: '#b39786' }} />
  </View>;
}
