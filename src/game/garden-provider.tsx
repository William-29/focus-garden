import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { AppState } from 'react-native';

import { gardenReducer, initialState, type Action, type GardenState } from './garden';

type GardenContextValue = {
  state: GardenState;
  perform: (action: Action) => void;
};

const GardenContext = createContext<GardenContextValue | null>(null);
const GardenClock = createContext<number | null>(null);

// Intentionally in memory, matching the reference prototype. Route changes and
// backgrounding retain progress; a full JS reload or process restart resets it.
export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gardenReducer, undefined, initialState);
  const [now, setNow] = useState(Date.now);

  const perform = useCallback((action: Action) => {
    setNow(Date.now());
    dispatch(action);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const timestamp = Date.now();
      setNow(timestamp);
      dispatch({ type: 'tick', now: timestamp });
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
    if (AppState.currentState === 'active' || AppState.currentState === null) start();
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') start();
      else stop();
    });
    return () => {
      stop();
      subscription.remove();
    };
  }, []);

  // Catalogs do not subscribe to the ticking clock; pixel previews only redraw
  // when an actual game action changes state.
  const value = useMemo(() => ({ state, perform }), [state, perform]);
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
