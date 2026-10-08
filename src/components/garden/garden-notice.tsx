import { useEffect, useState } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useGarden } from '@/game/garden-provider';
import { visibleNotice } from '@/game/notices';
import { GardenText, palette, WoodPanel } from './garden-ui';

export function GardenNotice({ style, compact = false }: { style?: StyleProp<ViewStyle>; compact?: boolean }) {
  const { notice, now } = useGarden();
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    opacity.setValue(1);
    if (!notice) return;
    const animation = Animated.timing(opacity, { toValue: 0, duration: 200,
      delay: Math.max(0, notice.expiresAt - Date.now() - 200), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [notice, opacity]);
  if (!visibleNotice(notice, now)) return null;
  const text = <GardenText accessibilityLiveRegion="polite" numberOfLines={2} style={[styles.text, compact && styles.compactText]}>{notice?.text}</GardenText>;
  return <Animated.View pointerEvents="none" style={[style, { opacity }]}>
    {compact ? text : <WoodPanel style={styles.panel}>{text}</WoodPanel>}
  </Animated.View>;
}

const styles = StyleSheet.create({
  panel: { minHeight: 34, justifyContent: 'center', paddingVertical: 7 },
  text: { fontSize: 12, lineHeight: 14 }, compactText: { color: palette.muted },
});
