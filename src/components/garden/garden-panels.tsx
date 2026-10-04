import { router } from 'expo-router';
import { memo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { categories, clothing, clothingSlots, getClothing, getLevel, getPlant, MAX_LEVEL, MAX_ROAMING_PETS,
  outfitLooks, outfits, pets, plants, unlockedAt, type Category, type ClothingSlot, type PetKind } from '@/game/garden';
import { useGardenState } from '@/game/garden-provider';
import { durationLabel, GardenButton, GardenText, palette, PixelSwitch, WoodPanel } from './garden-ui';
import { PlantSprite } from './sprites';
import { PixelCharacter, PixelPet } from './pixel-sprites';

export type GardenPanelName = 'wardrobe' | 'display' | 'stats' | 'pets';

function PanelFrame({ title, description, children, onClose, native = true, footer }: {
  title: string; description: string; children: React.ReactNode; onClose: () => void;
  native?: boolean; footer?: React.ReactNode;
}) {
  const { state } = useGardenState();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const content = (
    <SafeAreaView style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close panel" style={StyleSheet.absoluteFill} onPress={onClose} />
      <WoodPanel style={[styles.modal, { width: Math.min(width - insets.left - insets.right - 24, 820), maxHeight: height - insets.top - insets.bottom - 24 }]}>
        <View style={styles.heading}>
          <View style={styles.headingCopy}>
            <GardenText style={styles.title}>{title}</GardenText>
            <GardenText style={styles.description}>{description}</GardenText>
          </View>
          <GardenText style={styles.coins}>{state.coins} Coins</GardenText>
          <GardenButton label="Close" tone="wood" onPress={onClose} accessibilityLabel={`Close ${title}`} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator>
          {children}
        </ScrollView>
        <GardenText accessibilityLiveRegion="polite" numberOfLines={2} style={styles.receipt}>{state.message}</GardenText>
        {footer}
      </WoodPanel>
    </SafeAreaView>
  );
  return native ? (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right']} statusBarTranslucent navigationBarTranslucent>
      {content}
    </Modal>
  ) : content;
}

export function SeedShop({ onClose, native = true }: { onClose: () => void; native?: boolean }) {
  const { state, perform } = useGardenState();
  const [category, setCategory] = useState<Category>(getPlant(state.selectedSeed).category);
  const level = getLevel(state.xp), selected = getPlant(state.selectedSeed);
  const usable = !state.session && state.inventory[selected.id] > 0 && selected.unlockLevel <= level;
  return (
    <PanelFrame title="Seed shed" description="One new seed per level: vegetable → fruit → flower." onClose={onClose} native={native}
      footer={<View style={styles.footer}><GardenText>Level {level} · {unlockedAt(level).length} / 45 unlocked</GardenText>
        <GardenButton label={`Use ${selected.name} seed`} onPress={onClose} disabled={!usable} /></View>}>
      <View style={styles.tabs}>
        {categories.map((value) => <GardenButton key={value} label={value} tone="wood" selected={category === value}
          onPress={() => setCategory(value)} style={styles.tab} />)}
      </View>
      <View style={styles.grid}>
        {plants.filter((plant) => plant.category === category).map((plant) => {
          const locked = level < plant.unlockLevel;
          const picked = state.selectedSeed === plant.id;
          const affordable = state.coins >= plant.cost;
          return (
            <View key={plant.id} style={[styles.card, picked && styles.picked, locked && styles.locked]}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Select ${plant.name}, ${state.inventory[plant.id]} owned${locked ? `, unlocks at level ${plant.unlockLevel}` : ''}`}
                accessibilityState={{ selected: picked }} onPress={() => perform({ type: 'selectSeed', id: plant.id })} style={styles.cardChoice}>
                <PlantSprite plant={plant} size={64} />
                <GardenText style={styles.cardTitle}>{plant.name}</GardenText>
                <GardenText style={styles.rarity}>{plant.rarity} · ×{state.inventory[plant.id]} owned</GardenText>
                <GardenText style={styles.detail}>{durationLabel(plant)}</GardenText>
                <GardenText style={styles.detail}>Harvest {plant.coins} coins · {plant.xp} XP</GardenText>
                <GardenText style={styles.detail}>Seed price: {plant.cost} coins</GardenText>
              </Pressable>
              <GardenButton label={locked ? `Locked · Level ${plant.unlockLevel}` : affordable ? `Buy · ${plant.cost} coins` : `Need ${plant.cost} coins`}
                disabled={locked || !affordable} onPress={() => perform({ type: 'buy', id: plant.id })}
                accessibilityLabel={locked ? `${plant.name} locked until level ${plant.unlockLevel}` : `Buy ${plant.name} seed for ${plant.cost} coins`} />
            </View>
          );
        })}
      </View>
    </PanelFrame>
  );
}

function Wardrobe({ onClose }: { onClose: () => void }) {
  const { state, perform } = useGardenState();
  const [slot, setSlot] = useState<ClothingSlot | 'sets'>('hat');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewItem = previewId ? getClothing(previewId) : undefined;
  const previewLook = previewItem ? { ...state.look, [previewItem.slot]: previewItem.id } : state.look;
  const level = getLevel(state.xp);
  return (
    <PanelFrame title="Garden wardrobe" description="Mix hats, tops, pants, glasses and gear. Owned pieces switch for free." onClose={onClose}>
      <WoodPanel style={styles.lookPreview}>
        <PixelCharacter look={previewLook} scale={3} />
        <View style={styles.headingCopy}>
          <GardenText style={styles.title}>{previewItem ? `Preview: ${previewItem.name}` : 'Your garden look'}</GardenText>
          <GardenText style={styles.description}>{clothingSlots.map(({ id }) => getClothing(previewLook[id])?.name).join(' · ')}</GardenText>
          {previewItem && state.look[previewItem.slot] !== previewItem.id && <GardenText style={styles.description}>Choose Buy & wear or Wear to use this piece.</GardenText>}
        </View>
      </WoodPanel>
      <ScrollView horizontal contentContainerStyle={styles.tabs} showsHorizontalScrollIndicator={false}>
        {[...clothingSlots, { id: 'sets' as const, name: 'Outfit sets' }].map((tab) => <GardenButton key={tab.id}
          label={tab.name} tone="wood" selected={slot === tab.id} onPress={() => { setSlot(tab.id); setPreviewId(null); }} />)}
      </ScrollView>
      {slot !== 'sets' ? <View style={styles.grid}>
        {clothing.filter((item) => item.slot === slot).map((item) => {
          const owned = state.ownedClothing.includes(item.id), equipped = state.look[slot] === item.id;
          const locked = level < item.level, affordable = state.coins >= item.cost;
          return <View key={item.id} style={[styles.card, equipped && styles.picked]}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Preview ${item.name}`} style={styles.cardChoice}
              onPress={() => setPreviewId(item.id)}>
              <PixelCharacter look={{ ...state.look, [item.slot]: item.id }} scale={2} />
              <GardenText style={styles.cardTitle}>{item.name}</GardenText>
              <GardenText style={styles.detail}>Level {item.level} · {owned ? 'Owned' : `${item.cost} coins`}</GardenText>
            </Pressable>
            <GardenButton label={equipped ? 'Wearing' : locked ? `Level ${item.level}` : owned ? 'Wear' : `Buy & wear · ${item.cost}`}
              disabled={equipped || locked || (!owned && !affordable)}
              accessibilityLabel={locked ? `${item.name}, locked until level ${item.level}` : owned ? `Wear ${item.name}` : `Buy and wear ${item.name} for ${item.cost} coins`}
              onPress={() => { perform({ type: owned ? 'equipClothing' : 'buyClothing', id: item.id }); setPreviewId(null); }} />
          </View>;
        })}
      </View> :
      <View style={styles.grid}>
        {outfits.map((outfit) => {
          const look = outfitLooks[outfit.id];
          const owned = state.ownedOutfits.includes(outfit.id);
          const equipped = Object.entries(look).every(([key, value]) => state.look[key as ClothingSlot] === value);
          const locked = level < outfit.level, affordable = state.coins >= outfit.cost;
          return <View key={outfit.id} style={[styles.card, equipped && styles.picked]}>
            <PixelCharacter look={look} scale={2} />
            <GardenText style={styles.cardTitle}>{outfit.name}</GardenText>
            <GardenText style={styles.detail}>{outfit.description}</GardenText>
            <GardenText style={styles.detail}>Level {outfit.level} · {owned ? 'Owned' : `${outfit.cost} coins`}</GardenText>
            <GardenButton label={equipped ? 'Equipped' : locked ? `Locked · Level ${outfit.level}` : owned ? 'Equip for free' : `Buy · ${outfit.cost} coins`}
              disabled={equipped || locked || (!owned && !affordable)}
              onPress={() => perform({ type: owned ? 'equipOutfit' : 'buyOutfit', id: outfit.id })} />
          </View>;
        })}
      </View>}
    </PanelFrame>
  );
}

