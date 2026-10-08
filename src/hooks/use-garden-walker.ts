import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing } from 'react-native';
import { distance, findGardenPath, nearestGround, randomGardenPath, type NavigationMap, type Point, type WalkCommand, walkDirection } from '@/game/garden-navigation';

export function useGardenWalker({ map, spawn, command, anchor, speed, cardinal = false, paused = false }: {
  map: NavigationMap; spawn: Point; command?: WalkCommand | null; anchor?: Point; speed: number; cardinal?: boolean; paused?: boolean;
}) {
  const [position] = useState(() => new Animated.ValueXY(nearestGround(map, spawn)));
  const current = useRef(nearestGround(map, spawn));
  const [walking, setWalking] = useState(false), [flip, setFlip] = useState(false), [frame, setFrame] = useState(0);
  const [direction, setDirection] = useState<ReturnType<typeof walkDirection>>('south');
  const [followingTap, setFollowingTap] = useState(false);
  const lastCommand = useRef<number | undefined>(undefined), manual = useRef<Point | null>(null);
  const lastSpawn = useRef(spawn);
  useEffect(() => {
    const listener = position.addListener((point) => { current.current = point; });
    return () => position.removeListener(listener);
  }, [position]);
  const commandId = command?.id, commandX = command?.x, commandY = command?.y;
  const anchorX = anchor?.x, anchorY = anchor?.y;
  const spawnX = spawn.x, spawnY = spawn.y;
  useEffect(() => {
    let live = true, active = AppState.currentState === 'active' || AppState.currentState === null;
    let animation: Animated.CompositeAnimation | undefined, wait: ReturnType<typeof setTimeout> | undefined;
    // Relocate only after a viewport/season change makes the old position invalid.
    const moved = lastSpawn.current.x !== spawnX || lastSpawn.current.y !== spawnY;
    lastSpawn.current = { x: spawnX, y: spawnY };
    if (paused) {
      // Capture the stopped native position rather than resetting to the spawn
      // or the last completed waypoint while the player names a pet.
      position.stopAnimation((point) => {
        if (!live) return;
        setWalking(false); setFollowingTap(false);
        current.current = nearestGround(map, moved ? lastSpawn.current : point);
        position.setValue(current.current);
      });
      return () => { live = false; };
    }
    current.current = nearestGround(map, moved ? lastSpawn.current : current.current); position.setValue(current.current);
    if (commandId !== undefined && commandId !== lastCommand.current && commandX !== undefined && commandY !== undefined) {
      lastCommand.current = commandId; manual.current = { x: commandX, y: commandY };
      setFollowingTap(true);
    }
    function chooseRoute() {
      if (!live || !active) return;
      setFollowingTap(!!manual.current);
      const destination = manual.current ?? (anchorX === undefined || anchorY === undefined ? null : { x: anchorX, y: anchorY });
      const isManual = !!manual.current;
      const route = destination ? findGardenPath(map, current.current, destination, cardinal) : randomGardenPath(map, current.current, Math.random, cardinal);
      let index = 1;
      const pace = speed * (destination ? 1 : 0.8 + Math.random() * 0.4);
      function nextSegment() {
        if (!live || !active) return;
        const target = route[index++];
        if (!target) {
          setWalking(false);
          if (isManual) manual.current = null;
          // Focus poses stay at their workstation; free walks pause for a
          // different duration before choosing a fresh reachable destination.
          if (!destination || isManual || route.length === 0) wait = setTimeout(chooseRoute, isManual ? 3500 : 900 + Math.random() * 2800);
          return;
        }
        const dx = target.x - current.current.x, length = distance(current.current, target);
        if (length < 0.5) { nextSegment(); return; }
        setDirection(walkDirection(current.current, target));
        if (Math.abs(dx) > 1) setFlip(dx < 0);
        setWalking(true);
        animation = Animated.timing(position, { toValue: target, duration: Math.max(80, length / pace * 1000),
          easing: Easing.linear, useNativeDriver: true, isInteraction: false });
        animation.start(({ finished }) => {
          if (!finished || !live || !active) return;
          current.current = target; nextSegment();
        });
      }
      nextSegment();
    }
    const subscription = AppState.addEventListener('change', (status) => {
      active = status === 'active'; clearTimeout(wait); animation?.stop(); setWalking(false);
      if (active) chooseRoute();
    });
    chooseRoute();
    return () => { live = false; clearTimeout(wait); animation?.stop(); subscription.remove(); };
  }, [map, position, speed, cardinal, paused, commandId, commandX, commandY, anchorX, anchorY, spawnX, spawnY]);

  useEffect(() => {
    if (!walking || paused) return;
    const timer = setInterval(() => setFrame((value) => (value + 1) % 4), speed < 15 ? 280 : 170);
    return () => clearInterval(timer);
  }, [walking, speed, paused]);
  return { position, walking: walking && !paused, flip, frame, followingTap, direction };
}
