// Backdrop always uses the entire viewport. Only touch controls use safe areas.
export function gardenLayout(width: number, height: number, insets: { left: number; right: number; top: number; bottom: number }) {
  // Grow the contents along with their frames, using both dimensions so short
  // landscape windows keep usable touch targets without oversized panels.
  const controlScale = Math.max(1, Math.min(2,
    (width - insets.left - insets.right - 24) / 800,
    (height - insets.top - insets.bottom - 22) / 380));
  const controls = { left: insets.left + 12 * controlScale, top: insets.top + 10 * controlScale,
    width: width - insets.left - insets.right - 24 * controlScale,
    height: height - insets.top - insets.bottom - 22 * controlScale };
  const panelWidth = Math.round(Math.min(controls.width * 0.42, 300 * controlScale,
    Math.max(224 * controlScale, controls.width * 0.28)));
  return { world: { width, height }, controls, controlScale, panelWidth,
    toolbarWidth: Math.min(760 * controlScale, controls.width - panelWidth - 12 * controlScale),
    toolbarHeight: 58 * controlScale,
    bottom: insets.bottom + 12 * controlScale, right: insets.right + 12 * controlScale };
}