function PetCottage({ onClose, onPlace }: { onClose: () => void; onPlace: (id: PetKind) => void }) {
  const { state, perform } = useGardenState();
  const level = getLevel(state.xp);
  return <PanelFrame title="Pet cottage" description={`Adopt a friend, then tap the grass to place it. Up to ${MAX_ROAMING_PETS} pets can roam together.`} onClose={onClose}>
    <GardenText>{state.roamingPets.length} / {MAX_ROAMING_PETS} roaming · {state.ownedPets.length} adopted</GardenText>
    <View style={styles.grid}>
      {pets.map((pet) => {
        const owned = state.ownedPets.includes(pet.id), roaming = state.roamingPets.some((placed) => placed.id === pet.id);
        const locked = level < pet.level, affordable = state.coins >= pet.cost;
        return <View key={pet.id} style={[styles.card, roaming && styles.picked]}>
          <PixelPet pet={pet} scale={3} />
          <GardenText style={styles.cardTitle}>{pet.name}</GardenText>
          <GardenText style={styles.detail}>{pet.description}</GardenText>
          <GardenText style={styles.detail}>Level {pet.level} · {owned ? roaming ? 'Roaming' : 'In cottage' : pet.cost ? `${pet.cost} coins` : 'Free'}</GardenText>
          {!owned ? <GardenButton label={locked ? `Level ${pet.level}` : pet.cost ? `Adopt · ${pet.cost}` : 'Adopt for free'}
            disabled={locked || !affordable} accessibilityLabel={locked ? `${pet.name}, locked until level ${pet.level}` : `Adopt ${pet.name}${pet.cost ? ` for ${pet.cost} coins` : ' for free'}`}
            onPress={() => perform({ type: 'adoptPet', id: pet.id })} />
            : <GardenButton label={roaming ? 'Move in garden' : 'Place in garden'} onPress={() => onPlace(pet.id)}
              disabled={!roaming && state.roamingPets.length >= MAX_ROAMING_PETS} accessibilityLabel={`Place ${pet.name} in garden`} />}
          {roaming && <GardenButton label="Rest in cottage" tone="wood" onPress={() => perform({ type: 'storePet', id: pet.id })} />}
        </View>;
      })}
    </View>
    <GardenText style={styles.note}>Pets walk, pause and explore on their own. Resting them in the cottage keeps them yours; placing them again costs nothing.</GardenText>
  </PanelFrame>;
}

