import {
  gardenReducer as baseReducer, initialState as baseInitialState, getLevel,
  type Action as BaseAction, type GardenState as BaseState,
} from '../../focus-garden-handoff/shared/garden.ts';

export { categories, MAX_LEVEL, DISPLAY_SPACES, rarityFor, plants, outfits, getPlant, getOutfit,
  getLevel, unlockedBetween, unlockedAt, phaseDuration, timeLeft, growth, gardenerActivity } from '../../focus-garden-handoff/shared/garden.ts';
export type { Category, PlantId, Rarity, Plant, Outfit, Session, KeptPlant, GardenerActivity } from '../../focus-garden-handoff/shared/garden.ts';

export type ClothingSlot = 'hat' | 'body' | 'pants' | 'face' | 'accessory';
export type Clothing = { id: string; name: string; slot: ClothingSlot; level: number; cost: number; color: string; shade: string; style: string };
export type Look = Record<ClothingSlot, string>;
export const clothingSlots: { id: ClothingSlot; name: string }[] = [
  { id: 'hat', name: 'Hats' }, { id: 'body', name: 'Tops' }, { id: 'pants', name: 'Pants' },
  { id: 'face', name: 'Glasses' }, { id: 'accessory', name: 'Gear' },
];
const piece = (id: string, name: string, slot: ClothingSlot, level: number, cost: number, color: string, shade: string, style = id): Clothing =>
  ({ id, name, slot, level, cost, color, shade, style });
