import type { Category } from './garden';

// Visible alpha bounds measured inside each original atlas cell. Transparent
// padding varies from crop to crop; center the artwork, not its padded cell.
export const plantInkBounds: Record<Category, number[][]> = {
  Vegetables: [[33,32,251,288],[38,56,262,262],[41,26,227,294],[25,67,270,253],[51,32,239,288],[40,30,254,274],[29,62,268,239],[28,30,267,271],[29,45,266,259],[50,25,220,279],[49,14,237,281],[34,3,263,288],[32,9,254,283],[24,20,284,268],[43,12,257,280]],
  Flowers: [[64,69,216,238],[66,60,219,247],[49,52,223,255],[37,70,228,237],[31,60,240,252],[50,43,259,241],[60,24,244,262],[41,48,239,240],[39,39,234,247],[20,59,256,227],[61,18,246,250],[46,11,258,257],[35,19,257,252],[28,13,258,255],[23,6,248,265]],
  Fruits: [[42,111,257,191],[29,67,270,233],[29,61,262,242],[30,57,258,250],[27,54,265,256],[28,39,270,256],[24,28,279,266],[22,28,282,264],[24,36,279,257],[21,47,277,242],[31,10,272,268],[23,24,284,253],[22,74,277,211],[14,70,290,215],[22,0,272,276]],
};

export function centeredPlantPlacement(size: number, bounds: number[]) {
  const [x, y, width, height] = bounds;
  const scale = size * 0.9 / Math.max(width, height);
  return { scale, left: size / 2 - (x + width / 2) * scale, top: size / 2 - (y + height / 2) * scale };
}
