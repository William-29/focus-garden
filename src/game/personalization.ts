export type GardenNames = { characterName: string; gardenName: string };
export const defaultNames: GardenNames = { characterName: 'Gardener', gardenName: 'Your private garden' };
export const nameLimits = { characterName: 24, gardenName: 32 };

export function normalizeName(value: string, limit: number) {
  return Array.from(value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, limit).join('');
}

export function parseNames(value: string | null): GardenNames | null {
  try {
    const data: unknown = value ? JSON.parse(value) : null;
    if (!data || typeof data !== 'object' || !('characterName' in data) || !('gardenName' in data)
      || typeof data.characterName !== 'string' || typeof data.gardenName !== 'string') return null;
    const characterName = normalizeName(data.characterName, nameLimits.characterName);
    const gardenName = normalizeName(data.gardenName, nameLimits.gardenName);
    return characterName && gardenName ? { characterName, gardenName } : null;
  } catch { return null; }
}