export const clothing: Clothing[] = [
  piece('bare-head', 'No hat', 'hat', 1, 0, '', '', 'none'),
  piece('straw-hat', 'Meadow straw hat', 'hat', 1, 0, '#e8c36c', '#ac753e', 'straw'),
  piece('rain-hat', 'Rain hood', 'hat', 2, 15, '#f6d16d', '#bd8745', 'hood'),
  piece('chef-hat', 'Chef hat', 'hat', 1, 12, '#fff4df', '#b8b6bf', 'chef'),
  piece('sport-cap', 'Team cap', 'hat', 2, 15, '#e87e75', '#ab4c5a', 'cap'),
  piece('wizard-hat', 'Wizard hat', 'hat', 3, 25, '#a28ad4', '#675082', 'wizard'),
  piece('space-helmet', 'Space helmet', 'hat', 4, 30, '#ebeff4', '#9d9bb8', 'helmet'),
  piece('blossom-hat', 'Flower bonnet', 'hat', 6, 25, '#efa3bb', '#b86a96', 'straw'),
  piece('denim-hat', 'Bluebird cap', 'hat', 12, 30, '#8bbccc', '#526f94', 'cap'),
  piece('bee-hat', 'Beekeeper hood', 'hat', 24, 45, '#fff4df', '#c5b8a5', 'helmet'),
  piece('star-hat', 'Starlight hat', 'hat', 36, 55, '#9685ce', '#534373', 'wizard'),
  piece('garden-top', 'Garden overalls', 'body', 1, 0, '#82a36b', '#486c58', 'overalls'),
  piece('chef-top', 'Chef jacket', 'body', 1, 14, '#fff2df', '#beb6b5', 'chef'),
  piece('sport-top', 'Team jersey', 'body', 2, 18, '#ea8175', '#a64b5a', 'jersey'),
  piece('wizard-top', 'Wizard tunic', 'body', 3, 25, '#a28ad4', '#675082', 'wizard'),
  piece('space-top', 'Space suit', 'body', 4, 30, '#edf1f0', '#98a5b5', 'space'),
  piece('rain-top', 'Raincoat', 'body', 2, 20, '#f6d16d', '#bd8745', 'coat'),
  piece('blossom-top', 'Blossom blouse', 'body', 6, 30, '#efa3bb', '#b86a96', 'overalls'),
  piece('denim-top', 'Denim overalls', 'body', 12, 40, '#8bbccc', '#526f94', 'overalls'),
  piece('bee-top', 'Beekeeper jacket', 'body', 24, 60, '#fff4df', '#c5b8a5', 'space'),
  piece('star-top', 'Starlight tunic', 'body', 36, 70, '#9685ce', '#534373', 'wizard'),
  piece('garden-pants', 'Meadow pants', 'pants', 1, 0, '#68885b', '#45614c', 'pants'),
  piece('chef-pants', 'Chef trousers', 'pants', 1, 10, '#747087', '#4d475d', 'pants'),
  piece('sport-shorts', 'Athlete shorts', 'pants', 2, 12, '#f0dfb3', '#b7a688', 'shorts'),
  piece('wizard-pants', 'Wizard trousers', 'pants', 3, 18, '#8b72b7', '#59486f', 'pants'),
  piece('space-pants', 'Astronaut pants', 'pants', 4, 22, '#e7ebed', '#8c9dad', 'space'),
  piece('rain-pants', 'Rain boots & pants', 'pants', 2, 14, '#d9b75f', '#8a7545', 'pants'),
  piece('blossom-pants', 'Blossom pants', 'pants', 6, 20, '#d98cad', '#935e84', 'pants'),
  piece('denim-pants', 'Bluebird jeans', 'pants', 12, 25, '#78a3bd', '#4d6487', 'pants'),
  piece('bee-pants', 'Beekeeper pants', 'pants', 24, 35, '#e9e1cb', '#a9a391', 'space'),
  piece('star-pants', 'Starlight trousers', 'pants', 36, 45, '#7869ac', '#4a3d6f', 'pants'),
  piece('bare-face', 'No glasses', 'face', 1, 0, '', '', 'none'),
  piece('round-glasses', 'Round glasses', 'face', 1, 8, '#635677', '#403b55', 'glasses'),
  piece('sun-glasses', 'Sunglasses', 'face', 2, 12, '#4c536f', '#30394f', 'sunglasses'),
  piece('sport-goggles', 'Sports goggles', 'face', 3, 16, '#78c4c5', '#437482', 'goggles'),
  piece('empty-hand', 'Empty hands', 'accessory', 1, 0, '', '', 'none'),
  piece('watering-can', 'Watering can', 'accessory', 1, 0, '#8abdb8', '#507a85', 'can'),
  piece('frying-pan', 'Frying pan', 'accessory', 1, 10, '#74778b', '#444456', 'pan'),
  piece('spatula', 'Chef spatula', 'accessory', 1, 8, '#d1d1d3', '#777282', 'spatula'),
  piece('basketball', 'Basketball', 'accessory', 2, 15, '#e79a55', '#93563e', 'basketball'),
  piece('football', 'Football', 'accessory', 2, 15, '#fff1d5', '#594c60', 'football'),
  piece('tennis-racket', 'Tennis racket', 'accessory', 3, 20, '#9bc8bc', '#5c8b83', 'racket'),
  piece('wizard-wand', 'Star wand', 'accessory', 3, 18, '#f6d77f', '#ac8250', 'wand'),
  piece('space-pack', 'Explorer backpack', 'accessory', 4, 22, '#cad6df', '#738599', 'pack'),
];
export const defaultLook: Look = { hat: 'straw-hat', body: 'garden-top', pants: 'garden-pants', face: 'bare-face', accessory: 'empty-hand' };
export const outfitLooks: Record<string, Look> = {
  meadow: defaultLook,
  rain: { ...defaultLook, hat: 'rain-hat', body: 'rain-top', pants: 'rain-pants' },
  blossom: { ...defaultLook, hat: 'blossom-hat', body: 'blossom-top', pants: 'blossom-pants' },
  denim: { ...defaultLook, hat: 'denim-hat', body: 'denim-top', pants: 'denim-pants' },
  beekeeper: { ...defaultLook, hat: 'bee-hat', body: 'bee-top', pants: 'bee-pants' },
  starlight: { ...defaultLook, hat: 'star-hat', body: 'star-top', pants: 'star-pants' },
};
export function getClothing(id: string) { return clothing.find((item) => item.id === id); }

