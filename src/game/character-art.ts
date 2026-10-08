import type { Clothing, ClothingSlot } from './garden';
import type { FarmerStyle } from './farmer';
import { canvas, type PixelArt } from './pixel-canvas.ts';
import { CHARACTER_HEIGHT, CHARACTER_WIDTH } from './character-metrics.ts';

export type CharacterPose = 'idle' | 'walk' | 'study' | 'water';
const ink = '#343448', skin = '#f8d4ab', skinShade = '#d9977f', skinLight = '#ffe9c4';
const hatBrim: Record<string, number> = { straw: 15, cap: 14, wizard: 12, chef: 12 };
const lighten = (hex: string) => '#' + [1, 3, 5].map((offset) => {
  const value = parseInt(hex.slice(offset, offset + 2), 16);
  return Math.round(value + (255 - value) * 0.38).toString(16).padStart(2, '0');
}).join('');

// A hat replaces the crown silhouette, rather than merely painting over it.
// Keep locks below brims; enclosed headwear only exposes its face opening and
// the hair hanging below its lower edge.
export function hairVisibleUnderHat(style: string, x: number, y: number) {
  if (style === 'hood' || style === 'helmet') {
    return (y >= 10 && y <= 18 && x >= 10 && x <= 23) || (y >= 20 && x >= 7 && x <= 24);
  }
  if (style === 'none') return true;
  return y >= (hatBrim[style] ?? 0) && (y >= 16 || (x >= 8 && x <= 23));
}

function drawTable(c: ReturnType<typeof canvas>) {
  const { rect, stamp } = c;
  stamp(3, 28, ['.OOOOOOOOOOOOOOOOOOOOOOOO.', 'OHHHHHHHHHHHHHHHHHHHHHHHHO', 'OSCCCCCCCCCCCCCCCCCCCCSSO', '.OOOOOOOOOOOOOOOOOOOOOOOO.'],
    { O: '#63444a', H: '#e8bc82', C: '#b88157', S: '#996248' });
  rect(5, 32, 2, 3, '#63444a'); rect(25, 32, 2, 3, '#63444a');
  rect(6, 32, 1, 2, '#c78e62'); rect(25, 32, 1, 2, '#c78e62');
  stamp(11, 27, ['.OOOOOOOOOO.', 'OPPPPOPPPPPO', 'OPPPPOPPPPPO', '.OOOOOOOOOO.'],
    { O: '#987b70', P: '#fff3d2' });
}

export function studyTableArt(): PixelArt {
  const c = canvas(CHARACTER_WIDTH, CHARACTER_HEIGHT);
  drawTable(c);
  return c.finish();
}

