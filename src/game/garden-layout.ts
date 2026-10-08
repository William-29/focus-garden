// Backdrop always uses the entire viewport. Only touch controls use safe areas.
export function gardenLayout(width: number, height: number, insets: { left: number; right: number; top: number; bottom: number }) {
  const controls = { left: insets.left + 12, top: insets.top + 10,
    width: width - insets.left - insets.right - 24, height: height - insets.top - insets.bottom - 22 };
  const panelWidth = Math.round(controls.width * 0.28);
  return { world: { width, height }, controls, panelWidth, toolbarWidth: controls.width - panelWidth - 12,
    bottom: insets.bottom + 12, right: insets.right + 12 };
}
