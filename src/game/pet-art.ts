import type { Pet, PetSpecies } from './garden';
import { canvas, type PixelArt } from './pixel-canvas.ts';

export type PetView = 'front' | 'side';
export function petDimensions(pet: Pet) { return pet.baby ? { width: 24, height: 24 } : { width: 32, height: 32 }; }
export function petWorldScale(pet: Pet) { return pet.baby ? 40 / 24 : 48 / 32; }

type Coat = { C: string; S: string; D: string; H: string };
const ink = '#4d3b2d';
const coats: Record<PetSpecies, Coat> = {
  dog: { C: '#d2a76c', S: '#aa7b4b', D: '#825734', H: '#eccb90' },
  cat: { C: '#b1a38a', S: '#8b7963', D: '#665442', H: '#d9c9aa' },
  bunny: { C: '#b39a7c', S: '#92755d', D: '#705742', H: '#dac1a0' },
  chicken: { C: '#b9763d', S: '#93532c', D: '#714327', H: '#db9e52' },
  duck: { C: '#d3c6a4', S: '#a89679', D: '#735b43', H: '#f0e6c9' },
  fox: { C: '#cc7b37', S: '#a6592b', D: '#7e4326', H: '#eaa353' },
  pig: { C: '#e4a19e', S: '#c58081', D: '#9d6069', H: '#f6c1b2' },
  turtle: { C: '#8fa567', S: '#6b824c', D: '#4e653b', H: '#b4c887' },
};
const babyCoats: Partial<Record<PetSpecies, Coat>> = {
  dog: { C: '#dfb780', S: '#b48955', D: '#88613e', H: '#f1d29d' },
  cat: { C: '#c3b298', S: '#9b846c', D: '#705b48', H: '#e2cfb2' },
  bunny: { C: '#c09b86', S: '#a17c69', D: '#7d5b4b', H: '#e1bfa7' },
  fox: { C: '#da9148', S: '#b26b34', D: '#874a28', H: '#f0b365' },
  pig: { C: '#edb2ac', S: '#d48e8e', D: '#a96973', H: '#ffcec0' },
  turtle: { C: '#a0b475', S: '#789257', D: '#597441', H: '#c4d493' },
};