function DisplayFarm({ onClose, initialSlot }: { onClose: () => void; initialSlot: number }) {
  const { state, perform } = useGardenState();
  const [slot, setSlot] = useState(initialSlot);
  return (
    <PanelFrame title="Display farm" description="Keep finished plants for XP and zero coins. Your collection stays safe." onClose={onClose}>
      <ScrollView horizontal contentContainerStyle={styles.spaces}>
        {state.displaySlots.map((id, index) => {
          const kept = state.keptPlants.find((plant) => plant.id === id);
          return <Pressable key={index} accessibilityRole="button" accessibilityState={{ selected: index === slot }}
            accessibilityLabel={`Choose display space ${index + 1}${kept ? `, ${getPlant(kept.plantId).name}` : ', empty'}`}
            onPress={() => setSlot(index)} style={[styles.space, index === slot && styles.picked]}>
            {kept ? <PlantSprite plant={getPlant(kept.plantId)} size={44} /> : <GardenText style={styles.emptyIcon}>✿</GardenText>}
            <GardenText>{index + 1}</GardenText>
          </Pressable>;
        })}
      </ScrollView>
      <View style={styles.footer}>
        <GardenText style={styles.cardTitle}>Your plants · {state.keptPlants.length}</GardenText>
        <GardenButton tone="wood" label={`Store from space ${slot + 1}`} disabled={!state.displaySlots[slot]}
          onPress={() => perform({ type: 'clearDisplay', slot })} />
      </View>
      {state.keptPlants.length ? <View style={styles.grid}>
        {state.keptPlants.map((kept) => {
          const plant = getPlant(kept.plantId), inSlot = state.displaySlots.indexOf(kept.id);
          return <View key={kept.id} style={styles.card}>
            <PlantSprite plant={plant} size={64} />
            <GardenText style={styles.cardTitle}>{plant.name}</GardenText>
            <GardenText style={styles.detail}>{inSlot < 0 ? 'In collection' : `In display space ${inSlot + 1}`}</GardenText>
            <GardenButton label={inSlot === slot ? 'Displayed' : `Place in space ${slot + 1}`} disabled={inSlot === slot}
              onPress={() => perform({ type: 'placeDisplay', id: kept.id, slot })} />
          </View>;
        })}
      </View> : <View style={styles.empty}>
        <PlantSprite plant={getPlant('daisy')} size={72} />
        <GardenText style={styles.cardTitle}>A little room for your favorites</GardenText>
        <GardenText>Finish growing a plant, then choose Keep for display.</GardenText>
      </View>}
      <GardenText style={styles.note}>Moving and storing give no extra rewards. Replacing a display returns the previous plant to your collection.</GardenText>
    </PanelFrame>
  );
}

