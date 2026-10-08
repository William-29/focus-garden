export const farmerStyles = ['girl', 'boy'] as const;
export type FarmerStyle = typeof farmerStyles[number];
export function isFarmerStyle(value: unknown): value is FarmerStyle { return farmerStyles.some((style) => style === value); }
