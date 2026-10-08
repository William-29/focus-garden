import {
  gardenReducer as baseReducer, initialState as baseInitialState, getLevel, plants,
  type Action as BaseAction, type GardenState as BaseState,
} from '../../focus-garden-handoff/shared/garden.ts';
import { defaultNames, nameLimits, normalizeName, type GardenNames } from './personalization.ts';
import { isSeason, type Season } from './seasons.ts';
import { isFarmerStyle, type FarmerStyle } from './farmer.ts';
import { normalizePetName, petDisplayName, sanitizePetNames, type PetNames } from './pet-names.ts';

export { categories, MAX_LEVEL, DISPLAY_SPACES, rarityFor, plants, outfits, getPlant, getOutfit,
  getLevel, unlockedBetween, unlockedAt, phaseDuration, timeLeft, growth, gardenerActivity } from '../../focus-garden-handoff/shared/garden.ts';
export type { Category, PlantId, Rarity, Plant, Outfit, Session, KeptPlant, GardenerActivity } from '../../focus-garden-handoff/shared/garden.ts';

export type ClothingSlot = 'hat' | 'hair' | 'hairColor' | 'body' | 'pants' | 'face' | 'mask' | 'beard' | 'accessory';
export type Clothing = { id: string; name: string; slot: ClothingSlot; level: number; cost: number; color: string; shade: string; style: string; highlight?: string };
export type Look = Record<ClothingSlot, string>;
export const clothingSlots: { id: ClothingSlot; name: string }[] = [
  { id: 'hat', name: 'Hats' }, { id: 'hair', name: 'Hair' }, { id: 'hairColor', name: 'Hair color' },
  { id: 'body', name: 'Tops' }, { id: 'pants', name: 'Bottoms' },
  { id: 'face', name: 'Glasses' }, { id: 'mask', name: 'Masks' }, { id: 'beard', name: 'Beards' }, { id: 'accessory', name: 'Gear' },
];
const piece = (id: string, name: string, slot: ClothingSlot, level: number, cost: number, color: string, shade: string, style = id): Clothing =>
  ({ id, name, slot, level, cost, color, shade, style });
const dye = (id: string, name: string, color: string, shade: string, highlight: string): Clothing =>
  ({ ...piece(id, name, 'hairColor', 1, 0, color, shade, 'dye'), highlight });