function GardenStats({ onClose }: { onClose: () => void }) {
  const { state } = useGardenState();
  const level = getLevel(state.xp), next = plants.find((plant) => plant.unlockLevel === level + 1);
  const stats = [
    ['Garden level', `${level} / ${MAX_LEVEL}`], ['Harvests', state.harvests],
    ['Plants kept', state.keptPlants.length], ['Total XP', state.xp],
    ['Focus time', `${Math.floor(state.focusedSeconds / 60)}m ${state.focusedSeconds % 60}s`],
    ['Seeds unlocked', `${unlockedAt(level).length} / 45`],
    ['Animal friends', `${state.ownedPets.length} adopted · ${state.roamingPets.length} roaming`],
  ];
  return <PanelFrame title="Garden stats" description="A little focus, a little growth. Breaks earn no focus time." onClose={onClose}>
    <View style={styles.grid}>
      {stats.map(([label, value]) => <View key={label} style={styles.stat}>
        <GardenText style={styles.detail}>{label}</GardenText><GardenText style={styles.statValue}>{value}</GardenText>
      </View>)}
    </View>
    {next ? <WoodPanel style={styles.nextSeed}>
      <PlantSprite plant={next} size={64} />
      <View style={styles.headingCopy}>
        <GardenText style={styles.cardTitle}>Next at level {level + 1}: {next.name}</GardenText>
        <GardenText>{100 - state.xp % 100} XP to unlock · {next.category} · {next.rarity}</GardenText>
      </View>
    </WoodPanel> : <GardenText style={styles.note}>All 45 seeds are yours to grow!</GardenText>}
    <GardenText style={styles.note}>Focus time counts completed sessions, including kept plants. Quick play records actual demo seconds.</GardenText>
    <GardenText style={styles.note}>Progress is held in memory for this visit. Reloading the app or restarting its process resets the garden.</GardenText>
  </PanelFrame>;
}

