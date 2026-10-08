export const CHARACTER_WIDTH = 32, CHARACTER_HEIGHT = 36;

// More source detail in a smaller world sprite. Snap source pixels to complete
// device pixels, including on Retina screens, without enlarging the gardener.
export function characterMetrics(height: number, density = 1) {
  const preferred = height >= 550 ? 2.25 : 1.5;
  const scale = Math.max(1, Math.floor(preferred * density) / density);
  return { scale, width: CHARACTER_WIDTH * scale, height: CHARACTER_HEIGHT * scale };
}
