import type { Pet } from './garden';
import type { Season } from './seasons';
import { createNavigation, isWalkable, type NavigationMap, type Point } from './garden-navigation.ts';
import { petDimensions, petWorldScale } from './pet-art.ts';

// Placement and wandering share the same geometry, so pets stay exactly at
// the chosen safe ground point when the regular garden returns.
export function createPetNavigation(width: number, height: number, season: Season, pet: Pet) {
  const size = petDimensions(pet), scale = petWorldScale(pet);
  return createNavigation(width, height, season, size.width * scale, size.height * scale, { footprintHeight: 10 * scale });
}
export function petPlacementAt(map: NavigationMap, width: number, height: number, point: Point) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || !isWalkable(map, point)) return null;
  return { x: point.x / width, y: point.y / height };
}
