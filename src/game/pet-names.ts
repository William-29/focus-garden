import type { Pet, PetKind } from './garden';
import { normalizeName } from './personalization.ts';

export const PET_NAME_LIMIT = 24;
export type PetNames = Partial<Record<PetKind, string>>;
export function normalizePetName(value: unknown) {
  return typeof value === 'string' ? normalizeName(value, PET_NAME_LIMIT) : '';
}
export function petDisplayName(pet: Pick<Pet, 'id' | 'name'>, names: PetNames) {
  return names[pet.id] || pet.name;
}
export function sanitizePetNames(value: unknown, catalog: readonly Pick<Pet, 'id'>[]): PetNames {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: PetNames = {};
  for (const pet of catalog) {
    if (!Object.prototype.hasOwnProperty.call(value, pet.id)) continue;
    const name = normalizePetName((value as Record<string, unknown>)[pet.id]);
    if (name) result[pet.id] = name;
  }
  return result;
}
export function parsePetNames(value: string | null, catalog: readonly Pick<Pet, 'id'>[]): PetNames {
  try { return sanitizePetNames(value ? JSON.parse(value) : null, catalog); }
  catch { return {}; }
}
