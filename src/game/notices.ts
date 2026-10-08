import { gardenReducer, initialState, type Action, type GardenState } from './garden.ts';
import { beginScene, sceneReducer, type SceneAction, type SceneTransition } from './scene-transition.ts';

export const NOTICE_DURATION = 2500;
export const HARVEST_DURATION = 1700;
export type GardenNotice = { id: number; text: string; expiresAt: number };
export type HarvestEvent = { id: number; plantId: string; coins: number; xp: number; kept: boolean; expiresAt: number };
export type GardenUIState = { state: GardenState; notice: GardenNotice | null; harvest: HarvestEvent | null; scene: SceneTransition; completionSound: number };
type GardenUIAction = { type: 'perform'; action: Action; now: number }
  | { type: 'expireNotice'; id: number } | { type: 'expireHarvest'; id: number } | { type: 'scene'; action: SceneAction };
export function initialGardenUI(): GardenUIState {
  const state = initialState();
  return { state, notice: null, harvest: null, scene: beginScene(state.season, Date.now()), completionSound: 0 };
}
export function gardenUIReducer(current: GardenUIState, event: GardenUIAction): GardenUIState {
  if (event.type === 'scene') {
    const scene = sceneReducer(current.scene, event.action);
    return scene === current.scene ? current : { ...current, scene };
  }
  if (event.type === 'expireNotice') {
    return current.notice?.id === event.id ? { ...current, notice: null } : current;
  }
  if (event.type === 'expireHarvest') {
    return current.harvest?.id === event.id ? { ...current, harvest: null } : current;
  }
  const state = gardenReducer(current.state, event.action);
  if (state === current.state) return current;
  const notice = state.noticeRevision === current.state.noticeRevision ? current.notice
    : { id: state.noticeRevision, text: state.message, expiresAt: event.now + NOTICE_DURATION };
  const completed = (event.action.type === 'harvest' || event.action.type === 'keep')
    && current.state.session?.status === 'ready' && !state.session;
  const harvest = completed ? { id: state.completed, plantId: current.state.session!.plantId,
    coins: state.coins - current.state.coins, xp: state.xp - current.state.xp,
    kept: event.action.type === 'keep', expiresAt: event.now + HARVEST_DURATION } : current.harvest;
  const scene = state.season === current.state.season ? current.scene : beginScene(state.season, event.now, current.scene);
  // Retain the event even if completion and harvesting happen in one render.
  // The counter changes once per newly ready plant, never for ordinary ticks.
  const completionSound = current.completionSound + (state.session?.status === 'ready'
    && current.state.session?.status !== 'ready' ? 1 : 0);
  return { state, notice, harvest, scene, completionSound };
}

export function visibleNotice(notice: GardenNotice | null, now: number) {
  return notice && now < notice.expiresAt ? notice : null;
}
