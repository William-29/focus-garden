import { memo, useMemo } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { pets, type PetKind, type PlacedPet } from '@/game/garden';
import { createPetNavigation } from '@/game/pet-placement';
import { petDimensions, petWorldScale } from '@/game/pixel-art';
import { petDisplayName } from '@/game/pet-names';
import { useGardenState } from '@/game/garden-provider';
import { useGardenWalker } from '@/hooks/use-garden-walker';
import { PixelPet } from './pixel-sprites';

function RoamingPet({ placed, width, height, onPress, paused }: { placed: PlacedPet; width: number; height: number; onPress: (id: PetKind) => void; paused: boolean }) {
  const { state } = useGardenState();
  const pet = pets.find((item) => item.id === placed.id)!;
  const name = petDisplayName(pet, state.petNames);
  const scale = petWorldScale(pet), dimensions = petDimensions(pet);
  const spriteWidth = dimensions.width * scale, spriteHeight = dimensions.height * scale;
  const map = useMemo(() => createPetNavigation(width, height, state.season, pet),
    [width, height, state.season, pet]);
  const { position, walking, flip, frame, direction } = useGardenWalker({ map,
    spawn: { x: placed.x * width, y: placed.y * height }, speed: pet.species === 'turtle' ? 10 : pet.baby ? 26 : 22, cardinal: true, paused });
  return <Animated.View style={[styles.pet, { left: -spriteWidth / 2, top: -spriteHeight, width: spriteWidth, height: spriteHeight,
    transform: [{ translateX: position.x }, { translateY: position.y }] }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={name + ', stop and name this pet'} onPress={() => onPress(pet.id)}
      style={{ width: spriteWidth, height: Math.max(44, spriteHeight), alignItems: 'center' }}>
      <View pointerEvents="none" style={[styles.shadow, { left: scale * 4, right: scale * 3, bottom: scale * 2 }]} />
      <PixelPet pet={pet} scale={scale} frame={walking ? frame : 0} view={walking && (direction === 'east' || direction === 'west') ? 'side' : 'front'} flip={walking && (direction === 'east' || direction === 'west') && flip} />
    </Pressable>
  </Animated.View>;
}
export const GardenPets = memo(function GardenPets({ width, height, onPress, pausedPet = null }: { width: number; height: number; onPress: (id: PetKind) => void; pausedPet?: PetKind | null }) {
  const { state } = useGardenState();
  return <>{state.roamingPets.map((pet) => <RoamingPet key={pet.id} placed={pet} width={width} height={height} onPress={onPress} paused={pausedPet === pet.id} />)}</>;
});
const styles = StyleSheet.create({
  pet: { position: 'absolute', zIndex: 2 },
  shadow: { position: 'absolute', height: 4, backgroundColor: '#3b765033' },
});
