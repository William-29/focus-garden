import { useCallback, useEffect, useReducer } from 'react';
import { AppState } from 'react-native';
import { foldedPanel, panelIdleReducer } from '@/game/panel-idle';

export function useIdlePanel() {
  const [panel, dispatch] = useReducer(panelIdleReducer, foldedPanel);
  const open = useCallback(() => dispatch({ type: 'open', now: Date.now() }), []);
  const close = useCallback(() => dispatch({ type: 'close', now: Date.now() }), []);
  const touchStart = useCallback(() => dispatch({ type: 'touchStart', now: Date.now() }), []);
  const touchEnd = useCallback(() => dispatch({ type: 'touchEnd', now: Date.now() }), []);
  const activity = useCallback(() => dispatch({ type: 'activity', now: Date.now() }), []);
  useEffect(() => {
    if (panel.deadline === null) return;
    const deadline = panel.deadline;
    const timer = setTimeout(() => dispatch({ type: 'expire', deadline, now: Date.now() }), Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [panel.deadline]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active' && panel.held) touchEnd();
      if (status === 'active' && panel.deadline !== null) dispatch({ type: 'expire', deadline: panel.deadline, now: Date.now() });
    });
    return () => subscription.remove();
  }, [panel.held, panel.deadline, touchEnd]);
  return { collapsed: panel.collapsed, open, close, touchStart, touchEnd, activity };
}