export const clothing: Clothing[] = [
  piece('starter-hair', 'Meadow hair', 'hair', 1, 0, '', '', 'starter'),
  piece('hair-crop', 'Tousled crop', 'hair', 1, 0, '', '', 'crop'),
  piece('hair-bob', 'Soft bob', 'hair', 1, 0, '', '', 'bob'),
  piece('hair-long', 'Long waves', 'hair', 1, 0, '', '', 'long'),
  piece('hair-pony', 'High ponytail', 'hair', 1, 0, '', '', 'pony'),
  piece('hair-braids', 'Twin braids', 'hair', 1, 0, '', '', 'braids'),
  piece('hair-curls', 'Cloud curls', 'hair', 1, 0, '', '', 'curls'),
  piece('hair-bald', 'Shaved head', 'hair', 1, 0, '', '', 'none'),
  dye('hair-chestnut', 'Chestnut', '#90563f', '#51364a', '#c58b62'),
  dye('hair-midnight', 'Midnight', '#3e4c6b', '#252b46', '#7687a1'),
  dye('hair-honey', 'Honey blond', '#dfb964', '#917046', '#ffe3a0'),
  dye('hair-copper', 'Copper', '#c57045', '#743c3c', '#f4ad70'),
  dye('hair-silver', 'Silver', '#c6c8db', '#76758d', '#f1eff3'),
  dye('hair-rose', 'Rose pink', '#d786aa', '#895378', '#f5bdcb'),
  dye('hair-lilac', 'Lilac', '#a193d1', '#625885', '#d8c8f2'),
  piece('no-mask', 'No mask', 'mask', 1, 0, '', '', 'none'),
  piece('mint-mask', 'Mint face mask', 'mask', 1, 0, '#a5d6ce', '#578e94', 'cloth'),
  piece('rose-mask', 'Rose face mask', 'mask', 1, 0, '#edafbc', '#ae708f', 'cloth'),
  piece('trail-bandana', 'Trail bandana', 'mask', 2, 10, '#d97b63', '#934957', 'bandana'),
  piece('no-beard', 'Clean shaven', 'beard', 1, 0, '', '', 'none'),
  piece('short-beard', 'Short beard', 'beard', 1, 0, '', '', 'short'),
  piece('full-beard', 'Full beard', 'beard', 1, 0, '', '', 'full'),
  piece('moustache', 'Curled moustache', 'beard', 1, 0, '', '', 'moustache'),
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
  piece('garden-top', 'Meadow blouse', 'body', 1, 0, '#a6dcec', '#527eac', 'blouse'),
  piece('chef-top', 'Chef jacket', 'body', 1, 14, '#fff2df', '#beb6b5', 'chef'),
  piece('sport-top', 'Team jersey', 'body', 2, 18, '#ea8175', '#a64b5a', 'jersey'),
  piece('wizard-top', 'Wizard tunic', 'body', 3, 25, '#a28ad4', '#675082', 'wizard'),
  piece('space-top', 'Space suit', 'body', 4, 30, '#edf1f0', '#98a5b5', 'space'),
  piece('rain-top', 'Raincoat', 'body', 2, 20, '#f6d16d', '#bd8745', 'coat'),
  piece('blossom-top', 'Blossom blouse', 'body', 6, 30, '#efa3bb', '#b86a96', 'blouse'),
  piece('denim-top', 'Denim overalls', 'body', 12, 40, '#8bbccc', '#526f94', 'overalls'),
  piece('bee-top', 'Beekeeper jacket', 'body', 24, 60, '#fff4df', '#c5b8a5', 'space'),
  piece('star-top', 'Starlight tunic', 'body', 36, 70, '#9685ce', '#534373', 'wizard'),
  piece('garden-pants', 'Denim skirt & boots', 'pants', 1, 0, '#649bc5', '#405a87', 'skirt'),
  piece('garden-trousers', 'Denim trousers & boots', 'pants', 1, 0, '#649bc5', '#405a87', 'pants'),
  piece('chef-pants', 'Chef trousers', 'pants', 1, 10, '#747087', '#4d475d', 'pants'),
  piece('sport-shorts', 'Athlete shorts', 'pants', 2, 12, '#f0dfb3', '#b7a688', 'shorts'),
  piece('wizard-pants', 'Wizard trousers', 'pants', 3, 18, '#8b72b7', '#59486f', 'pants'),
  piece('space-pants', 'Astronaut pants', 'pants', 4, 22, '#e7ebed', '#8c9dad', 'space'),
  piece('rain-pants', 'Rain boots & pants', 'pants', 2, 14, '#d9b75f', '#8a7545', 'pants'),
  piece('blossom-pants', 'Blossom skirt & boots', 'pants', 6, 20, '#d98cad', '#935e84', 'skirt'),
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
export const defaultLook: Look = { hat: 'straw-hat', hair: 'starter-hair', hairColor: 'hair-chestnut',
  body: 'garden-top', pants: 'garden-pants', face: 'bare-face', mask: 'no-mask', beard: 'no-beard', accessory: 'empty-hand' };
export const outfitLooks: Record<string, Look> = {
  meadow: defaultLook,
  rain: { ...defaultLook, hat: 'rain-hat', body: 'rain-top', pants: 'rain-pants' },
  blossom: { ...defaultLook, hat: 'blossom-hat', body: 'blossom-top', pants: 'blossom-pants' },
  denim: { ...defaultLook, hat: 'denim-hat', body: 'denim-top', pants: 'denim-pants' },
  beekeeper: { ...defaultLook, hat: 'bee-hat', body: 'bee-top', pants: 'bee-pants' },
  starlight: { ...defaultLook, hat: 'star-hat', body: 'star-top', pants: 'star-pants' },
};
export function getClothing(id: string) { return clothing.find((item) => item.id === id); }

// An outfit changes clothing; personal hair and facial choices stay yours.
export function outfitWithFeatures(current: Look, outfit: Look): Look {
  return { ...outfit, hair: current.hair ?? defaultLook.hair, hairColor: current.hairColor ?? defaultLook.hairColor,
    beard: current.beard ?? defaultLook.beard, mask: current.mask ?? defaultLook.mask };
}

export type PetSpecies = 'cat' | 'dog' | 'bunny' | 'chicken' | 'duck' | 'fox' | 'pig' | 'turtle';
export type PetKind = PetSpecies | 'puppy' | 'kitten' | 'baby-bunny' | 'chick' | 'duckling' | 'fox-kit' | 'piglet' | 'hatchling';
export type Pet = { id: PetKind; species: PetSpecies; baby?: boolean; name: string; level: number; cost: number; color: string; shade: string; description: string };
export const pets: Pet[] = [
  { id: 'dog', species: 'dog', name: 'Clover dog', level: 1, cost: 0, color: '#d4a172', shade: '#916348', description: 'A loyal grown-up dog. Your first companion is free.' },
  { id: 'cat', species: 'cat', name: 'Marmalade cat', level: 2, cost: 20, color: '#eab074', shade: '#aa7052', description: 'A sunny companion with a striped tail.' },
  { id: 'bunny', species: 'bunny', name: 'Cloud bunny', level: 3, cost: 25, color: '#fff1dd', shade: '#c6b5bd', description: 'Long ears and a love of carrot patches.' },
  { id: 'chicken', species: 'chicken', name: 'Daisy hen', level: 4, cost: 30, color: '#fff2dd', shade: '#bfb4a0', description: 'A round little hen with a bright red comb.' },
  { id: 'duck', species: 'duck', name: 'Puddle duck', level: 6, cost: 40, color: '#f7edd1', shade: '#c0b6a0', description: 'Orange feet and a cheerful garden waddle.' },
  { id: 'fox', species: 'fox', name: 'Amber fox', level: 9, cost: 55, color: '#e69763', shade: '#a95d45', description: 'A curious guest with a white-tipped tail.' },
  { id: 'puppy', species: 'dog', baby: true, name: 'Clover puppy', level: 10, cost: 50, color: '#e8bb8c', shade: '#a47655', description: 'Floppy ears, tiny paws, endless curiosity.' },
  { id: 'kitten', species: 'cat', baby: true, name: 'Marmalade kitten', level: 12, cost: 55, color: '#f2bf89', shade: '#b68260', description: 'A pocket-sized ball of purrs.' },
  { id: 'pig', species: 'pig', name: 'Peaches pig', level: 14, cost: 65, color: '#efb2b9', shade: '#b7778e', description: 'A rosy snout and a curly little tail.' },
  { id: 'baby-bunny', species: 'bunny', baby: true, name: 'Cloud baby bunny', level: 16, cost: 60, color: '#fff4e8', shade: '#cbbcc8', description: 'A tiny cotton tail learning to hop.' },
  { id: 'turtle', species: 'turtle', name: 'Moss turtle', level: 18, cost: 80, color: '#92af72', shade: '#577656', description: 'Takes every focus session at a gentle pace.' },
  { id: 'chick', species: 'chicken', baby: true, name: 'Buttercup chick', level: 20, cost: 65, color: '#ffe59a', shade: '#d7a761', description: 'A fluffy yellow chick with two tiny feet.' },
  { id: 'duckling', species: 'duck', baby: true, name: 'Puddle duckling', level: 23, cost: 70, color: '#ffe99a', shade: '#c9a45c', description: 'A little golden waddler.' },
  { id: 'fox-kit', species: 'fox', baby: true, name: 'Amber fox kit', level: 27, cost: 80, color: '#f0b383', shade: '#b67a55', description: 'Big ears and a miniature fluffy tail.' },
  { id: 'piglet', species: 'pig', baby: true, name: 'Peaches piglet', level: 31, cost: 85, color: '#f7c1c6', shade: '#c68b9c', description: 'Small trotters, big garden adventures.' },
  { id: 'hatchling', species: 'turtle', baby: true, name: 'Moss hatchling', level: 36, cost: 95, color: '#b4cd8d', shade: '#6e945e', description: 'The tiniest shell in the garden.' },
];
export const MAX_ROAMING_PETS = 5;
export type PlacedPet = { id: PetKind; x: number; y: number };
export type GardenState = BaseState & GardenNames & { look: Look; ownedClothing: string[]; ownedPets: PetKind[]; roamingPets: PlacedPet[]; petNames: PetNames; noticeRevision: number; season: Season; farmerStyle: FarmerStyle };
export type Action = BaseAction | { type: 'buyClothing'; id: string } | { type: 'equipClothing'; id: string }
  | { type: 'plantSeed'; id: string; now: number }
  | { type: 'setSeason'; season: Season }
  | { type: 'setFarmer'; farmerStyle: FarmerStyle }
  | ({ type: 'rename' } & GardenNames) | ({ type: 'restoreNames' } & GardenNames)
  | { type: 'renamePet'; id: PetKind; name: string } | { type: 'restorePetNames'; names: PetNames }
  | { type: 'adoptPet'; id: PetKind } | { type: 'storePet'; id: PetKind } | { type: 'placePet'; id: PetKind; x: number; y: number };

export function initialState(): GardenState {
  return { ...baseInitialState(), ...defaultNames, noticeRevision: 0, season: 'spring', farmerStyle: 'girl', look: { ...defaultLook },
    ownedClothing: clothing.filter((item) => item.cost === 0).map((item) => item.id), ownedPets: [], roamingPets: [], petNames: {} };
}

export function gardenReducer(state: GardenState, action: Action): GardenState {
  const next = reduceGarden(state, action);
  // Purchases can repeat the same message. Each successful action gets a fresh
  // notice; clock ticks, seed selection and name hydration stay quiet.
  if (next === state || action.type === 'selectSeed' || action.type === 'mode' || action.type === 'restoreNames' || action.type === 'restorePetNames' || action.type === 'setSeason' || action.type === 'setFarmer') return next;
  return { ...next, noticeRevision: (state.noticeRevision ?? 0) + 1 };
}

function reduceGarden(state: GardenState, action: Action): GardenState {
  if (action.type === 'plantSeed') {
    const plant = plants.find((crop) => crop.id === action.id);
    if (state.session || !plant || !(state.inventory[plant.id] > 0) || getLevel(state.xp) < plant.unlockLevel
      || !Number.isFinite(action.now)) return state;
    // One action selects and plants, so a delayed/double tap cannot consume a
    // second seed or change the selection underneath an active focus session.
    return baseReducer({ ...state, selectedSeed: plant.id }, { type: 'plant', now: action.now }) as GardenState;
  }
  if (action.type === 'setFarmer') {
    if (!isFarmerStyle(action.farmerStyle) || action.farmerStyle === state.farmerStyle) return state;
    // Match starter bottoms to the new farmer; a customized outfit is preserved.
    const starterBottoms = state.look.pants === 'garden-pants' || state.look.pants === 'garden-trousers';
    return { ...state, farmerStyle: action.farmerStyle, look: starterBottoms
      ? { ...state.look, pants: action.farmerStyle === 'boy' ? 'garden-trousers' : 'garden-pants' } : state.look };
  }
  if (action.type === 'setSeason') return isSeason(action.season) && action.season !== state.season ? { ...state, season: action.season } : state;
  if (action.type === 'rename' || action.type === 'restoreNames') {
    const characterName = normalizeName(action.characterName, nameLimits.characterName);
    const gardenName = normalizeName(action.gardenName, nameLimits.gardenName);
    if (!characterName || !gardenName || (characterName === state.characterName && gardenName === state.gardenName)) return state;
    return { ...state, characterName, gardenName, message: action.type === 'rename' ? 'Garden names updated.' : state.message };
  }
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
  if (action.type === 'renamePet') {
    const pet = pets.find((item) => item.id === action.id), name = normalizePetName(action.name);
    if (!pet || !state.ownedPets.includes(pet.id) || !name || name === petDisplayName(pet, state.petNames)) return state;
    return { ...state, petNames: { ...state.petNames, [pet.id]: name }, message: `Your pet is now called ${name}.` };
  }
  if (action.type === 'restorePetNames') {
    // Local edits win over a delayed device read, including edits to other pets.
    const names = { ...sanitizePetNames(action.names, pets), ...state.petNames };
    if (Object.entries(names).every(([id, name]) => state.petNames[id as PetKind] === name)) return state;
    return { ...state, petNames: names };
  }
  if (action.type === 'adoptPet') {
    const pet = pets.find((item) => item.id === action.id);
    if (!pet || state.ownedPets.includes(pet.id) || getLevel(state.xp) < pet.level || state.coins < pet.cost) return state;
    return { ...state, coins: state.coins - pet.cost, ownedPets: [...state.ownedPets, pet.id], message: `${petDisplayName(pet, state.petNames)} adopted! Choose Place in garden to let it roam.` };
  }
  if (action.type === 'placePet') {
    if (!state.ownedPets.includes(action.id) || !Number.isFinite(action.x) || !Number.isFinite(action.y)
      || action.x < 0 || action.x > 1 || action.y < 0 || action.y > 1) return state;
    const alreadyPlaced = state.roamingPets.some((pet) => pet.id === action.id);
    if (!alreadyPlaced && state.roamingPets.length >= MAX_ROAMING_PETS) return state;
    return { ...state, roamingPets: [...state.roamingPets.filter((pet) => pet.id !== action.id),
      { id: action.id, x: action.x, y: action.y }],
      message: `${petDisplayName(pets.find((pet) => pet.id === action.id)!, state.petNames)} is exploring your garden.` };
  }
  if (action.type === 'storePet') {
    if (!state.roamingPets.some((pet) => pet.id === action.id)) return state;
    return { ...state, roamingPets: state.roamingPets.filter((pet) => pet.id !== action.id), message: 'Your pet is resting in the pet cottage. Place it again any time.' };
  }
  if (action.type === 'equipOutfit') {
    const preset = outfitLooks[action.id];
    if (!preset || !state.ownedOutfits.includes(action.id)) return state;
    const look = outfitWithFeatures(state.look, preset);
    if (Object.entries(look).every(([slot, id]) => state.look[slot as ClothingSlot] === id)) return state;
    return { ...state, outfit: action.id, look: { ...look },
      ownedClothing: [...new Set([...state.ownedClothing, ...Object.values(look)])], message: 'Outfit set equipped. Each piece can also be worn separately.' };
  }
  const next = baseReducer(state, action) as GardenState;
  if (next !== state && action.type === 'buyOutfit') {
    const look = outfitWithFeatures(state.look, outfitLooks[next.outfit]);
    return { ...next, look: { ...look }, ownedClothing: [...new Set([...state.ownedClothing, ...Object.values(look)])] };
  }
  return next;
}