export const GardenPanel = memo(function GardenPanel({ panel, onClose, initialSlot = 0, onPlacePet }: {
  panel: GardenPanelName; onClose: () => void; initialSlot?: number; onPlacePet: (id: PetKind) => void;
}) {
  if (panel === 'wardrobe') return <Wardrobe onClose={onClose} />;
  if (panel === 'pets') return <PetCottage onClose={onClose} onPlace={onPlacePet} />;
  if (panel === 'display') return <DisplayFarm onClose={onClose} initialSlot={initialSlot} />;
  return <GardenStats onClose={onClose} />;
});

export function GardenSettings({ onClose }: { onClose: () => void }) {
  const { state, perform } = useGardenState();
  return <PanelFrame title="Garden settings" description="Choose your pace before planting a seed." onClose={onClose} native={false}>
    <WoodPanel style={styles.settingsRow}>
      <View style={styles.headingCopy}>
        <GardenText style={styles.cardTitle}>Quick play</GardenText>
        <GardenText style={styles.description}>On: 1 focus minute takes 1 second. Off: real focus minutes.</GardenText>
        {state.session && <GardenText style={styles.description}>Finish this plant before changing speed.</GardenText>}
      </View>
      <PixelSwitch label="Quick play" disabled={!!state.session} value={state.quick}
        onChange={(quick) => perform({ type: 'mode', quick })} />
    </WoodPanel>
    <View style={styles.settingsRow}>
      <PixelCharacter look={state.look} scale={2} />
      <GardenText style={styles.headingCopy}>This prototype keeps progress while you switch screens or briefly leave the app. A reload or app process restart resets it. There is no disk save yet.</GardenText>
    </View>
    <GardenButton label="Open existing Explore screen" tone="wood" onPress={() => router.replace('/explore')} />
  </PanelFrame>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#352b3ac4', alignItems: 'center', justifyContent: 'center', padding: 12 },
  modal: { flexShrink: 1, padding: 12 },
  heading: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingBottom: 10 },
  headingCopy: { flex: 1 }, title: { fontSize: 21 },
  lookPreview: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 },
  description: { fontSize: 12, color: palette.muted, marginTop: 3 }, coins: { fontSize: 14 },
  scroll: { flexShrink: 1 }, body: { gap: 12, paddingBottom: 8 },
  tabs: { flexDirection: 'row', gap: 8 }, tab: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '31.8%', flexGrow: 1, maxWidth: '33%', borderWidth: 2, borderColor: '#c99e91',
    backgroundColor: '#fff1df', padding: 8, alignItems: 'center', gap: 6 },
  cardChoice: { alignSelf: 'stretch', alignItems: 'center', gap: 4, paddingBottom: 4, minHeight: 44 },
  cardTitle: { fontSize: 14, textAlign: 'center' }, picked: { borderColor: palette.border, backgroundColor: '#f7e0a9' },
  locked: { backgroundColor: '#eedbcf' }, rarity: { fontSize: 11, color: palette.leaf },
  detail: { fontSize: 11, color: palette.muted, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  receipt: { fontSize: 11, color: palette.muted, marginVertical: 6 },
  spaces: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  space: { width: 64, height: 72, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#b99a89', backgroundColor: '#e2e5b9' },
  emptyIcon: { fontSize: 30, color: palette.leaf },
  empty: { padding: 14, alignItems: 'center', gap: 8 },
  note: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  stat: { width: '31.8%', flexGrow: 1, borderWidth: 1, borderColor: '#c99e91', padding: 12, gap: 6, alignItems: 'center' },
  statValue: { fontSize: 21 }, nextSeed: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 14 },
});
