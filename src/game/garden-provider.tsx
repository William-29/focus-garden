import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useCompletionSound } from '@/hooks/use-completion-sound';

import { pets, type Action, type GardenState } from './garden';
import { parsePetNames } from './pet-names';
import { parseNames } from './personalization';
import { gardenUIReducer, initialGardenUI, type GardenNotice, type HarvestEvent } from './notices';
import { isSeason } from './seasons';
import { isFarmerStyle } from './farmer';
import { SCENE_TIMEOUT_MS, type SceneTransition, type SceneAction } from './scene-transition';
const NAMES_KEY = 'focus-garden:names:v1';
const SEASON_KEY = 'focus-garden:season:v1';
const FARMER_KEY = 'focus-garden:farmer:v1';
const PET_NAMES_KEY = 'focus-garden:pet-names:v1';

type GardenContextValue = {
  state: GardenState;
  perform: (action: Action) => void;
  namesStorageWarning: string | null;
  seasonStorageWarning: string | null;
  farmerStorageWarning: string | null;
  petNamesStorageWarning: string | null;
  notice: GardenNotice | null;
  harvest: HarvestEvent | null;
  scene: SceneTransition;
  sceneAction: (action: SceneAction) => void;
};

const GardenContext = createContext<GardenContextValue | null>(null);
const GardenClock = createContext<number | null>(null);

