import { Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle, type TextStyle, type ImageStyle, type ViewProps } from 'react-native';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { Plant } from '@/game/garden';

export const palette = {
  ink: '#583a49', muted: '#80646b', wood: '#fae7d4', border: '#704450',
  trim: '#dfad98', rose: '#c19385', cream: '#fff4de', green: '#b3d5a0',
  leaf: '#66895f', gold: '#edc97c', plum: '#352b3a',
};

const ControlScaleContext = createContext(1);

export function GardenControlScale({ scale, children }: { scale: number; children: ReactNode }) {
  return <ControlScaleContext.Provider value={scale}>{children}</ControlScaleContext.Provider>;
}

export function useGardenControlScale() { return useContext(ControlScaleContext); }

// Scale actual layout dimensions rather than transforming a fixed-size view,
// keeping scroll extents and touch targets in sync on native and web. Text is
// scaled by GardenText, so font sizes and line heights are left untouched here.
export function useGardenControlStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(base: T): T {
  const scale = useGardenControlScale();
  return useMemo(() => Object.fromEntries(Object.entries(base).map(([name, style]) => [name,
    Object.fromEntries(Object.entries(style).map(([key, value]) => [key,
      typeof value === 'number' && /^(?:width|height|minWidth|minHeight|maxWidth|maxHeight|top|right|bottom|left|gap|rowGap|columnGap|flexBasis|padding.*|margin.*|border.*Width|border.*Radius)$/.test(key)
        ? value * scale : value])),
  ])) as unknown as T, [base, scale]);
}

export function GardenText({ style, ...props }: TextProps) {
  const scale = useGardenControlScale();
  const resolved = StyleSheet.flatten(style);
  const fontSize = Math.max(12, resolved?.fontSize ?? 15) * scale;
  return <Text {...props} style={[baseStyles.text, style, { fontSize, lineHeight: Math.max(fontSize + 2 * scale, (resolved?.lineHeight ?? 0) * scale) }]} />;
}

export function WoodPanel({ children, style, ...props }: ViewProps) {
  const styles = useGardenControlStyles(baseStyles);
  return (
    <View {...props} style={[styles.panel, style, { backgroundColor: 'transparent' }]}>
      <View pointerEvents="none" style={[styles.frameHorizontal, { backgroundColor: StyleSheet.flatten(style)?.backgroundColor ?? palette.wood }]} />
      <View pointerEvents="none" style={[styles.frameVertical, { backgroundColor: StyleSheet.flatten(style)?.backgroundColor ?? palette.wood }]} />
      <View pointerEvents="none" style={styles.inset} />
      {children}
    </View>
  );
}

export function GardenButton({ label, onPress, disabled = false, selected = false, tone = 'green', style, accessibilityLabel }: {
  label: string; onPress: () => void; disabled?: boolean; selected?: boolean;
  tone?: 'green' | 'wood'; style?: StyleProp<ViewStyle>; accessibilityLabel?: string;
}) {
  const styles = useGardenControlStyles(baseStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, tone === 'wood' && styles.woodButton,
        selected && styles.selected, disabled && styles.disabled, pressed && styles.pressed, style]}>
      <GardenText style={styles.buttonText}>{label}</GardenText>
    </Pressable>
  );
}

export function PixelSwitch({ value, onChange, disabled = false, label = 'Quick play' }: {
  value: boolean; onChange: (value: boolean) => void; disabled?: boolean; label?: string;
}) {
  const scale = useGardenControlScale();
  const styles = useGardenControlStyles(baseStyles);
  return <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value, disabled }}
    disabled={disabled} onPress={() => onChange(!value)} style={[styles.switchButton, disabled && styles.disabled]}>
    <GardenText style={styles.switchLabel}>{label}</GardenText>
    <View style={[styles.switchTrack, { backgroundColor: value ? palette.leaf : '#b49487' }]}>
      <GardenText style={[styles.switchValue, { alignSelf: value ? 'flex-start' : 'flex-end' }]}>{value ? 'ON' : 'OFF'}</GardenText>
      <View style={[styles.switchThumb, value ? { right: 2 * scale } : { left: 2 * scale }]} />
    </View>
  </Pressable>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const styles = useGardenControlStyles(baseStyles);
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, value)) * 100}%` }]} />
    </View>
  );
}

export function formatClock(ms: number) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function durationLabel(plant: Plant) {
  return plant.minutes.length === 1 ? `${plant.minutes[0]} min focus`
    : `${plant.minutes[0]}m focus · ${plant.minutes[1]}m break · ${plant.minutes[2]}m focus`;
}

const baseStyles = StyleSheet.create({
  text: { fontFamily: 'GardenPixel', fontSize: 15, color: palette.ink },
  panel: { padding: 10, boxShadow: '4px 4px 0px #4f324744' },
  frameHorizontal: { position: 'absolute', top: 0, bottom: 0, left: 4, right: 4,
    borderTopWidth: 4, borderBottomWidth: 4, borderColor: palette.border },
  frameVertical: { position: 'absolute', top: 4, bottom: 4, left: 0, right: 0,
    borderLeftWidth: 4, borderRightWidth: 4, borderColor: palette.border },
  inset: { ...StyleSheet.absoluteFill, margin: 6, borderWidth: 2, borderTopColor: '#fff6df',
    borderLeftColor: '#fff6df', borderBottomColor: palette.trim, borderRightColor: palette.trim },
  button: { minHeight: 44, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: palette.green,
    borderWidth: 3, borderTopColor: '#dbe8bf', borderLeftColor: '#dbe8bf', borderBottomColor: '#72895f',
    borderRightColor: '#72895f', justifyContent: 'center', alignItems: 'center' },
  buttonText: { textAlign: 'center', fontSize: 13 },
  woodButton: { backgroundColor: palette.wood, borderTopColor: '#fff5e0', borderLeftColor: '#fff5e0',
    borderBottomColor: '#a57473', borderRightColor: '#a57473' },
  selected: { borderColor: palette.border, backgroundColor: palette.gold },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.7, transform: [{ translateY: 1 }] },
  track: { height: 8, backgroundColor: '#dcb5a3', overflow: 'hidden', borderWidth: 2, borderColor: '#a57670' },
  fill: { height: '100%', backgroundColor: '#87a476' },
  switchButton: { minHeight: 44, minWidth: 68, alignItems: 'center', justifyContent: 'center', gap: 2 },
  switchLabel: { fontSize: 12 }, switchTrack: { width: 48, height: 18, borderWidth: 2, borderColor: '#704450', justifyContent: 'center' },
  switchValue: { fontSize: 10, lineHeight: 12, color: '#fff3d9', paddingHorizontal: 2 },
  switchThumb: { position: 'absolute', top: 1, bottom: 1, width: 12, backgroundColor: '#fff3d9' },
});
