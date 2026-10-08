import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { formatClock, GardenText, useGardenControlScale } from './garden-ui';

// Small connected segments keep the ring lightweight and pixel-art friendly.
const segments = 48;
export const GrowthWheel = memo(function GrowthWheel({ progress, remaining, ready = false, size = 54 }: {
  progress: number; remaining: number; ready?: boolean; size?: number;
}) {
  const scale = useGardenControlScale();
  const value = ready ? 1 : Math.max(0, Math.min(1, progress));
  const stroke = 3 * scale, radius = (size - stroke) / 2;
  const length = Math.PI * 2 * radius / segments + 0.7 * scale;
  const clock = formatClock(ready ? 0 : remaining);
  return <View accessible accessibilityRole="timer" accessibilityLabel={ready ? "Plant ready to harvest" : "Growing, " + clock + " remaining"}
    pointerEvents="none" style={[styles.wheel, { width: size, height: size, borderRadius: size / 2 }]}>
    {Array.from({ length: segments }, (_, index) => {
      const angle = index * Math.PI * 2 / segments - Math.PI / 2;
      return <View key={index} style={{ position: "absolute", width: length, height: stroke,
        left: size / 2 + Math.cos(angle) * radius - length / 2,
        top: size / 2 + Math.sin(angle) * radius - stroke / 2,
        backgroundColor: index < value * segments ? "#55a349" : "#bbb8a1",
        transform: [{ rotate: (index * 360 / segments) + "deg" }] }} />;
    })}
    <GardenText style={[styles.clock, { fontSize: size / scale < 52 ? 10 : 12 }]}>{clock}</GardenText>
  </View>;
});

const styles = StyleSheet.create({
  wheel: { backgroundColor: "#fff1dbea", alignItems: "center", justifyContent: "center" },
  clock: { color: "#425138", fontVariant: ["tabular-nums"] },
});
