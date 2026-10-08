export const PANEL_IDLE_MS = 5000;
export type PanelIdle = { collapsed: boolean; held: boolean; deadline: number | null };
export type PanelIdleAction = { type: 'open' | 'close' | 'touchStart' | 'touchEnd' | 'activity'; now: number }
  | { type: 'expire'; now: number; deadline: number };
export const foldedPanel: PanelIdle = { collapsed: true, held: false, deadline: null };
export function panelIdleReducer(state: PanelIdle, action: PanelIdleAction): PanelIdle {
  if (action.type === 'close') return foldedPanel;
  if (action.type === 'open') return { collapsed: false, held: false, deadline: action.now + PANEL_IDLE_MS };
  if (state.collapsed) return state;
  if (action.type === 'touchStart') return { ...state, held: true, deadline: null };
  if (action.type === 'activity') return state.held ? state : { ...state, deadline: action.now + PANEL_IDLE_MS };
  if (action.type === 'touchEnd') return { ...state, held: false, deadline: action.now + PANEL_IDLE_MS };
  if (action.type === 'expire' && !state.held && state.deadline === action.deadline && action.now >= action.deadline) return foldedPanel;
  return state;
}
