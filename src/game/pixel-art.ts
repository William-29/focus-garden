import type { Clothing, ClothingSlot, Pet } from './garden';

// Original, editable pixel art. Every coordinate is a whole source pixel.
// Layers share a 24 x 32 canvas, so any top, pants, hat and gear can be mixed.
export type PixelRect = { x: number; y: number; width: number; height: number; color: string };
export type PixelArt = { width: number; height: number; rects: PixelRect[] };
export type CharacterPose = 'idle' | 'walk' | 'study' | 'water';
const ink = '#503b50', skin = '#f6c99a', skinShade = '#d89379', hair = '#875743', hairShade = '#5d3e43';

function canvas(width: number, height: number) {
  const pixels: (string | undefined)[][] = Array.from({ length: height }, () => Array(width));
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) {
      if (row >= 0 && row < height && col >= 0 && col < width) pixels[row][col] = color;
    }
  };
  const box = (x: number, y: number, w: number, h: number, color: string, edge = ink) => {
    rect(x, y, w, h, edge); rect(x + 1, y + 1, w - 2, h - 2, color);
  };
  const stamp = (x: number, y: number, rows: string[], colors: Record<string, string>) => {
    rows.forEach((row, dy) => [...row].forEach((pixel, dx) => { if (colors[pixel]) rect(x + dx, y + dy, 1, 1, colors[pixel]); }));
  };
  const finish = (): PixelArt => {
    // Merge adjacent pixels into rectangles; fewer native drawing nodes.
    const rects: PixelRect[] = [];
    pixels.forEach((row, y) => {
      for (let x = 0; x < width;) {
        const color = row[x];
        if (!color) { x++; continue; }
        let end = x + 1;
        while (end < width && row[end] === color) end++;
        const previous = rects.find((r) => r.x === x && r.width === end - x && r.color === color && r.y + r.height === y);
        if (previous) previous.height++;
        else rects.push({ x, y, width: end - x, height: 1, color });
        x = end;
      }
    });
    return { width, height, rects };
  };
  return { rect, box, stamp, finish };
}

