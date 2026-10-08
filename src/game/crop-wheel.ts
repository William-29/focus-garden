import { getLevel, plants, type Category, type GardenState } from './garden.ts';

export type CropFilter = 'All' | 'Owned' | Category;
export const cropFilters: CropFilter[] = ['All', 'Owned', 'Flowers', 'Vegetables', 'Fruits'];

// Category views include the whole catalog, even seeds not owned or unlocked.
export function filteredCrops(state: Pick<GardenState, 'inventory'>, filter: CropFilter = 'All') {
  return plants.filter((plant) => filter === 'All' || (filter === 'Owned'
    ? (state.inventory[plant.id] ?? 0) > 0 : plant.category === filter))
    .sort((a, b) => a.unlockLevel - b.unlockLevel);
}

export function canPlantCrop(state: Pick<GardenState, 'xp' | 'inventory'>, id: string) {
  const plant = plants.find((crop) => crop.id === id);
  return !!plant && plant.unlockLevel <= getLevel(state.xp) && (state.inventory[id] ?? 0) > 0;
}

export const wrapCropIndex = (index: number, count: number) => count > 0 ? ((index % count) + count) % count : 0;
export const wheelSector = (count: number) => Math.PI * 2 / Math.max(1, Math.min(8, count));

// Keep icons upright on a rotating ring. Large collections scroll through seven
// positions with a gap at the bottom, so all 45 crops remain reachable and legible.
export function cropWheelEntries(count: number, turn: number) {
  if (count < 1) return [];
  const sector = wheelSector(count), center = Math.round(turn);
  const steps = count <= 8 ? Array.from({ length: count }, (_, index) => index)
    : Array.from({ length: 7 }, (_, index) => center + index - 3);
  return steps.map((step) => ({ index: wrapCropIndex(step, count), angle: (step - turn) * sector - Math.PI / 2 }));
}

export function wheelAngleDelta(previous: number, next: number) {
  // Crossing the atan2 seam is a small turn, never a full revolution.
  return Math.atan2(Math.sin(next - previous), Math.cos(next - previous));
}