export type PetKind = 'cat' | 'dog' | 'bunny' | 'chicken' | 'duck' | 'fox' | 'pig' | 'turtle';
export type Pet = { id: PetKind; name: string; level: number; cost: number; color: string; shade: string; description: string };
export const pets: Pet[] = [
  { id: 'cat', name: 'Marmalade cat', level: 1, cost: 0, color: '#eab074', shade: '#aa7052', description: 'A sunny little companion. Your first pet is free.' },
  { id: 'bunny', name: 'Cloud bunny', level: 2, cost: 20, color: '#fff1dd', shade: '#c6b5bd', description: 'Tiny paws and a love of carrot patches.' },
  { id: 'dog', name: 'Clover puppy', level: 3, cost: 25, color: '#c99c79', shade: '#855a50', description: 'Always happy to wander by your side.' },
  { id: 'chicken', name: 'Daisy hen', level: 4, cost: 30, color: '#fff1d1', shade: '#bfb4a0', description: 'Pitter-patter through the flower beds.' },
  { id: 'duck', name: 'Puddle duck', level: 6, cost: 40, color: '#f4d580', shade: '#b79750', description: 'A cheerful little garden waddler.' },
  { id: 'fox', name: 'Amber fox', level: 9, cost: 55, color: '#e69763', shade: '#a95d45', description: 'A curious guest with a fluffy tail.' },
  { id: 'pig', name: 'Peaches piglet', level: 12, cost: 65, color: '#efb2b9', shade: '#b7778e', description: 'Small trotters, big garden adventures.' },
  { id: 'turtle', name: 'Moss turtle', level: 18, cost: 80, color: '#92af72', shade: '#577656', description: 'Takes every focus session at a gentle pace.' },
];
export const MAX_ROAMING_PETS = 5;
export type PlacedPet = { id: PetKind; x: number; y: number };
export type GardenState = BaseState & { look: Look; ownedClothing: string[]; ownedPets: PetKind[]; roamingPets: PlacedPet[] };
export type Action = BaseAction | { type: 'buyClothing'; id: string } | { type: 'equipClothing'; id: string }
  | { type: 'adoptPet'; id: PetKind } | { type: 'storePet'; id: PetKind } | { type: 'placePet'; id: PetKind; x: number; y: number };

export function initialState(): GardenState {
  return { ...baseInitialState(), look: { ...defaultLook },
    ownedClothing: clothing.filter((item) => item.cost === 0).map((item) => item.id), ownedPets: [], roamingPets: [] };
}

export function gardenReducer(state: GardenState, action: Action): GardenState {
  if (action.type === 'buyClothing' || action.type === 'equipClothing') {
    const item = getClothing(action.id);
    if (!item) return state;
    const owned = state.ownedClothing.includes(item.id);
    if (action.type === 'buyClothing' && (owned || getLevel(state.xp) < item.level || state.coins < item.cost)) return state;
    if (action.type === 'equipClothing' && (!owned || state.look[item.slot] === item.id)) return state;
    return { ...state, coins: state.coins - (owned ? 0 : item.cost),
      ownedClothing: owned ? state.ownedClothing : [...state.ownedClothing, item.id],
      look: { ...state.look, [item.slot]: item.id }, message: `${item.name} equipped. Mix it with your other favorites!` };
  }
  if (action.type === 'adoptPet') {
    const pet = pets.find((item) => item.id === action.id);
    if (!pet || state.ownedPets.includes(pet.id) || getLevel(state.xp) < pet.level || state.coins < pet.cost) return state;
    return { ...state, coins: state.coins - pet.cost, ownedPets: [...state.ownedPets, pet.id], message: `${pet.name} adopted! Choose Place in garden to let it roam.` };
  }
  if (action.type === 'placePet') {
    if (!state.ownedPets.includes(action.id) || !Number.isFinite(action.x) || !Number.isFinite(action.y)) return state;
    const alreadyPlaced = state.roamingPets.some((pet) => pet.id === action.id);
    if (!alreadyPlaced && state.roamingPets.length >= MAX_ROAMING_PETS) return state;
    return { ...state, roamingPets: [...state.roamingPets.filter((pet) => pet.id !== action.id),
      { id: action.id, x: Math.max(0.18, Math.min(0.66, action.x)), y: Math.max(0.25, Math.min(0.62, action.y)) }],
      message: `${pets.find((pet) => pet.id === action.id)?.name} is exploring your garden.` };
  }
  if (action.type === 'storePet') {
    if (!state.roamingPets.some((pet) => pet.id === action.id)) return state;
    return { ...state, roamingPets: state.roamingPets.filter((pet) => pet.id !== action.id), message: 'Your pet is resting in the pet cottage. Place it again any time.' };
  }
  if (action.type === 'equipOutfit') {
    const look = outfitLooks[action.id];
    if (!look || !state.ownedOutfits.includes(action.id) || Object.entries(look).every(([slot, id]) => state.look[slot as ClothingSlot] === id)) return state;
    return { ...state, outfit: action.id, look: { ...look },
      ownedClothing: [...new Set([...state.ownedClothing, ...Object.values(look)])], message: 'Outfit set equipped. Each piece can also be worn separately.' };
  }
  const next = baseReducer(state, action) as GardenState;
  if (next !== state && action.type === 'buyOutfit') {
    const look = outfitLooks[next.outfit];
    return { ...next, look: { ...look }, ownedClothing: [...new Set([...state.ownedClothing, ...Object.values(look)])] };
  }
  return next;
}