export function characterArt(items: Record<ClothingSlot, Clothing>, pose: CharacterPose = 'idle', frame = 0): PixelArt {
  const { rect, box, stamp, finish } = canvas(24, 32);
  const { body, pants, hat, face, accessory } = items;
  const step = pose === 'walk' ? [0, -1, 0, 1][frame % 4] : 0;
  // Alternating legs and boots change silhouette, rather than bobbing one image.
  const leg = (x: number, offset: number) => {
    box(x, 24 + offset, 5, 6, pants.color);
    rect(x + 3, 25 + offset, 1, 3, pants.shade);
    if (pants.style === 'shorts') rect(x + 1, 27 + offset, 3, 2, skin);
    if (pants.style === 'space') rect(x + 1, 27 + offset, 3, 1, '#9cbad0');
    rect(x, 29 + offset, 5, 2, ink); rect(x + 1, 29 + offset, 3, 1, '#98694d');
  };
  leg(7, step); leg(13, -step);
  // Hair, face, ears, and a tiny nose.
  stamp(5, 6, ['...OOOOOOOO...', '..OHHHHHHHHO..', '.OHHHHHHHHHHO.', '.OHHSSSSSSHHO.', '.OHSSSSSSSSHO.', 'OSSSSSSSSSSSSO', '.OSSESSESSSO..', '..SSSSSSSSS...', '..OSSSNSSSO...', '...OSSSSSO....', '....OOOOO.....'],
    { O: ink, H: hair, S: skin, E: '#3e3546', N: skinShade });
  rect(7, 11, 1, 2, hairShade); rect(15, 11, 1, 2, hairShade);
  rect(8, 13, 1, 1, '#e99a87'); rect(14, 13, 1, 1, '#e99a87');
  rect(10, 16, 4, 2, skinShade);
  box(7, 17, 11, 8, body.color); rect(15, 18, 2, 6, body.shade);
  rect(8, 18, 2, 4, '#ffffff32'); rect(7, 24, 11, 1, body.shade);
  if (body.style === 'overalls') {
    rect(10, 18, 4, 2, '#fff1d1'); rect(9, 18, 1, 4, body.shade); rect(14, 18, 1, 4, body.shade);
    rect(10, 21, 4, 2, body.shade); rect(10, 19, 1, 1, '#f3ce79'); rect(14, 19, 1, 1, '#f3ce79');
  } else if (body.style === 'chef') {
    rect(11, 18, 1, 6, body.shade); rect(10, 20, 1, 1, ink); rect(13, 20, 1, 1, ink);
    rect(10, 22, 1, 1, ink); rect(13, 22, 1, 1, ink); rect(8, 23, 7, 1, '#eaa69d');
  } else if (body.style === 'jersey') {
    rect(10, 18, 4, 1, '#fff2d8'); stamp(11, 20, ['WWW', '..W', '.W.', '.W.'], { W: '#fff2d8' });
  } else if (body.style === 'space') {
    box(10, 20, 5, 3, '#9dd0ce', body.shade); rect(11, 21, 1, 1, '#fff2cf'); rect(13, 21, 1, 1, '#df8a83');
  } else if (body.style === 'wizard') {
    rect(11, 18, 2, 7, '#e7ca7b'); rect(8, 23, 9, 1, '#e7ca7b'); rect(9, 20, 1, 1, '#ffe5a9');
  } else rect(11, 18, 1, 6, body.shade);
  const arm = (x: number, offset: number) => {
    box(x, 18 + offset, 4, 4, body.color); rect(x + 1, 21 + offset, 2, 3, skin); rect(x + 1, 23 + offset, 2, 1, skinShade);
  };
  arm(4, -step); arm(17, step);
  if (hat.style === 'straw') {
    stamp(3, 2, ['.......OOOOOO......', '......OCCCCCCO.....', '.....OCCCCCCCCO....', '.....OCCCCCCCCO....', '....OSSSSSSSSSSO...', '..OOCCCCCCCCCCCCOO.', '.OCCCCCCCCCCCCCCCCO', '..OOOOOOOOOOOOOOOO.'], { O: ink, C: hat.color, S: hat.shade });
    rect(8, 4, 3, 1, '#f9e5a2'); rect(17, 6, 2, 2, '#fff5df'); rect(17, 7, 1, 1, '#eabe6d');
  } else if (hat.style === 'wizard') {
    stamp(3, 0, ['..........OO.......', '.........OCCO......', '.........OCCC......', '........OCCCCO.....', '.......OCCCCCCO....', '......OCCCCCCCO....', '.....OCCCCCCCCCO...', '....OSSSSSSSSSSO...', '..OOCCCCCCCCCCCCOO.', '.OOOOOOOOOOOOOOOOO.'], { O: ink, C: hat.color, S: hat.shade });
    rect(12, 5, 1, 3, '#ffe2a0'); rect(11, 6, 3, 1, '#ffe2a0');
  } else if (hat.style === 'chef') {
    stamp(5, 1, ['..OOOO.OOOO...', '.OWWWWOWWWWO..', 'OWWWWWWWWWWWO.', 'OWWWWWWWWWWWO.', '.OWWWWWWWWWO..', '..OWWWWWWWO...', '..OSSSSSSSO...', '..OWWWWWWWO...', '..OOOOOOOOO...'], { O: ink, W: hat.color, S: hat.shade });
  } else if (hat.style === 'cap') {
    stamp(5, 4, ['...OOOOOO.....', '..OCCCCCCO....', '.OCCCCCCCCO...', '.OCCCCCCCCO...', '.OSSSSSSSSOOO.', '..OOOOOOOOOOOO'], { O: ink, C: hat.color, S: hat.shade });
    rect(12, 6, 1, 2, '#fff1d2');
  } else if (hat.style === 'hood' || hat.style === 'helmet') {
    stamp(5, 3, ['....OOOOO.....', '..OOCCCCCOO...', '.OCCCCCCCCCO..', 'OCCCCCCCCCCCO.', 'OCSSSSSSSSSCO.', 'OCS.......SCO.', 'OCS.......SCO.', 'OCS.......SCO.', 'OCC.......CCO.', '.CC.......CC..'], { O: ink, C: hat.color, S: hat.shade });
    rect(7, 5, 3, 1, '#fff7e6');
  }
  if (face.style !== 'none') {
    box(7, 11, 4, 3, face.style === 'sunglasses' ? face.shade : '#bacbc6', face.color);
    box(13, 11, 4, 3, face.style === 'sunglasses' ? face.shade : '#bacbc6', face.color);
    rect(11, 12, 2, 1, face.color);
  }
  // Each accessory is independently layered in the hand or on the back.
  const gear = pose === 'water' ? { ...accessory, style: 'can', color: '#8abdb8', shade: '#507a85' } : accessory;
  if (gear.style === 'can') {
    box(17, 22, 6, 5, gear.color); rect(21, 20, 2, 3, gear.shade); rect(22, 23, 2, 1, gear.shade);
    rect(18, 23, 2, 1, '#c4e4d5');
    if (pose === 'water') rect(23, 26 + frame % 2, 1, 2, '#def8ec');
  } else if (gear.style === 'basketball' || gear.style === 'football') {
    stamp(17, 21, ['..OOO..', '.OCCCO.', 'OCCCCCO', 'OCCCCCO', 'OCCCCCO', '.OCCCO.', '..OOO..'], { O: ink, C: gear.color });
    if (gear.style === 'basketball') { rect(20, 22, 1, 5, gear.shade); rect(18, 24, 5, 1, gear.shade); }
    else { rect(19, 23, 3, 2, gear.shade); rect(17, 24, 1, 2, gear.shade); rect(22, 22, 1, 1, gear.shade); }
  } else if (gear.style === 'pan') {
    box(17, 22, 7, 5, gear.color); rect(17, 21, 2, 3, gear.shade); rect(19, 23, 3, 1, '#f7d17f');
  } else if (gear.style === 'spatula') {
    rect(20, 16, 1, 8, '#aa7754'); box(18, 13, 5, 5, gear.color); rect(20, 14, 1, 2, gear.shade);
  } else if (gear.style === 'wand') {
    rect(20, 16, 1, 8, '#ad8061'); stamp(18, 11, ['..C..', '.CCC.', 'CCCCC', '.CCC.', '..C..'], { C: gear.color });
  } else if (gear.style === 'racket') {
    box(18, 12, 6, 8, gear.color); rect(19, 14, 4, 1, '#edf0d5'); rect(19, 16, 4, 1, '#edf0d5'); rect(20, 19, 2, 6, gear.shade);
  } else if (gear.style === 'pack') {
    box(2, 17, 5, 8, gear.color); rect(3, 22, 3, 2, gear.shade); rect(3, 18, 1, 2, '#e9f1de');
  }
  if (pose === 'study') {
    rect(5, 21, 6, 2, skin); rect(14, 21, 6, 2, skin);
    box(3, 23, 19, 5, '#c18b63'); rect(4, 24, 17, 1, '#eac398');
    rect(4, 28, 2, 3, ink); rect(19, 28, 2, 3, ink);
    box(8, 22, 9, 3, '#fff2d6', '#b39786'); rect(12, 23, 1, 2, '#c99e8d');
  }
  return finish();
}

