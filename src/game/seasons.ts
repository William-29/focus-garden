export const seasons = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = typeof seasons[number];
export const seasonNames: Record<Season, string> = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
export function isSeason(value: unknown): value is Season { return seasons.some((season) => season === value); }
export function fallingPhase(elapsed: number, start: number, duration: number) {
  'worklet';
  return (start + elapsed / duration) % 1;
}
export const seasonDescriptions: Record<Season, string> = {
  spring: 'Fresh green grass, cherry blossoms and gently drifting pink petals.',
  summer: 'Sunny lawns, lush green trees and blooming flowers.',
  autumn: 'Golden grass, copper leaves and a few leaves drifting in the breeze.',
  winter: 'Snowy ground, frosted trees and roofs, soft snowfall and a growing greenhouse.',
};
// Five independently spaced particles keep the garden calm on small screens.
export function weatherParticles(season: Season) {
  if (season === 'summer') return [];
  return [0.22, 0.64, 0.42, 0.78, 0.34].map((phase, index) => ({
    phase, x: 0.12 + index * 0.18, duration: (season === 'autumn' ? 23000 : 18000) + index * 1100,
  }));
}
export function localGardenDate(timestamp: number) {
  const date = new Date(timestamp);
  return {
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    date: `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]} ${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}`,
  };
}