// One joined silhouette per animal. Baby geometry is rasterized directly onto
// its own pixel grid, so downsampling cannot remove a neck or disconnect a paw.
export function petArt(pet: Pet, frame = 0, view: PetView = 'front'): PixelArt {
  const size = petDimensions(pet), c = canvas(size.width, size.height);
  const scale = pet.baby ? 0.75 : 1;
  frame = ((frame % 4) + 4) % 4;
  const stride = [0, 1, 0, -1][frame];
  const bird = pet.species === 'chicken' || pet.species === 'duck';
  const coat = pet.baby && bird ? { C: '#efce73', S: '#c49e49', D: '#997637', H: '#ffe8a0' }
    : pet.baby ? babyCoats[pet.species] ?? coats[pet.species] : coats[pet.species];
  const p = { ...coat, O: ink, W: '#f7edd5', P: '#d99291', E: '#302c29', R: '#c64e3b', B: '#e5aa45',
    G: '#3f664c', T: '#6d9570', A: '#a47b3d' };
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    const left = Math.round(x * scale), top = Math.round(y * scale);
    const width = Math.round((x + w) * scale) - left, height = Math.round((y + h) * scale) - top;
    if (!width || !height) return;
    if (left < 1 || top < 1 || left + width >= size.width || top + height >= size.height) {
      throw new Error('Pet artwork must keep transparent space around every frame');
    }
    c.rect(left, top, width, height, color);
  };
  const stamp = (x: number, y: number, rows: string[]) => {
    rows.forEach((row, dy) => [...row].forEach((key, dx) => {
      const color = p[key as keyof typeof p];
      if (color) rect(x + dx, y + dy, 1, 1, color);
    }));
  };
  const oval = (x: number, y: number, w: number, h: number, colors: Coat = coat, edge = ink) => {
    const left = Math.round(x * scale), top = Math.round(y * scale);
    const width = Math.round((x + w) * scale) - left, height = Math.round((y + h) * scale) - top;
    const inside = (col: number, row: number) => ((col + 0.5 - width / 2) / (width / 2)) ** 2 + ((row + 0.5 - height / 2) / (height / 2)) ** 2 <= 1;
    for (let row = 0; row < height; row++) for (let col = 0; col < width; col++) {
      if (!inside(col, row)) continue;
      if (left + col < 1 || top + row < 1 || left + col >= size.width - 1 || top + row >= size.height - 1) throw new Error('Pet oval exceeds its safe frame');
      const boundary = !inside(col - 1, row) || !inside(col + 1, row) || !inside(col, row - 1) || !inside(col, row + 1);
      const color = boundary ? edge : row >= height * 0.78 ? colors.D
        : row > height * 0.6 || col > width * 0.74 ? colors.S : row < height * 0.4 && col < width * 0.6 ? colors.H : colors.C;
      c.rect(left + col, top + row, 1, 1, color);
    }
  };
  const soft = (x: number, y: number, w: number, h: number, color = p.W) => oval(x, y, w, h,
    { C: color, S: color, D: color, H: color }, p.S);
  const eye = (x: number, y: number) => {
    rect(x, y, 2, 2, p.E);
    if (!pet.baby) rect(x, y, 1, 1, '#fff8e7');
  };
  const paw = (x: number, y: number, footStride: number, far = false, length = 6) => {
    // Fixed thighs overlap the belly; only the ankle/paw shifts with the gait.
    rect(x, y, 4, length - 1, far ? p.D : ink);
    rect(x + 1, y, 2, length - 1, far ? p.S : p.C);
    rect(x + footStride, y + length - 2, 4, 2, far ? p.D : p.S);
    rect(x + footStride + 1, y + length - 2, 2, 1, far ? p.S : p.H);
  };
  const birdFoot = (x: number, opposite: number) => {
    rect(x, 24, 2, 5, '#b7803a');
    rect(x + opposite, 28, 3, 2, p.B);
  };
  const shell = (x: number, y: number, w: number, h: number) => {
    oval(x, y, w, h);
    // Shell tiles are inset, so the rounded outer contour stays intact.
    for (const [tx, ty] of [[x + 5, y + 3], [x + 10, y + 3], [x + 3, y + 7], [x + 8, y + 7], [x + 13, y + 7]]) {
      stamp(tx, ty, ['.DD.', 'DCCD', '.DD.']);
    }
  };

  if (view === 'side') {
    if (bird) {
      stamp(3, 15, ['OO...', 'OCO..', 'OHCO.', '.OCCO', '..OCO', '...OO']);
      birdFoot(11, stride); birdFoot(18, -stride);
      oval(6, 15 + (pet.species === 'duck' ? 3 : 0), 18, pet.species === 'duck' ? 10 : 13);
      if (pet.baby) {
        oval(17, 13, 8, 11); oval(18, 10, 10, 10);
        soft(9, 20, 9, 5, p.H);
        eye(24, 13);
        rect(27, 16, 3, pet.species === 'duck' ? 3 : 2, p.B);
        if (pet.species === 'chicken') rect(28, 17, 1, 1, p.D);
      } else if (pet.species === 'chicken') {
        oval(17, 14, 8, 10); oval(18, 9, 10, 11);
        stamp(21, 6, ['.RR.', 'RRRR', 'RRRR', '.RR.']);
        oval(9, 18, 11, 7, { C: p.S, S: p.D, D: p.D, H: p.C }, p.D);
        stamp(11, 21, ['H.C.H.', '.C.C..']);
        eye(24, 12); rect(27, 15, 3, 2, p.B); rect(25, 18, 2, 2, p.R);
      } else {
        oval(18, 14, 7, 10, { C: p.D, S: p.D, D: p.D, H: p.D });
        oval(19, 8, 10, 11, { C: p.G, S: p.G, D: '#31533e', H: p.T });
        rect(21, 18, 3, 2, p.W);
        oval(9, 20, 12, 6, { C: p.C, S: p.S, D: p.D, H: p.W }, p.D);
        stamp(11, 22, ['WWWWW.', '.WWWS.']);
        eye(25, 11); rect(27, 14, 3, 2, p.B);
      }
    } else if (pet.species === 'turtle') {
      stamp(5, 23, ['...OO', '..OCO', '.OCCO', 'OCCOO']);
      paw(9, 25, stride, false, 5); paw(19, 25, -stride, false, 5);
      shell(6, 15, 18, 12);
      oval(20, 23, 8, 5); oval(23, 22, 7, 6);
      eye(27, 24); rect(27, 27, 2, 1, p.S);
    } else if (pet.species === 'bunny') {
      paw(19, 24, stride, true);
      oval(7, 17, 16, 12); soft(4, 21, 6, 6);
      oval(17, 17, 8, 10); oval(18, 12, 11, 11);
      oval(19, 2, 4, 14); oval(24, 3, 4, 13);
      rect(20, 5, 1, 7, p.P); rect(25, 6, 1, 6, p.P);
      // Draw the face after ears, joining the bases inside the forehead.
      oval(18, 13, 11, 10);
      soft(24, 19, 5, 3); eye(25, 16); rect(28, 19, 1, 1, p.P);
      oval(9, 24, 7, 6); paw(21, 24, -stride);
    } else if (pet.species === 'pig') {
      paw(10, 24, -stride, true); paw(20, 24, stride, true);
      stamp(3, 17, ['.SSS.', 'SS.SS', 'SSSSS', '.SSSO', '...SO']);
      oval(7, 12, 18, 16); oval(19, 13, 10, 12);
      stamp(21, 10, ['.OO..', 'OCHCO', '.OCCO', '..CCO', '..CCC']);
      soft(25, 18, 5, 5, p.P); eye(24, 16); rect(28, 20, 1, 1, p.D);
      paw(10, 25, stride, false, 5); paw(21, 25, -stride, false, 5);
    } else {
      paw(11, 24, -stride, true); paw(20, 24, stride, true);
      if (pet.species === 'fox') {
        stamp(2, 18, ['...OOOO...', '..OHHCCO..', '.OWHCCCCO.', 'OWWCCCCCSO', 'OWWCCCSSSO', '.OCCSSSO..', '..OOO.....']);
      } else if (pet.species === 'cat') {
        stamp(3, 10, ['..OO..', '.OCCO.', 'OCCO..', 'OCCO..', 'OSCO..', 'OCCO..', '.OCCO.', '..OCCO', '...OCO', '...OCO', '...OCO', '...CCO', '...CCO']);
      } else stamp(3, 12, ['OO...', 'OCO..', '.OCO.', '..OCO', '..OCO', '..OCO', '...CC', '...CC']);
      oval(7, 17, 17, 11); oval(17, 14, 9, 12);
      if (pet.species === 'dog') {
        oval(19, 8, 10, 13); soft(24, 15, 6, 5);
        oval(18, 10, 5, 10, { C: p.S, S: p.D, D: p.D, H: p.C });
        eye(25, 12); rect(29, 16, 1, 2, p.E);
      } else {
        stamp(20, 6, ['O......O', 'OCO...CO', 'OCPO.OCO', 'OCCCOCCO', '.CCCCCC.']);
        oval(19, 10, 11, 12);
        soft(24, 17, 6, 4); eye(25, 13); rect(29, 18, 1, 1, pet.species === 'fox' ? p.E : p.P);
        if (pet.species === 'cat') {
          for (const x of [11, 15, 19]) stamp(x, 19, ['D.', 'DD', '.D']);
          rect(22, 11, 1, 2, p.D); rect(24, 11, 1, 2, p.D); rect(27, 19, 2, 1, p.D);
        } else soft(19, 21, 6, 4);
      }
      paw(10, 24, stride); paw(21, 24, -stride);
    }
  } else if (bird) {
    birdFoot(12, stride); birdFoot(19, -stride);
    oval(8, 15, 16, 13);
    if (pet.baby) {
      oval(9, 9, 15, 13); soft(12, 22, 8, 4, p.H);
      eye(12, 14); eye(20, 14);
      stamp(pet.species === 'duck' ? 13 : 15, 18, pet.species === 'duck' ? ['BBBBBB', '.BBBB.'] : ['BBB', '.B.']);
    } else if (pet.species === 'chicken') {
      oval(11, 9, 11, 12);
      stamp(14, 6, ['.RR.', 'RRRR', 'RRRR', '.RR.']);
      oval(9, 18, 5, 7, { C: p.C, S: p.D, D: p.D, H: p.H }, p.S);
      oval(19, 18, 4, 7, { C: p.C, S: p.D, D: p.D, H: p.C }, p.S);
      eye(13, 13); eye(19, 13); stamp(15, 17, ['BBB', '.B.']); rect(16, 19, 2, 2, p.R);
    } else {
      oval(12, 13, 8, 11, { C: p.D, S: p.D, D: p.D, H: p.D });
      oval(10, 6, 13, 13, { C: p.G, S: p.G, D: '#31533e', H: p.T });
      rect(13, 18, 6, 2, p.W); soft(10, 22, 12, 4);
      eye(13, 11); eye(19, 11); stamp(13, 15, ['BBBBBB', 'BBBBBB', '.BBBB.']);
    }
  } else if (pet.species === 'turtle') {
    paw(9, 25, stride, false, 5); paw(20, 25, -stride, false, 5);
    shell(7, 14, 18, 14);
    oval(12, 22, 8, 7); eye(13, 24); eye(18, 24); rect(15, 27, 3, 1, p.S);
  } else {
    paw(11, 24, stride); paw(18, 24, -stride);
    if (pet.species === 'fox') stamp(21, 21, ['...OO.', '..OCCO', '.OCSSO', 'OWWSO.', 'OWSO..', 'OO....']);
    else if (pet.species === 'cat') stamp(21, 17, ['...OO.', '..OCCO', '.OCCO.', '.OSCO.', '.OCCO.', '.OCCO.', '.OCCO.', '.OCCO.', 'OCCO..']);
    else if (pet.species === 'dog') stamp(6, 20, ['OO..', 'OCO.', 'OCCO', '.OCC', '..CC']);
    oval(9, 17, 14, 12);
    if (pet.species === 'dog') {
      oval(8, 7, 17, 15);
      oval(5, 9, 6, 11, { C: p.S, S: p.D, D: p.D, H: p.C });
      oval(22, 9, 5, 11, { C: p.S, S: p.D, D: p.D, H: p.C });
      soft(11, 16, 11, 5); soft(13, 22, 7, 4);
      eye(11, 12); eye(20, 12); rect(15, 16, 3, 2, p.E); rect(16, 18, 1, 1, p.D);
    } else if (pet.species === 'bunny') {
      oval(10, 2, 5, 15); oval(18, 2, 5, 15);
      rect(12, 5, 1, 8, p.P); rect(20, 5, 1, 8, p.P);
      oval(9, 12, 15, 12); soft(12, 20, 9, 3); soft(12, 24, 8, 3);
      eye(12, 16); eye(20, 16); rect(15, 19, 2, 1, p.P); rect(16, 20, 1, 1, p.D);
    } else if (pet.species === 'pig') {
      stamp(7, 8, ['OOO..........OOO', 'OHCO........OHCO', 'OCPCO......OCPCO', '.OCCCO....OCCCO.', '..CCCC....CCCC..']);
      oval(8, 11, 16, 13);
      soft(11, 17, 10, 6, p.P); eye(11, 15); eye(20, 15);
      rect(13, 19, 2, 1, p.D); rect(18, 19, 2, 1, p.D);
    } else {
      stamp(9, 6, ['O.............O', 'OCO.........OCO', 'OCPCO.....OCPCO', 'OCCCCO...OCCCCO', '.CCCCCC.CCCCCC.', '..CCCCCCCCCCC..']);
      oval(8, 10, 17, 13);
      soft(12, 17, 9, 5); soft(13, 23, 7, 4);
      eye(11, 14); eye(20, 14); rect(15, 18, 3, 1, pet.species === 'fox' ? p.E : p.P);
      if (pet.species === 'cat') {
        rect(12, 11, 1, 2, p.D); rect(16, 11, 1, 3, p.D); rect(20, 11, 1, 2, p.D);
        rect(9, 18, 2, 1, p.D); rect(22, 18, 2, 1, p.D);
      }
    }
  }
  return c.finish();
}