export function petArt(pet: Pet, frame = 0): PixelArt {
  const { rect, box, stamp, finish } = canvas(24, 22);
  const colors = { O: ink, C: pet.color, S: pet.shade, W: '#fff1dd', P: '#e7a0a6' };
  const bird = pet.id === 'chicken' || pet.id === 'duck';
  const step = [0, 1, 0, -1][frame % 4];
  if (bird) {
    stamp(4, 6, ['........OOOO....', '.......OCCCCO...', '..OO..OCCCCCCO..', '.OCCOOCCCCCCCO..', '.OCCCCCCCCCCCO..', '..OCCCCCCCCCO...', '...OCCCCCCCO....', '....OOOOOOO.....'], colors);
    rect(16, 8, 1, 1, ink); rect(18, 9, 3, 2, '#deaa60'); rect(8, 11, 5, 2, pet.shade);
    if (pet.id === 'chicken') { rect(13, 5, 4, 2, '#d87883'); rect(17, 11, 1, 2, '#d87883'); }
    rect(10 + step, 14, 1, 3, '#ba8055'); rect(9 + step, 17, 3, 1, '#deaa60');
    rect(14 - step, 14, 1, 3, '#ba8055'); rect(14 - step, 17, 3, 1, '#deaa60');
  } else if (pet.id === 'turtle') {
    stamp(4, 7, ['.....OOOOOO.....', '...OOCCCCCCOO...', '..OCCCCCCCCCCO..', '.OCCCCCCCCCCCCO.', '.OSSSCCSSSCCSSO.', '.OCCCCCCCCCCCCO.', '..OOOOOOOOOOOO..'], colors);
    box(17, 10, 6, 4, '#b0c991'); rect(21, 11, 1, 1, ink);
    rect(5 + step, 14, 3, 2, '#b0c991'); rect(14 - step, 14, 3, 2, '#b0c991');
    rect(9, 8, 1, 6, pet.shade); rect(14, 8, 1, 6, pet.shade);
  } else {
    stamp(4, 8, ['........OOOOO...', '.......OCCCCCO..', '..OOOOOCCCCCCCO.', '.OCCCCCCCCCCCCO.', 'OCCCCCCCCCCCCCO.', 'OCCCCCCCCCCCCCO.', '.OSSSSSSSSSSSO..', '..OOOOOOOOOOO...'], colors);
    rect(16, 11, 1, 2, ink); rect(19, 13, 2, 1, pet.shade); rect(17, 14, 3, 1, '#fff0d5');
    // Four tiny alternating paws; near legs are lighter than the far pair.
    rect(7 - step, 15, 2, 3, pet.shade); rect(15 + step, 15, 2, 3, pet.shade);
    rect(5 + step, 15, 3, 3, pet.color); rect(13 - step, 15, 3, 3, pet.color);
    rect(5 + step, 18, 3, 1, ink); rect(13 - step, 18, 3, 1, ink);
    if (pet.id === 'bunny') {
      box(13, 1, 3, 9, pet.color); box(17, 3, 3, 7, pet.color);
      rect(14, 3, 1, 4, '#e9b5b9'); rect(18, 5, 1, 3, '#e9b5b9'); box(2, 11, 4, 4, '#fff8e6');
    } else if (pet.id === 'cat' || pet.id === 'fox') {
      stamp(12, 5, ['O....O..', 'CO..OCO.', 'CCOOCCCO', 'CCCCCCCO'], colors);
      rect(14, 7, 1, 1, '#e7a0a6'); rect(18, 7, 1, 1, '#e7a0a6');
      if (pet.id === 'fox') {
        stamp(0, 10, ['.OOO....', 'OCCCO...', 'OWCCCO..', '.OWCCCO.', '..OOOOO.'], colors); rect(12, 14, 5, 2, '#fff1dd');
      } else { rect(2, 7, 2, 7, pet.shade); rect(3, 7 + frame % 2, 2, 2, pet.color); rect(8, 10, 2, 2, pet.shade); }
    } else if (pet.id === 'dog') {
      box(12, 7, 3, 6, pet.shade); rect(14, 8, 1, 3, pet.color);
      rect(2, 10, 3, 2, pet.shade); rect(1, 8 + frame % 2, 2, 3, pet.shade);
      rect(14, 15, 5, 1, '#86a898'); rect(17, 16, 1, 1, '#f6d77f');
    } else {
      rect(13, 7, 2, 3, pet.shade); rect(18, 7, 2, 3, pet.shade);
      box(18, 12, 5, 3, '#e68e9e'); rect(20, 13, 1, 1, pet.shade); rect(2, 11, 3, 1, pet.shade);
    }
  }
  return finish();
}
