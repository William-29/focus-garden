import type { Plant } from './garden';
import type { Season } from './seasons';

import { canvas, type PixelArt } from './pixel-canvas.ts';
export type { PixelArt, PixelRect } from './pixel-canvas.ts';
export { characterArt, studyTableArt, type CharacterPose } from './character-art.ts';

export function coinArt(): PixelArt {
  const { stamp, rect, finish } = canvas(16, 16);
  stamp(1, 1, ['....OOOOOO....', '..OOHHHHHDOO..', '.OHHYYYYYYDDO.', '.OHYYGGGGYYDO.', 'OHYYGYYYYGYYDO', 'OHYYGYHHYGYYDO', 'OHYYGYHHYGYYDO', 'OHYYGYHHYGYYDO', 'ODYYGYHHYGYYDO', 'ODYYGYYYYGYYDO', '.ODYYGGGGYYDO.', '.ODDYYYYYYDDO.', '..OODDDDDDOO..', '....OOOOOO....'],
    { O: '#885038', D: '#c58324', H: '#fff5b2', Y: '#ffd54b', G: '#e8a830' });
  rect(2, 2, 1, 4, '#fff9df'); rect(1, 3, 3, 1, '#fff9df');
  rect(11, 10, 1, 3, '#fff2a0'); rect(10, 11, 3, 1, '#fff2a0');
  return finish();
}

export function sproutArt(leafy = false): PixelArt {
  const { rect, stamp, finish } = canvas(24, 24);
  rect(5, 21, 14, 2, '#74543f55'); rect(11, 9, 3, 13, '#376345');
  stamp(3, 6, ['.GGGG....', 'GHHHHGG..', 'GHHHHHHG.', '.GGHHHHHG', '...GGGGGG'], { G: '#376345', H: '#8acb65' });
  stamp(13, 3, ['....GGGG.', '..GGHHHHG', '.GHHHHHHG', 'GHHHHHGG.', 'GGGGGG...'], { G: '#376345', H: '#b9e77f' });
  rect(12, 10, 1, 10, '#8acb65');
  if (leafy) {
    stamp(2, 13, ['.GGGG....', 'GHHHHGG..', '.GHHHHHG.', '..GGGGGGG'], { G: '#376345', H: '#68b86a' });
    stamp(13, 11, ['...GGGG.', '.GGHHHHG', 'GHHHHHG.', 'GGGGGG..'], { G: '#376345', H: '#96d876' });
  }
  return finish();
}

// These small plants draw without fetching or decoding an image atlas.
export function plantFallbackArt(plant: Plant): PixelArt {
  const { rect, box, stamp, finish } = canvas(24, 24);
  rect(3, 22, 18, 2, '#74543f55'); rect(11, 7, 2, 15, '#376345');
  stamp(3, 11, ['GGGG.....', 'GHHHGG...', '.GHHHHGG.', '..GGGGGGG'], { G: '#376345', H: '#83c363' });
  stamp(13, 9, ['....GGGG', '..GGHHHG', '.GHHHHG.', 'GGGGGG..'], { G: '#376345', H: '#a6d974' });
  if (plant.id === 'carrot') {
    stamp(7, 1, ['..G.G.G..', '..GHGHG..', '...GGG...', '..OOOOO..', '.OYYYYYO.', '.OYYYYYO.', '..OYYYO..', '..OYYYO..', '...OYO...', '...OYO...', '....O....'],
      { G: '#376345', H: '#96d876', O: '#b46634', Y: '#ffb05b' });
  } else if (plant.category === 'Flowers') {
    stamp(4, 1, ['...PPP.PPP...', '..PHHHPHHHP..', '..PHHHPHHHP..', 'PPPHHHHHHHPPP', 'PHHHHGGGHHHHP', 'PHHHHGYYGHHHP', '.PPHHGYYGHPP.', '..PHHHGGHHP..', '..PHHHPHHHP..', '...PPP.PPP...'],
      { P: '#a46a8b', H: ['#fff3d2', '#ffc3d6', '#c5b7ef'][plant.sprite % 3], G: '#b78543', Y: '#ffd76b' });
  } else {
    const color = plant.category === 'Fruits' ? '#ef8c83' : '#b9d86e';
    box(6, 3, 7, 7, color, '#795b54'); box(12, 6, 7, 7, color, '#795b54');
    rect(7, 4, 2, 2, '#fff3bd'); rect(13, 7, 2, 2, '#fff3bd');
  }
  return finish();
}

export { petArt, petDimensions, petWorldScale, type PetView } from './pet-art.ts';

export function seasonArt(season: Season): PixelArt {
  const { stamp, rect, finish } = canvas(16, 16);
  if (season === 'spring') {
    stamp(2, 2, ['...PP..PP...', '..PHHPPHHP..', '..PHHHHHHP..', 'PPPHHHHHHPPP', 'PHHHHYYHHHHP', 'PHHHHYYHHHHP', '.PPHHHHHHPP.', '..PHHHHHHP..', '..PHHPPHHP..', '...PP..PP...'],
      { P: '#b76a8e', H: '#ffcee0', Y: '#edc261' });
  } else if (season === 'winter') {
    rect(7, 1, 2, 14, '#679cba'); rect(1, 7, 14, 2, '#679cba');
    [3, 11].forEach((x) => [3, 11].forEach((y) => rect(x, y, 2, 2, '#94c4d7')));
    rect(7, 6, 2, 4, '#edfaff'); rect(6, 7, 4, 2, '#edfaff');
  } else if (season === 'summer') {
    stamp(3, 3, ['..OOOOOO..', '.OYYYYYYO.', 'OYYHHHHYYO', 'OYHHHHHHYO', 'OYHHHHHHYO', 'OYHHHHHHYO', 'OYYHHHHYYO', '.OYYYYYYO.', '..OOOOOO..'],
      { O: '#c78c47', Y: '#ffd373', H: '#fff0a8' });
    rect(7, 0, 2, 2, '#eeb760'); rect(7, 14, 2, 2, '#eeb760'); rect(0, 7, 2, 2, '#eeb760'); rect(14, 7, 2, 2, '#eeb760');
  } else {
    stamp(2, 1, ['........OO..', '......OOCCO.', '....OOCHHCO.', '..OOCHHCCCO.', '.OCCHHCCCCO.', 'OCCHHCCCCCO.', 'OCHHCCCCCO..', 'OCCHCCCCO...', '.OCCCCOO....', '..OOOO......'],
      { O: '#965947', C: '#d89053', H: '#f5c477' });
    rect(4, 10, 2, 4, '#965947'); rect(3, 13, 2, 2, '#965947');
  }
  return finish();
}
