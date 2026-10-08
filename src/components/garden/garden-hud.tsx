import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLevel, MAX_LEVEL } from '@/game/garden';
import { localGardenDate, seasonNames, type Season } from '@/game/seasons';
import { GardenText, palette, ProgressBar, WoodPanel, useGardenControlScale, useGardenControlStyles } from './garden-ui';
import { PixelCoin, PixelSeason } from './pixel-garden-art';

export const GardenHud = memo(function GardenHud({ minute, coins, xp, season, left, right, top, onProfile, onSeason }: {
  minute: number; coins: number; xp: number; season: Season; left: number; right: number; top: number;
  onProfile: () => void; onSeason: () => void;
}) {
  const scale = useGardenControlScale();
  const controlStyles = useGardenControlStyles(styles);
  const local = localGardenDate(minute), level = getLevel(xp);
  return <View pointerEvents="box-none" style={[controlStyles.header, { left, right, top }]}>
    <View style={controlStyles.leftGroup}>
      <WoodPanel style={controlStyles.clockPanel}>
        <View accessible accessibilityLabel={`Local time ${local.time}, ${local.date}`} style={controlStyles.dateCopy}>
          <GardenText style={controlStyles.time}>{local.time}</GardenText>
          <GardenText style={controlStyles.date}>{local.date}</GardenText>
        </View>
        <View accessible accessibilityLabel={`${coins} coins`} style={controlStyles.balance}>
          <PixelCoin size={22 * scale} /><GardenText style={controlStyles.coins}>{coins}</GardenText>
        </View>
      </WoodPanel>
      <Pressable accessibilityRole="button" accessibilityLabel={`${seasonNames[season]}, choose garden season`} onPress={onSeason}>
        <WoodPanel style={controlStyles.season}><PixelSeason season={season} size={18 * scale} /><GardenText style={controlStyles.date}>{seasonNames[season]}</GardenText></WoodPanel>
      </Pressable>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Open gardener profile, level ${level}, ${xp} XP`} onPress={onProfile}>
      <WoodPanel style={controlStyles.profile}>
        <GardenText style={controlStyles.level}>Lv {level}</GardenText>
        <View style={controlStyles.xpCopy}>
          <GardenText style={controlStyles.date}>{level === MAX_LEVEL ? 'MAX XP' : `${xp % 100} / 100 XP`}</GardenText>
          <ProgressBar value={level === MAX_LEVEL ? 1 : xp % 100 / 100} label="XP to next garden level" />
        </View>
      </WoodPanel>
    </Pressable>
  </View>;
});

export function GardenSign({ name, season, left, top, width, onRename }: { name: string; season: Season; left: number; top: number; width: number; onRename: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Rename garden, ${name}`} onPress={onRename}
    hitSlop={{ top: 3, bottom: 3, left: 0, right: 0 }} style={[styles.sign, { left, top, width }]}>
    <View pointerEvents="none" style={styles.post}><View style={styles.postLight} /></View>
    <View pointerEvents="none" style={[styles.foot, season === 'winter' && { backgroundColor: '#effaff' }]} />
    <View pointerEvents="none" style={styles.board}>
      <View style={styles.boardInset} /><View style={styles.grain} />
      <View style={[styles.grain, { top: 20, left: 7, width: 18 }]} /><View style={styles.woodKnot} />
      <View style={styles.nail} /><View style={[styles.nail, { left: undefined, right: 3 }]} />
      <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.signText}>{name}</Text>
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  header: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 4 },
  leftGroup: { flexDirection: 'row', gap: 5, alignItems: 'flex-start' },
  clockPanel: { minHeight: 46, padding: 7, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateCopy: { gap: 1 }, time: { fontSize: 17, color: palette.ink }, date: { fontSize: 12, color: palette.muted },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 7, borderLeftWidth: 2, borderColor: palette.trim },
  coins: { fontSize: 17 }, season: { minHeight: 46, padding: 7, alignItems: 'center', justifyContent: 'center', gap: 1 },
  profile: { minHeight: 46, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  level: { fontSize: 16, color: palette.ink }, xpCopy: { gap: 3 },
  sign: { position: 'absolute', height: 38, alignItems: 'center', zIndex: 2 },
  post: { position: 'absolute', top: 18, width: 6, height: 19, backgroundColor: '#a8754d', borderRightWidth: 2, borderColor: '#654a42' },
  postLight: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 1, backgroundColor: '#e6ba81' },
  foot: { position: 'absolute', bottom: 0, width: 14, height: 3, backgroundColor: '#8f6a51' },
  board: { height: 26, width: '100%', justifyContent: 'center', backgroundColor: '#d8aa70', borderWidth: 2,
    borderTopColor: '#f9d697', borderLeftColor: '#f3cb8c', borderBottomColor: '#775340', borderRightColor: '#775340', paddingHorizontal: 7 },
  boardInset: { ...StyleSheet.absoluteFill, margin: 1, borderWidth: 1, borderTopColor: '#ba8656', borderLeftColor: '#ba8656', borderBottomColor: '#ecc487', borderRightColor: '#ecc487' },
  signText: { fontFamily: 'GardenPixel', fontSize: 9, lineHeight: 10, color: '#583f38', textAlign: 'center' },
  grain: { position: 'absolute', top: 2, right: 5, width: 18, height: 1, backgroundColor: '#b78b60' },
  woodKnot: { position: 'absolute', bottom: 2, right: 10, width: 5, height: 2, borderWidth: 1, borderColor: '#b17e50' },
  nail: { position: 'absolute', left: 3, top: 10, width: 2, height: 2, backgroundColor: '#795d50' },
});
