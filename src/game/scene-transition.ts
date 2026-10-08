import type { Season } from './seasons';

export const SCENE_MIN_MS = 700, SCENE_TIMEOUT_MS = 20000;
export type SceneTransition = {
  id: number; season: Season; phase: 'loading' | 'displayed' | 'ready' | 'error';
  startedAt: number; readyAt: number; lastReady: Season | null; artReady: boolean;
};
export type SceneAction = { type: 'displayed' | 'failed' | 'finish'; id: number; now: number }
  | { type: 'retry'; now: number } | { type: 'artReady'; now: number };
export function beginScene(season: Season, now: number, previous?: SceneTransition): SceneTransition {
  return { id: (previous?.id ?? 0) + 1, season, phase: 'loading', startedAt: now,
    readyAt: now + SCENE_MIN_MS, lastReady: previous?.lastReady ?? null, artReady: previous?.artReady ?? false };
}
export function sceneReducer(scene: SceneTransition, action: SceneAction): SceneTransition {
  if (action.type === 'retry') return scene.phase === 'error' ? beginScene(scene.season, action.now, scene) : scene;
  if (action.type === 'artReady') return scene.artReady ? scene : { ...scene, artReady: true, readyAt: Math.max(scene.readyAt, action.now + 250) };
  if (action.id !== scene.id) return scene;
  if (action.type === 'displayed' && scene.phase === 'loading') return { ...scene, phase: 'displayed', readyAt: Math.max(scene.readyAt, action.now + 80) };
  if (action.type === 'failed' && (scene.phase === 'loading' || scene.phase === 'displayed')) return { ...scene, phase: 'error' };
  if (action.type === 'finish' && scene.phase === 'displayed' && scene.artReady && action.now >= scene.readyAt) {
    return { ...scene, phase: 'ready', lastReady: scene.season };
  }
  return scene;
}