// Shared anchors for every pose and item: crown (16, 9), eyes (12/19, 17),
// shoulders (10/21, 24), hands (9/23, 28), soles (13/20, 34).
export function characterArt(items: Record<ClothingSlot, Clothing>, pose: CharacterPose = 'idle', frame = 0, farmerStyle: FarmerStyle = 'girl'): PixelArt {
  const c = canvas(CHARACTER_WIDTH, CHARACTER_HEIGHT), { rect, stamp, box, finish } = c;
  const { body, pants, hat, face, accessory, beard, mask } = items;
  const hairstyle = items.hair.style === 'starter' ? farmerStyle === 'girl' ? 'long' : 'crop' : items.hair.style;
  const hair = items.hairColor.color, hairShade = items.hairColor.shade, hairLight = items.hairColor.highlight ?? '#ffe3b8';
  const hairColors = { O: ink, C: hair, S: hairShade, H: hairLight, B: '#efad95' };
  const step = pose === 'walk' ? [0, -1, 0, 1][frame % 4] : 0;
  const sway = pose === 'walk' ? frame % 2 : 0;
  const hairRect = (x: number, y: number, width: number, height: number, color: string) => {
    for (let row = y; row < y + height; row++) for (let col = x; col < x + width; col++) {
      if (hairVisibleUnderHat(hat.style, col, row)) rect(col, row, 1, 1, color);
    }
  };
  const hairStamp = (x: number, y: number, rows: string[], colors: Record<string, string> = hairColors) => {
    rows.forEach((row, dy) => [...row].forEach((pixel, dx) => {
      if (colors[pixel]) hairRect(x + dx, y + dy, 1, 1, colors[pixel]);
    }));
  };

  // Back hair is behind the outfit; the bangs and hats are independent layers.
  if (hairstyle === 'long') {
    hairStamp(5, 11, ['..OOOO........OOOO..', '.OCCCCO......OCCCCO.', 'OCHCCSO......OCCSCO', 'OCHCCSO......OCCSCO',
      'OCHCCSO......OCCSCO', 'OCHCCSO......OCCSCO', 'OCHCCSO......OCCSCO', 'OCHCCSO......OCCSCO',
      'OCHCCSO......OCCSCO', 'OCHCCSO......OCCSCO', '.OCCCSO......OCCSO.', '.OCCCSO......OCCSO.',
      '.OCCCSO......OCCSO.', '..OCCSO......OCSO..', '..OCCSO......OCSO..', '...OOO........OOO..'], hairColors);
  } else if (hairstyle === 'pony') {
    hairStamp(23, 8 + sway, ['.OOO...', 'OCSCO..', 'OCCHCO.', 'OCCSSCO', '.OCCSCO', '..OCSCO', '..OCSCO', '..OCSCO', '..OCSCO',
      '.OCCSCO', '.OCCSO.', '..OSO..', '...O...'], hairColors);
    hairRect(23, 12, 3, 2, '#d88498');
  } else if (hairstyle === 'braids') {
    for (const x of [5, 23]) {
      hairStamp(x, 16 + sway, ['.OOO.', 'OCHSO', '.OCCO', 'OCHSO', '.OCCO', 'OCHSO', '.OCCO', 'OCHSO', '.OCCO', '.BBB.', '..O..'], hairColors);
    }
  } else if (hairstyle === 'bob') {
    hairStamp(5, 12, ['.OOOO..........OOOO.', 'OCCSO..........OCSCO', 'OCHSO..........OCSCO', 'OCHSO..........OCSCO',
      'OCHSO..........OCSCO', 'OCHSO..........OCSCO', 'OCHSO..........OCSCO', '.OCSO..........OCSO.', '.OOO............OOO.'], hairColors);
  }
  if (accessory.style === 'pack') {
    stamp(6, 23, ['.OOOO.', 'OCHHCO', 'OCCCCO', 'OCSSCO', 'OCSSCO', 'OCCCCO', '.OOOO.'],
      { O: ink, C: accessory.color, S: accessory.shade, H: '#f2ead9' });
  }

  // Short, separate legs: knees/boots change length and silhouette every step.
  const leg = (x: number, offset: number) => {
    const short = pants.style === 'shorts' || pants.style === 'skirt';
    stamp(x, 29 + offset, ['OOOOO', 'OCCSO', 'OCCSO', 'OBBBO', 'OBHBO', 'OOOOO'],
      { O: ink, C: pants.color, S: pants.shade, B: pants.style === 'space' ? '#d2dbe2' : '#765348', H: pants.style === 'space' ? '#ffffff' : '#ba8962' });
    if (short) { rect(x + 1, 31 + offset, 3, 2, skin); rect(x + 3, 31 + offset, 1, 2, skinShade); }
  };
  leg(10, step); leg(18, -step);
  stamp(10, 22, ['...OOOOOO...', '..OSSSSSSO..', '.OCCCCCCCCO.', 'OCHHCCCCCCSO', 'OCHCCCCCCCSO', 'OCCCCCCCCCSO',
    'OCCCCCCCCCSO', '.OCCCCCCCSO.', '..OOOOOOOO..'], { O: ink, C: body.color, S: body.shade, H: lighten(body.color) });
  rect(14, 22, 4, 2, skinShade); rect(14, 22, 3, 1, skin);
  if (body.style === 'blouse') {
    stamp(12, 24, ['PP....PP', '.PP..PP.', '...SS...', '...SG...', '...SS...'], { P: '#fff1d7', S: body.shade, G: '#f0c469' });
    rect(11, 29, 10, 1, '#eee8cf');
  } else if (body.style === 'overalls') {
    rect(12, 24, 1, 4, body.shade); rect(19, 24, 1, 4, body.shade); rect(13, 26, 6, 3, body.shade);
    rect(12, 25, 1, 1, '#ffdb7c'); rect(19, 25, 1, 1, '#ffdb7c'); rect(15, 27, 3, 1, '#a9d4dc');
  } else if (body.style === 'chef') {
    rect(15, 24, 1, 5, body.shade);
    for (const x of [13, 18]) for (const y of [25, 27]) rect(x, y, 1, 1, ink);
    rect(11, 29, 10, 1, '#d48484');
  } else if (body.style === 'jersey') {
    rect(13, 24, 6, 1, '#fff6df'); stamp(15, 26, ['PPP', '..P', '.P.', '.P.'], { P: '#fff6df' });
  } else if (body.style === 'space') {
    box(13, 25, 6, 4, '#8caebd', body.shade); rect(14, 26, 2, 1, '#d8f2e6'); rect(17, 27, 1, 1, '#ed927b');
  } else if (body.style === 'wizard') {
    rect(15, 24, 2, 5, '#eacc83'); rect(11, 29, 10, 1, '#eacc83'); rect(12, 26, 1, 1, '#ffedb2');
  } else {
    rect(15, 24, 1, 5, body.shade); rect(16, 25, 1, 1, '#fff0b8'); rect(16, 27, 1, 1, '#fff0b8');
  }
  if (pants.style === 'skirt') {
    stamp(9, 29, ['.OCCCCCCCCCCO.', 'OCCCCCCCCCCSSO', '.OOOOOOOOOOOO.'], { O: ink, C: pants.color, S: pants.shade });
    rect(12, 29, 1, 2, '#b7d3e1'); rect(18, 29, 1, 2, pants.shade);
  } else { rect(11, 30, 10, 1, pants.color); rect(15, 30, 2, 2, ink); }

  const arm = (x: number, offset: number, right = false) => {
    stamp(x, 24 + offset, [right ? 'OO..' : '..OO', right ? 'OCSO' : 'OHCO', 'OCCO', '.SS.', '.SH.', '..O.'],
      { O: ink, C: body.color, S: skinShade, H: skin });
  };
  arm(7, -step); arm(21, pose === 'water' ? -1 : step, true);

  // The head is almost two-thirds of the silhouette, with stepped cheeks,
  // asymmetric hair highlights and a small face seen slightly from above.
  hairStamp(5, 4, ['......OOOOOOOOOO......', '....OOCCCCCCCCCCOO....', '...OCCHHHHHHHHCCCCO...', '..OCCHHHHHHHHHHCCCCO..',
    '.OCCHHHHHHHHHHHHCCCCO.', '.OCCHHHHHHHHHHHCCCCCO.', 'OCCHHHHHHHHHHHCCCCCCSO', 'OCCHHHHHHHHHHCCCCCCCSO',
    'OCCHHHHHHHHHCCCCCCCCSO', 'OCCHHHHHHHHCCCCCCCCSSO', 'OCCCCCCCCCCCCCCCCSSSSO', '.OCCCCCCCCCCCCCCSSSSO.',
    '.OCCCCCCCCCCCCC SSSSO.'.replace(' ', ''), '..OCCCCCCCCCCCSSSSO..', '...OCCCCCCCCCSSSSO...', '....OOOOOOOOOOOO.....'],
    hairstyle === 'none' ? { O: ink, C: skin, S: skinShade, H: skinLight } : hairColors);
  stamp(8, 12, ['..OOOOOOOOOOOO..', '.OSSSSSSSSSSSSO.', 'OSLLLLLLLLLLLSSO', 'OSLLLLLLLLLLLSSO', 'OSLLLLLLLLLLLSSO',
    'OSLLLLLLLLLLLSSO', '.SLLLLLLLLLLLSS.', '.OSLLLLLLLLLSSO.', '..OSLLLLLLLSSO..', '...OSLLLLSSSO...', '....OOOOOOOO....'],
    { O: ink, S: skinShade, L: skin });
  rect(8, 16, 1, 3, skin); rect(23, 16, 1, 3, skinShade);
  rect(12, 16, 2, 3, '#344258'); rect(19, 16, 2, 3, '#344258');
  rect(12, 16, 1, 1, '#fff9e7'); rect(19, 16, 1, 1, '#fff9e7');
  rect(11, 19, 2, 1, '#eda995'); rect(21, 19, 1, 1, '#eda995'); rect(16, 19, 1, 1, '#d9977f');
  rect(15, 21, 3, 1, '#b77c76');
  if (hairstyle !== 'none') {
    hairStamp(7, 11, ['OCCCHHHHHHCCCCCCSO', 'OCCHHHHCCCCCCCCSSO', '.OCCHCCCCCCSCCSSO.', '.OCCS.CCCCS.CCSO..', '..OS...CCS...SO...', '...O....S.....O...'], hairColors);
    if (hairstyle === 'crop') {
      hairStamp(6, 3, ['.......OO.........', '...OO.OCCO........', '..OCCOCCCHO..OO...', '.OCCCHHHCCCOOCCO..', '..OCCHHHHCCCCCCCO.', '...OCCCCCCCCCCCO..'], hairColors);
    } else if (hairstyle === 'curls') {
      for (const [x, y] of [[6, 5], [11, 3], [17, 4], [22, 6], [5, 10], [23, 11]])
        hairStamp(x, y, ['.OOO.', 'OHHCO', 'OCCSO', '.OSO.'], hairColors);
      hairStamp(8, 12, ['.CC..CC..CC..CC.', 'CHSCCHSCCHSCCHSC', '.SS..SS..SS..SS.'], hairColors);
    } else if (hairstyle === 'bob') {
      hairRect(9, 14, 4, 1, hairShade); hairRect(19, 14, 4, 1, hairShade);
    } else if (hairstyle === 'long') {
      hairStamp(7, 15, ['OCS', 'OHS', 'OHS', 'OHS', 'OCS', '.CS', '.SO'], hairColors);
      hairStamp(23, 15, ['SO', 'SO', 'SO', 'SO', 'SO', 'SO', 'O.'], hairColors);
    }
  }

  const hc = { O: ink, C: hat.color, S: hat.shade, H: '#fff0bb', W: '#fff9e8' };
  if (hat.style === 'straw') {
    stamp(4, 3, ['.........OOOOOO.........', '.......OOCCCCCCOO.......', '......OCHHHCCCCCCO......', '.....OCHHHHCCCCCCCO.....',
      '.....OCHHHCCCCCCCCO.....', '.....OSSSSSSSSSSSSO.....', '....OCCCCCCCCCCCCCCO....', '..OOCHHHHHCCCCCCCCCCOO..',
      '.OCHHHHHCCCCCCCCCCCCSSO.', 'OCCCCCCCCCCCCCCCCCCCSSSO', '.OCCCCCCCCCCCCCCCCSSSSO.', '..OOOOOOOOOOOOOOOOOOOO..'], hc);
    rect(23, 8, 2, 2, '#fff8de'); rect(24, 9, 1, 1, '#e8ad50');
  } else if (hat.style === 'cap') {
    stamp(5, 5, ['.......OOOOOOOO.......', '.....OOCCCCCCCCOO.....', '....OCCHHHCCCCCCCO....', '...OCCHHHCCCCCCCCCO...',
      '..OCCHHHCCCCCCCCCCSO..', '..OCCCCCCCCCCCCCCSSO..', '..OSSSSSSSSSSSSSSSSO..', '...OOOOCCCCCCCCCCCCOO.', '.......OOOOOOOOOOOOOO.'], hc);
    stamp(13, 7, ['.WW.', 'WWWW', '.WW.'], hc);
  } else if (hat.style === 'wizard') {
    stamp(4, 0, ['.............OO.........', '............OCCO........', '...........OCHCO........', '..........OCHCCO........',
      '.........OCHHCCCO.......', '........OCHHCCCCO.......', '.......OCHHCCCCCCO......', '......OCCCCCCCCCCCO.....',
      '.....OSSSSSSSSSSSSSO....', '..OOOCCCCCCCCCCCCCCCOO..', '.OCCCCCCCCCCCCCCCCCCSSO.', '..OOOOOOOOOOOOOOOOOOOO..'], hc);
    rect(16, 4, 1, 3, '#ffe7a4'); rect(15, 5, 3, 1, '#ffe7a4');
  } else if (hat.style === 'chef') {
    stamp(6, 1, ['.....OOOO..OOOO.....', '...OOCCCCOOCCCCOO...', '..OCWWCCCCCCCCCCCO..', '.OCWWWCCCCCCCCCCCCO.',
      '.OCWWCCCCCCCCCCCCCO.', '..OCCCCCCCCCCCCCCO..', '...OCCCCCCCCCCCCO...', '....OSSSSSSSSSSO....',
      '.OCWCCCCCCCCCCCCCCO.', '.OCCCCCCCCCCCCCCCCO.', '.OOOOOOOOOOOOOOOOOO.'], hc);
  } else if (hat.style === 'hood' || hat.style === 'helmet') {
    stamp(4, 3, ['........OOOOOOOO........', '.....OOOCCCCCCCCOOO.....', '....OCWWCCCCCCCCCCCO....', '...OCWWCCCCCCCCCCCCCO...',
      '..OCWWCCCCCCCCCCCCCCSO..', '.OCCCCSSSSSSSSSSCCCCSO.', '.OCCSS..........SSCCSO.', '.OCS..............SCSO.',
      '.OCS..............SCSO.', '.OCS..............SCSO.', '.OCS..............SCSO.', '.OCS..............SCSO.',
      '.OCS..............SCSO.', '..CS..............SCS..', '..OC..............CCO..', '...OCC..........CCCO...', '....OO..........OOO....'], hc);
    if (hat.style === 'helmet') { rect(6, 14, 2, 4, hat.shade); rect(25, 14, 2, 4, hat.shade); rect(9, 10, 2, 1, '#effcfa'); }
  }
  // Facial hair follows the selected hair palette. Masks sit above it; glasses
  // remain a separate slot and can be worn together with any lower-face mask.
  if (beard.style === 'short' || beard.style === 'full') {
    stamp(10, 19, ['SS........SS', 'SCS......SCS', '.CSS....SSS.', '..CCSSSSSS..', '...SCCCSS...'], hairColors);
    if (beard.style === 'full') stamp(12, 22, ['SCCCCCCS', 'SCHCCCSS', '.SCCCSS.', '..SSSS..', '...SS...'], hairColors);
  } else if (beard.style === 'moustache') {
    stamp(10, 19, ['S...SS...S', 'CS.SCCS.SC', '.CSSSSSSC.'], hairColors);
  }
  if (mask.style !== 'none') {
    rect(8, 19, 3, 1, mask.shade); rect(22, 19, 3, 1, mask.shade);
    stamp(10, 19, ['.SSSSSSSSSS.', 'SCCCCCCCCCCS', 'SCHHHHHHCCCS', '.SCCCCCCCCS.', '..SSSSSSSS..'],
      { S: mask.shade, C: mask.color, H: '#f4efe2' });
    if (mask.style === 'bandana') stamp(13, 23, ['CCCCCC', '.CHCC.', '..CC..', '..SS..'], { C: mask.color, H: '#ffe8bf', S: mask.shade });
  }
  if (face.style !== 'none') {
    const gc: Record<string, string> = { O: face.color, H: '#f3ffff' };
    if (face.style === 'sunglasses') gc.C = face.shade;
    for (const x of [10, 18]) {
      stamp(x, 15, ['.OOOO.', 'OCHCCO', 'OCCCCO', 'OCCCCO', '.OOOO.'], gc);
    }
    rect(16, 16, 2, 1, face.color); rect(8, 16, 2, 1, face.color); rect(24, 16, 1, 1, face.color);
  }

  const gear = pose === 'water' ? { ...accessory, style: 'can', color: '#8abdb8', shade: '#507a85' } : accessory;
  const gc = { O: ink, C: gear.color, S: gear.shade, H: '#fae7bf', W: '#f5edda' };
  if (gear.style === 'can') {
    stamp(23, 26, ['..SSS....', '.S...S...', 'OCCCCCO.S', 'OCHCCCOCS', 'OCCCCCSS.', '.OOOOO...'], gc);
    if (pose === 'water') { rect(30, 31 + frame % 2, 1, 2, '#bde9ef'); rect(28, 33, 1, 1, '#bde9ef'); }
  } else if (gear.style === 'basketball' || gear.style === 'football') {
    stamp(23, 26, ['..OOOO..', '.OCHCCO.', 'OCHCCCCO', 'OCCCCCCO', 'OCCCCCCO', '.OCCCCO.', '..OOOO..'], gc);
    if (gear.style === 'basketball') { rect(26, 27, 1, 5, gear.shade); rect(24, 29, 6, 1, gear.shade); }
    else { rect(26, 28, 3, 2, gear.shade); rect(24, 30, 2, 1, gear.shade); rect(29, 27, 1, 1, gear.shade); }
  } else if (gear.style === 'pan') {
    stamp(23, 25, ['..SS....', '..SS....', '.OOOOOO.', 'OCCCCCCO', 'OCCHHCCO', '.OCCCCO.', '..OOOO..'], gc);
  } else if (gear.style === 'spatula') {
    rect(26, 24, 2, 6, '#97705b'); stamp(24, 20, ['.OOOO.', 'OCHSCO', 'OCSCCO', '.OCCO.', '..SS..'], gc);
  } else if (gear.style === 'wand') {
    rect(27, 24, 1, 7, '#b3875d'); stamp(24, 18, ['...C...', '..CHC..', 'CCHHHCC', '.CHHHC.', '..CHC..', '.C...C.'], gc);
  } else if (gear.style === 'racket') {
    stamp(24, 18, ['..SSS..', '.SCCCS.', 'SCWCWCS', 'SWWWWWS', 'SCWCWCS', '.SCCCS.', '..SSS..', '...S...', '...S...', '...S...'], gc);
  }
  if (pose === 'study') {
    rect(9, 26, 5, 2, skin); rect(19, 26, 5, 2, skin);
    drawTable(c);
  }
  return finish();
}
