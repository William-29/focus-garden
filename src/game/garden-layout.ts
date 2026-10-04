// Backdrop always uses the entire viewport. Only touch controls use safe areas.
export function gardenLayout(width: number, height: number, insets: { left: number; right: number; top: number; bottom: number }) {
  const controls = { left: insets.left + 12, top: insets.top + 10,
    width: width - insets.left - insets.right - 24, height: height - insets.top - insets.bottom - 22 };
  const panelWidth = Math.round(controls.width * 0.28);
  return { world: { width, height }, controls, panelWidth, toolbarWidth: controls.width - panelWidth - 12,
    bottom: insets.bottom + 12, right: insets.right + 12 };
}

export function petRoamPath(width: number, height: number, index: number, spriteWidth: number, spriteHeight: number) {
  // Clockwise grass path around the fence, with different start points per pet.
  const route = [[0.23, 0.37], [0.31, 0.29], [0.42, 0.27], [0.54, 0.27], [0.64, 0.31],
    [0.65, 0.46], [0.65, 0.60], [0.57, 0.67], [0.41, 0.67], [0.31, 0.57], [0.22, 0.50]];
  return route.map((_, step) => {
    const point = route[(step + index * 2) % route.length];
    return { x: Math.round(point[0] * width - spriteWidth / 2), y: Math.round(point[1] * height - spriteHeight) };
  });
}