// Focus progress stays in memory. Names, pet names, farmer choice and season are saved.
export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [model, dispatch] = useReducer(gardenUIReducer, undefined, initialGardenUI);
  const { state, notice, harvest, scene } = model;
  const prepareCompletionSound = useCompletionSound(model.completionSound);
  const sceneAction = useCallback((action: SceneAction) => dispatch({ type: 'scene', action }), []);
  const [now, setNow] = useState(Date.now);
  const [namesStorageWarning, setNamesStorageWarning] = useState<string | null>(null);
  const [seasonStorageWarning, setSeasonStorageWarning] = useState<string | null>(null);
  const [farmerStorageWarning, setFarmerStorageWarning] = useState<string | null>(null);
  const [petNamesStorageWarning, setPetNamesStorageWarning] = useState<string | null>(null);
  const [petNamesLoaded, setPetNamesLoaded] = useState(false);
  const editedNames = useRef(false);
  const editedSeason = useRef(false);
  const editedFarmer = useRef(false);
  const saves = useRef(Promise.resolve());

  const perform = useCallback((action: Action) => {
    if (action.type === 'plant' || action.type === 'plantSeed' || action.type === 'resume' || action.type === 'next') prepareCompletionSound();
    const timestamp = Date.now();
    setNow(timestamp);
    dispatch({ type: 'perform', action, now: timestamp });
    if (action.type === 'setFarmer' && isFarmerStyle(action.farmerStyle)) {
      editedFarmer.current = true;
      saves.current = saves.current.then(async () => {
        try {
          await AsyncStorage.setItem(FARMER_KEY, action.farmerStyle);
          setFarmerStorageWarning(null);
        } catch { setFarmerStorageWarning('Farmer changed for this visit, but could not be saved on this device.'); }
      });
    }
    if (action.type === 'setSeason' && isSeason(action.season)) {
      editedSeason.current = true;
      saves.current = saves.current.then(async () => {
        try {
          await AsyncStorage.setItem(SEASON_KEY, action.season);
          setSeasonStorageWarning(null);
        } catch { setSeasonStorageWarning('Season changed for this visit, but could not be saved on this device.'); }
      });
    }
    if (action.type === 'rename') {
      const names = parseNames(JSON.stringify(action));
      if (!names) return;
      editedNames.current = true;
      saves.current = saves.current.then(async () => {
        try {
          await AsyncStorage.setItem(NAMES_KEY, JSON.stringify(names));
          setNamesStorageWarning(null);
        } catch { setNamesStorageWarning('Names changed for this visit, but could not be saved on this device.'); }
      });
    }
  }, [prepareCompletionSound]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => dispatch({ type: 'expireNotice', id: notice.id }), Math.max(0, notice.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!harvest) return;
    const timer = setTimeout(() => dispatch({ type: 'expireHarvest', id: harvest.id }), Math.max(0, harvest.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [harvest]);

  useEffect(() => {
    if (scene.phase === 'ready' || scene.phase === 'error') return;
    const displayed = scene.phase === 'displayed' && scene.artReady;
    const deadline = displayed ? scene.readyAt : scene.startedAt + SCENE_TIMEOUT_MS;
    const timer = setTimeout(() => sceneAction({ type: displayed ? 'finish' : 'failed', id: scene.id, now: Date.now() }), Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [scene, sceneAction]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(PET_NAMES_KEY).then((value) => {
      if (active) dispatch({ type: 'perform', action: { type: 'restorePetNames', names: parsePetNames(value, pets) }, now: Date.now() });
    }).catch(() => {
      if (active) setPetNamesStorageWarning('Saved pet names could not be read. You can still name your pets.');
    }).finally(() => { if (active) setPetNamesLoaded(true); });
    AsyncStorage.getItem(NAMES_KEY).then((value) => {
      const names = parseNames(value);
      // A delayed read must never replace a name the player has just entered.
      if (active && names && !editedNames.current) dispatch({ type: 'perform', action: { type: 'restoreNames', ...names }, now: Date.now() });
    }).catch(() => {
      if (active) setNamesStorageWarning('Saved names could not be read. You can still rename your garden.');
    });
    AsyncStorage.getItem(SEASON_KEY).then((season) => {
      if (active && isSeason(season) && !editedSeason.current) dispatch({ type: 'perform', action: { type: 'setSeason', season }, now: Date.now() });
    }).catch(() => {
      if (active) setSeasonStorageWarning('Saved season could not be read. Choose your season again.');
    });
    AsyncStorage.getItem(FARMER_KEY).then((farmerStyle) => {
      if (active && isFarmerStyle(farmerStyle) && !editedFarmer.current) dispatch({ type: 'perform', action: { type: 'setFarmer', farmerStyle }, now: Date.now() });
    }).catch(() => {
      if (active) setFarmerStorageWarning('Saved farmer could not be read. Choose your farmer again.');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const timestamp = Date.now();
      setNow(timestamp);
      dispatch({ type: 'perform', action: { type: 'tick', now: timestamp }, now: timestamp });
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      // Deadlines catch up the current phase, never auto-start the next phase.
      tick();
      timer = setInterval(tick, 250);
    };
    // A study tab can stay in the background on web and still announce a ready
    // crop. Native timers catch up on return, since the OS can suspend the app.
    if (Platform.OS === 'web' || AppState.currentState === 'active' || AppState.currentState === null) start();
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') start();
      else if (Platform.OS !== 'web') stop();
    });
    return () => {
      stop();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Wait for hydration so a quick edit preserves all other saved pet names.
    if (!petNamesLoaded || !Object.keys(state.petNames).length) return;
    const names = JSON.stringify(state.petNames);
    saves.current = saves.current.then(async () => {
      try {
        await AsyncStorage.setItem(PET_NAMES_KEY, names);
        setPetNamesStorageWarning(null);
      } catch { setPetNamesStorageWarning('Pet name changed for this visit, but could not be saved on this device.'); }
    });
  }, [petNamesLoaded, state.petNames]);

  // Catalogs do not subscribe to the ticking clock; pixel previews only redraw
  // when an actual game action changes state.
  const value = useMemo(() => ({ state, perform, namesStorageWarning, seasonStorageWarning, farmerStorageWarning, petNamesStorageWarning, notice, harvest, scene, sceneAction }), [state, perform, namesStorageWarning, seasonStorageWarning, farmerStorageWarning, petNamesStorageWarning, notice, harvest, scene, sceneAction]);
  return <GardenContext.Provider value={value}><GardenClock.Provider value={now}>{children}</GardenClock.Provider></GardenContext.Provider>;
}

export function useGardenState() {
  const context = useContext(GardenContext);
  if (!context) throw new Error('Garden screens must be inside GardenProvider.');
  return context;
}

export function useGarden() {
  const context = useGardenState();
  const now = useContext(GardenClock);
  if (now === null) throw new Error('Garden screens must be inside GardenProvider.');
  return { ...context, now };
}
