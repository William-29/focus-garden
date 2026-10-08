export type PixelRect = { x: number; y: number; width: number; height: number; color: string };
export type PixelArt = { width: number; height: number; rects: PixelRect[] };
const ink = '#493745';

export function canvas(width: number, height: number) {
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

