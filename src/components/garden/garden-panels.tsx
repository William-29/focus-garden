import { memo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { clothing, clothingSlots, getClothing, getLevel, getPlant, MAX_LEVEL, MAX_ROAMING_PETS,
  outfitLooks, outfitWithFeatures, outfits, pets, plants, unlockedAt, type Category, type ClothingSlot, type PetKind } from '@/game/garden';
import { useGardenState } from '@/game/garden-provider';
import { PET_NAME_LIMIT, normalizePetName, petDisplayName } from '@/game/pet-names';
import { nameLimits, normalizeName } from '@/game/personalization';
import { durationLabel, GardenButton, GardenText, palette, PixelSwitch, ProgressBar, WoodPanel } from './garden-ui';
import { GardenNotice } from './garden-notice';
import { PlantSprite } from './sprites';
import { PixelCharacter, PixelPet } from './pixel-sprites';
import { PixelCoin, PixelSeason } from './pixel-garden-art';
import { seasons, seasonNames, seasonDescriptions } from '@/game/seasons';
import { farmerStyles } from '@/game/farmer';
import { GreenhouseBay } from './display-greenhouse';
import { SeasonLoading } from './season-loading';

export type GardenPanelName = 'wardrobe' | 'display' | 'stats' | 'pets' | 'names' | 'seasons';

function PanelFrame({ title, description, children, onClose, native = true, footer, keyboard = false, compact = false }: {
  title: string; description: string; children: React.ReactNode; onClose: () => void;
  native?: boolean; footer?: React.ReactNode; keyboard?: boolean; compact?: boolean;
}) {
  const { state, scene } = useGardenState();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const content = (
    <View style={{ flex: 1 }}>
    <SafeAreaView style={styles.overlay} pointerEvents={scene.phase === 'ready' ? 'auto' : 'none'}
      accessibilityElementsHidden={scene.phase !== 'ready'} importantForAccessibility={scene.phase === 'ready' ? 'auto' : 'no-hide-descendants'}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close panel" style={StyleSheet.absoluteFill} onPress={onClose} />
      <WoodPanel style={[styles.modal, compact && styles.compactModal, { width: Math.min(width - insets.left - insets.right - 24, 820), maxHeight: height - insets.top - insets.bottom - 24 }]}>
        <View style={[styles.heading, compact && styles.compactHeading]}>
          <View style={styles.headingCopy}>
            <GardenText style={[styles.title, compact && { fontSize: 16 }]}>{title}</GardenText>
            {!compact && <GardenText style={styles.description}>{description}</GardenText>}
          </View>
          {!compact && <View style={styles.coinBalance}><PixelCoin size={24} /><GardenText style={styles.coins}>{state.coins}</GardenText></View>}
          <GardenButton label="Close" tone="wood" onPress={onClose} accessibilityLabel={`Close ${title}`} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {!compact && <GardenNotice compact style={{ marginVertical: 6 }} />}
        {footer}
      </WoodPanel>
    </SafeAreaView>
    <SeasonLoading />
    </View>
  );
  return native ? (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right']} statusBarTranslucent navigationBarTranslucent>
      {keyboard ? <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>{content}</KeyboardAvoidingView> : content}
    </Modal>
  ) : content;
}

function GardenNamesEditor({ onClose }: { onClose: () => void }) {
  const { state, perform, namesStorageWarning } = useGardenState();
  const [characterName, setCharacterName] = useState(state.characterName);
  const [gardenName, setGardenName] = useState(state.gardenName);
  const valid = !!normalizeName(characterName, nameLimits.characterName) && !!normalizeName(gardenName, nameLimits.gardenName);
  function save() {
    if (!valid) return;
    perform({ type: 'rename', characterName, gardenName });
    Keyboard.dismiss();
    onClose();
  }
  return <PanelFrame title="Character & garden names" description="Name your gardener and your little patch of green." onClose={onClose} keyboard compact>
    <View style={styles.nameFields}>
      <View style={styles.nameField}><GardenText style={styles.description}>Character name</GardenText>
        <TextInput accessibilityLabel="Character name" value={characterName} onChangeText={setCharacterName}
          maxLength={nameLimits.characterName} selectTextOnFocus autoCorrect={false} disableFullscreenUI returnKeyType="done"
          onSubmitEditing={save} style={styles.nameInput} placeholder="George" placeholderTextColor={palette.muted} />
      </View>
      <View style={styles.nameField}><GardenText style={styles.description}>Garden name</GardenText>
        <TextInput accessibilityLabel="Garden name" value={gardenName} onChangeText={setGardenName}
          maxLength={nameLimits.gardenName} selectTextOnFocus autoCorrect={false} disableFullscreenUI returnKeyType="done"
          onSubmitEditing={save} style={styles.nameInput} placeholder="Clover Corner" placeholderTextColor={palette.muted} />
      </View>
    </View>
    <GardenText style={styles.note}>{namesStorageWarning ?? 'Names save on this device. Tap either name in the garden to edit it again.'}</GardenText>
    <GardenButton label="Save names" disabled={!valid} onPress={save} />
  </PanelFrame>;
}

export function PetNameEditor({ id, onClose }: { id: PetKind; onClose: () => void }) {
  const { state, perform, petNamesStorageWarning } = useGardenState();
  const pet = pets.find((item) => item.id === id)!;
  const [name, setName] = useState(() => petDisplayName(pet, state.petNames));
  const valid = !!normalizePetName(name) && state.ownedPets.includes(id);
  function close() { Keyboard.dismiss(); onClose(); }
  function save() {
    if (!valid) return;
    perform({ type: 'renamePet', id, name });
    close();
  }
  return <PanelFrame title="Name your pet" description="Your friend will wait while you choose a name." onClose={close} keyboard compact>
    <View style={styles.petNameRow}>
      <PixelPet pet={pet} scale={pet.baby ? 2 : 1.75} />
      <View style={styles.nameField}>
        <GardenText style={styles.description}>Pet name</GardenText>
        <TextInput accessibilityLabel="Pet name" value={name} onChangeText={setName}
          maxLength={PET_NAME_LIMIT} selectTextOnFocus autoCorrect={false} disableFullscreenUI returnKeyType="done"
          onSubmitEditing={save} style={styles.nameInput} placeholder={pet.name} placeholderTextColor={palette.muted} />
      </View>
    </View>
    <GardenText style={styles.note}>{petNamesStorageWarning ?? 'Names save on this device. Save or close to let your pet roam again.'}</GardenText>
    <GardenButton label="Save name" disabled={!valid} onPress={save} />
  </PanelFrame>;
}

const seedShedCategories: Category[] = ['Vegetables', 'Fruits', 'Flowers'];

export function SeedShop({ onClose, native = true }: { onClose: () => void; native?: boolean }) {
  const { state, perform } = useGardenState();
  const [category, setCategory] = useState<Category>(getPlant(state.selectedSeed).category);
  const [columns, setColumns] = useState<3 | 5>(3);
  const [gridWidth, setGridWidth] = useState(0);
  const compact = columns === 5, gridGap = compact ? 8 : 10;
  const cardWidth = gridWidth > 0 ? Math.floor((gridWidth - (columns - 1) * gridGap) / columns) : undefined;
  const level = getLevel(state.xp), selected = getPlant(state.selectedSeed);
  const usable = !state.session && state.inventory[selected.id] > 0 && selected.unlockLevel <= level;
  return (
    <PanelFrame title="Seed shed" description="One new seed per level: vegetable → fruit → flower." onClose={onClose} native={native}
      footer={<View style={styles.footer}><GardenText>Level {level} · {unlockedAt(level).length} / 45 unlocked</GardenText>
        <GardenButton label={`Use ${selected.name} seed`} onPress={onClose} disabled={!usable} /></View>}>
      <View style={styles.tabs}>
        {seedShedCategories.map((value) => <GardenButton key={value} label={value} tone="wood" selected={category === value}
          onPress={() => setCategory(value)} style={styles.tab} />)}
        <GardenButton label="5 per row" tone="wood" selected={compact}
          accessibilityLabel={compact ? 'Switch to three plants per row' : 'Switch to five plants per row'}
          onPress={() => setColumns((value) => value === 3 ? 5 : 3)} style={styles.seedLayoutButton} />
      </View>
      <View style={[styles.grid, { gap: gridGap }]} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
        {plants.filter((plant) => plant.category === category).map((plant) => {
          const locked = level < plant.unlockLevel;
          const picked = state.selectedSeed === plant.id;
          const affordable = state.coins >= plant.cost;
          return (
            <View key={plant.id} style={[styles.card, compact && styles.compactSeedCard,
              cardWidth !== undefined && { width: cardWidth, maxWidth: cardWidth, flexGrow: 0 },
              picked && styles.picked, locked && styles.locked]}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Select ${plant.name}, ${state.inventory[plant.id]} owned${locked ? `, unlocks at level ${plant.unlockLevel}` : ''}`}
                accessibilityState={{ selected: picked }} onPress={() => perform({ type: 'selectSeed', id: plant.id })} style={styles.cardChoice}>
                <PlantSprite plant={plant} size={compact ? 48 : 64} />
                <GardenText style={[styles.cardTitle, compact && styles.compactSeedTitle]}>{plant.name}</GardenText>
                <GardenText style={styles.rarity}>{plant.rarity} · ×{state.inventory[plant.id]} owned</GardenText>
                <GardenText style={styles.detail}>{durationLabel(plant)}</GardenText>
                <GardenText style={styles.detail} accessibilityLabel={`Harvest ${plant.coins} coins and ${plant.xp} XP`}>{compact ? '' : 'Harvest '}{plant.coins} coins · {plant.xp} XP</GardenText>
                <GardenText style={styles.detail}>{compact ? 'Seed' : 'Seed price'}: {plant.cost} coins</GardenText>
              </Pressable>
              <GardenButton label={locked ? `${compact ? 'Level' : 'Locked · Level'} ${plant.unlockLevel}`
                : affordable ? `Buy · ${plant.cost}${compact ? '' : ' coins'}` : `Need ${plant.cost}${compact ? '' : ' coins'}`}
                style={compact ? styles.compactSeedBuy : undefined}
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
  const { state, perform, farmerStorageWarning, namesStorageWarning } = useGardenState();
  const [characterName, setCharacterName] = useState(state.characterName);
  const normalizedName = normalizeName(characterName, nameLimits.characterName);
  function saveCharacterName() {
    if (!normalizedName) return;
    perform({ type: 'rename', characterName: normalizedName, gardenName: state.gardenName });
    setCharacterName(normalizedName);
    Keyboard.dismiss();
  }
  const [slot, setSlot] = useState<ClothingSlot | 'sets'>('hat');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showHat, setShowHat] = useState(true);
  const previewItem = previewId ? getClothing(previewId) : undefined;
  const previewLook = previewItem ? { ...state.look, [previewItem.slot]: previewItem.id } : state.look;
  const level = getLevel(state.xp);
  return (
    <PanelFrame title="Garden wardrobe" description="Mix hair, hats, clothes, masks, beards and gear. Make this little gardener yours." onClose={onClose} keyboard>
      <View style={styles.nameFields}>
        <View style={styles.nameField}><GardenText style={styles.description}>Character name</GardenText>
          <TextInput accessibilityLabel="Character name in wardrobe" value={characterName} onChangeText={setCharacterName}
            maxLength={nameLimits.characterName} selectTextOnFocus autoCorrect={false} disableFullscreenUI returnKeyType="done"
            onSubmitEditing={saveCharacterName} style={styles.nameInput} placeholder="George" placeholderTextColor={palette.muted} />
        </View>
        <GardenButton label="Save name" disabled={!normalizedName || normalizedName === state.characterName} onPress={saveCharacterName} />
      </View>
      {namesStorageWarning && <GardenText accessibilityLiveRegion="polite" style={styles.note}>{namesStorageWarning}</GardenText>}
      <View style={styles.farmerChoices}>
        <GardenText style={styles.cardTitle}>Your farmer</GardenText>
        {farmerStyles.map((farmerStyle) => <GardenButton key={farmerStyle} label={farmerStyle === 'girl' ? 'Girl' : 'Boy'}
          accessibilityLabel={`Choose ${farmerStyle} farmer`} selected={state.farmerStyle === farmerStyle} tone="wood"
          onPress={() => perform({ type: 'setFarmer', farmerStyle })} />)}
        <GardenText style={styles.detail}>Free to switch. Both can wear every piece.</GardenText>
      </View>
      {farmerStorageWarning && <GardenText accessibilityLiveRegion="polite" style={styles.note}>{farmerStorageWarning}</GardenText>}
      <WoodPanel style={styles.lookPreview}>
        <PixelCharacter look={showHat ? previewLook : { ...previewLook, hat: 'bare-head' }} farmerStyle={state.farmerStyle} scale={3} />
        <View style={styles.headingCopy}>
          <GardenText style={styles.title}>{previewItem ? `Preview: ${previewItem.name}` : 'Your garden look'}</GardenText>
          <GardenText style={styles.description}>{clothingSlots.map(({ id }) => getClothing(previewLook[id])?.name).join(' · ')}</GardenText>
          {previewItem && state.look[previewItem.slot] !== previewItem.id && <GardenText style={styles.description}>Choose Buy & wear or Wear to use this piece.</GardenText>}
          <GardenButton label={showHat ? 'Preview without hat' : 'Show equipped hat'} tone="wood" onPress={() => setShowHat((value) => !value)} />
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
              <PixelCharacter look={{ ...state.look, ...(!showHat && slot !== 'hat' ? { hat: 'bare-head' } : {}), [item.slot]: item.id }} farmerStyle={state.farmerStyle} scale={2} />
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
          const look = outfitWithFeatures(state.look, outfitLooks[outfit.id]);
          const owned = state.ownedOutfits.includes(outfit.id);
          const equipped = Object.entries(look).every(([key, value]) => state.look[key as ClothingSlot] === value);
          const locked = level < outfit.level, affordable = state.coins >= outfit.cost;
          return <View key={outfit.id} style={[styles.card, equipped && styles.picked]}>
            <PixelCharacter look={look} farmerStyle={state.farmerStyle} scale={2} />
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

function PetCottage({ onClose, onPlace, onRename }: { onClose: () => void; onPlace: (id: PetKind) => void; onRename: (id: PetKind) => void }) {
  const { state, perform } = useGardenState();
  const level = getLevel(state.xp);
  return <PanelFrame title="Pet cottage" description={`Start with a free grown-up dog. Unlock cats, bunnies and little ones as you grow. Up to ${MAX_ROAMING_PETS} pets can roam.`} onClose={onClose}>
    <GardenText>{state.roamingPets.length} / {MAX_ROAMING_PETS} roaming · {state.ownedPets.length} adopted</GardenText>
    <View style={styles.grid}>
      {pets.map((pet) => {
        const owned = state.ownedPets.includes(pet.id), roaming = state.roamingPets.some((placed) => placed.id === pet.id);
        const locked = level < pet.level, affordable = state.coins >= pet.cost;
        return <View key={pet.id} style={[styles.card, roaming && styles.picked]}>
          <PixelPet pet={pet} scale={pet.baby ? 2.5 : 2.25} />
          <GardenText style={styles.cardTitle}>{petDisplayName(pet, state.petNames)}</GardenText>
          <GardenText style={styles.detail}>{pet.description}</GardenText>
          <GardenText style={styles.detail}>Level {pet.level} · {owned ? roaming ? 'Roaming' : 'In cottage' : pet.cost ? `${pet.cost} coins` : 'Free'}</GardenText>
          {!owned ? <GardenButton label={locked ? `Level ${pet.level}` : pet.cost ? `Adopt · ${pet.cost}` : 'Adopt for free'}
            disabled={locked || !affordable} accessibilityLabel={locked ? `${pet.name}, locked until level ${pet.level}` : `Adopt ${pet.name}${pet.cost ? ` for ${pet.cost} coins` : ' for free'}`}
            onPress={() => perform({ type: 'adoptPet', id: pet.id })} />
            : <GardenButton label={roaming ? 'Move in garden' : 'Place in garden'} onPress={() => onPlace(pet.id)}
              disabled={!roaming && state.roamingPets.length >= MAX_ROAMING_PETS} accessibilityLabel={`Place ${petDisplayName(pet, state.petNames)} in garden`} />}
          {owned && <GardenButton label="Name pet" tone="wood" onPress={() => onRename(pet.id)} />}
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
    <PanelFrame title="Display greenhouse" description="Eight sheltered display bays for your favorite plants. Tap a bay to arrange it." onClose={onClose}>
      <ScrollView horizontal contentContainerStyle={styles.spaces}>
        {state.displaySlots.map((id, index) => {
          const kept = state.keptPlants.find((plant) => plant.id === id);
          return <GreenhouseBay key={index} plant={kept ? getPlant(kept.plantId) : null} index={index}
            selected={index === slot} onPress={() => setSlot(index)} />;
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
    ['Plants kept', state.keptPlants.length], ['Total XP', state.xp], ['Completed sessions', state.completed],
    ['Focus time', `${Math.floor(state.focusedSeconds / 60)}m ${state.focusedSeconds % 60}s`],
    ['Seeds unlocked', `${unlockedAt(level).length} / 45`],
    ['Animal friends', `${state.ownedPets.length} adopted · ${state.roamingPets.length} roaming`],
    ['Seeds in bag', Object.values(state.inventory).reduce((total, count) => total + count, 0)],
    ['Wardrobe pieces', clothing.filter((item) => item.style !== 'none' && state.ownedClothing.includes(item.id)).length],
  ];
  return <PanelFrame title="Gardener profile" description={state.gardenName} onClose={onClose}>
    <WoodPanel style={styles.profile}>
      <PixelCharacter look={state.look} farmerStyle={state.farmerStyle} scale={2} />
      <View style={styles.headingCopy}>
        <GardenText style={styles.profileName}>{state.characterName}</GardenText>
        <GardenText style={styles.description}>Level {level} · {level === MAX_LEVEL ? 'Master gardener' : 'Growing gardener'}</GardenText>
        <GardenText style={styles.description}>{level === MAX_LEVEL ? 'All seeds unlocked' : `${100 - state.xp % 100} XP to level ${level + 1}`}</GardenText>
        <ProgressBar value={level === MAX_LEVEL ? 1 : state.xp % 100 / 100} label="XP to next garden level" />
      </View>
    </WoodPanel>
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

export const GardenPanel = memo(function GardenPanel({ panel, onClose, initialSlot = 0, onPlacePet, onRenamePet }: {
  panel: GardenPanelName; onClose: () => void; initialSlot?: number; onPlacePet: (id: PetKind) => void; onRenamePet: (id: PetKind) => void;
}) {
  if (panel === 'wardrobe') return <Wardrobe onClose={onClose} />;
  if (panel === 'names') return <GardenNamesEditor onClose={onClose} />;
  if (panel === 'seasons') return <PanelFrame title="Garden season" description="Choose the season that helps you settle in." onClose={onClose}><SeasonChooser onChoose={onClose} /></PanelFrame>;
  if (panel === 'pets') return <PetCottage onClose={onClose} onPlace={onPlacePet} onRename={onRenamePet} />;
  if (panel === 'display') return <DisplayFarm onClose={onClose} initialSlot={initialSlot} />;
  return <GardenStats onClose={onClose} />;
});

function SeasonChooser({ onChoose }: { onChoose: () => void }) {
  const { state, perform, seasonStorageWarning } = useGardenState();
  return <>
    <View style={styles.seasonOptions}>{seasons.map((season) => <View key={season} style={styles.seasonOption}>
      <PixelSeason season={season} size={32} />
      <GardenButton label={seasonNames[season]} selected={state.season === season} tone="wood"
        onPress={() => { perform({ type: 'setSeason', season }); onChoose(); }} />
    </View>)}</View>
    <GardenText style={styles.note}>{seasonDescriptions[state.season]} Your choice saves on this device.</GardenText>
    {seasonStorageWarning && <GardenText accessibilityLiveRegion="polite" style={styles.note}>{seasonStorageWarning}</GardenText>}
  </>;
}

export function GardenSettings({ onClose }: { onClose: () => void }) {
  const { state, perform } = useGardenState();
  const [editingNames, setEditingNames] = useState(false);
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
    <GardenText style={styles.cardTitle}>Garden season</GardenText>
    <SeasonChooser onChoose={onClose} />
    <GardenButton label="Rename character & garden" tone="wood" onPress={() => setEditingNames(true)} />
    <View style={styles.settingsRow}>
      <PixelCharacter look={state.look} farmerStyle={state.farmerStyle} scale={2} />
      <GardenText style={styles.headingCopy}>Your names, farmer choice and season save on this device. Garden progress stays for this visit while you switch screens or briefly leave the app; a reload or app process restart resets progress.</GardenText>
    </View>
    {editingNames && <GardenNamesEditor onClose={() => setEditingNames(false)} />}
  </PanelFrame>;
}

const styles = StyleSheet.create({
  farmerChoices: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 12 },
  seasonOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  seasonOption: { minWidth: 105, flex: 1, alignItems: 'center', gap: 8 },
  overlay: { flex: 1, backgroundColor: '#352b3ac4', alignItems: 'center', justifyContent: 'center', padding: 12 },
  modal: { flexShrink: 1, padding: 12 },
  compactModal: { padding: 8 }, compactHeading: { paddingBottom: 4 },
  heading: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingBottom: 10 },
  headingCopy: { flex: 1 }, title: { fontSize: 21 },
  lookPreview: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 },
  description: { fontSize: 12, color: palette.muted, marginTop: 3 }, coins: { fontSize: 14 },
  coinBalance: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  petNameRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nameFields: { flexDirection: 'row', gap: 12 }, nameField: { flex: 1, gap: 4 },
  nameInput: { minHeight: 44, backgroundColor: '#fff3df', borderWidth: 2, borderColor: palette.border,
    paddingHorizontal: 10, paddingVertical: 6, color: palette.ink, fontFamily: 'GardenPixel', fontSize: 16 },
  scroll: { flexShrink: 1 }, body: { gap: 12, paddingBottom: 8 },
  tabs: { flexDirection: 'row', gap: 8 }, tab: { flex: 1 },
  seedLayoutButton: { minWidth: 100, paddingHorizontal: 6 },
  compactSeedCard: { padding: 6, gap: 4 },
  compactSeedTitle: { fontSize: 12 },
  compactSeedBuy: { alignSelf: 'stretch', paddingHorizontal: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '31.8%', flexGrow: 1, maxWidth: '33%', borderWidth: 2, borderColor: '#c99e91',
    backgroundColor: '#fff1df', padding: 8, alignItems: 'center', gap: 6 },
  cardChoice: { alignSelf: 'stretch', alignItems: 'center', gap: 4, paddingBottom: 4, minHeight: 44 },
  cardTitle: { fontSize: 14, textAlign: 'center' }, picked: { borderColor: palette.border, backgroundColor: '#f7e0a9' },
  locked: { backgroundColor: '#eedbcf' }, rarity: { fontSize: 11, color: palette.leaf },
  detail: { fontSize: 11, color: palette.muted, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  spaces: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  empty: { padding: 14, alignItems: 'center', gap: 8 },
  note: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  stat: { width: '31.8%', flexGrow: 1, borderWidth: 1, borderColor: '#c99e91', padding: 12, gap: 6, alignItems: 'center' },
  statValue: { fontSize: 21 }, nextSeed: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 }, profileName: { fontSize: 21 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 14 },
});
