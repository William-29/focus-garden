import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { defaultLook, getClothing, type Clothing, type ClothingSlot, type Look, type Pet } from '@/game/garden';
import { characterArt, petArt, studyTableArt, type CharacterPose, type PetView, type PixelArt } from '@/game/pixel-art';
import type { FarmerStyle } from '@/game/farmer';

export function PixelSprite({ art, scale, flip = false }: { art: PixelArt; scale: number; flip?: boolean }) {
  return <View pointerEvents="none" style={{ width: art.width * scale, height: art.height * scale, transform: [{ scaleX: flip ? -1 : 1 }] }}>
    {art.rects.map((pixel, index) => <View key={index} style={{ position: 'absolute', left: pixel.x * scale,
      top: pixel.y * scale, width: pixel.width * scale, height: pixel.height * scale, backgroundColor: pixel.color }} />)}
  </View>;
}

export const PixelCharacter = memo(function PixelCharacter({ look, farmerStyle = 'girl', scale = 2, pose = 'idle', frame = 0, flip = false }: {
  look: Look; farmerStyle?: FarmerStyle; scale?: number; pose?: CharacterPose; frame?: number; flip?: boolean;
}) {
  const art = useMemo(() => {
    const items = Object.fromEntries(Object.entries({ ...defaultLook, ...look }).map(([slot, id]) => [slot, getClothing(id)])) as Record<ClothingSlot, Clothing>;
    return characterArt(items, pose, frame, farmerStyle);
  }, [look, pose, frame, farmerStyle]);
  return <PixelSprite art={art} scale={scale} flip={flip} />;
});

export const PixelPet = memo(function PixelPet({ pet, scale = 2, frame = 0, flip = false, view = 'front' }: {
  pet: Pet; scale?: number; frame?: number; flip?: boolean; view?: PetView;
}) {
  const art = useMemo(() => petArt(pet, frame, view), [pet, frame, view]);
  return <PixelSprite art={art} scale={scale} flip={flip} />;
});

const tableArt = studyTableArt();
export function PixelStudyTable({ scale = 2 }: { scale?: number }) {
  return <PixelSprite art={tableArt} scale={scale} />;
}
