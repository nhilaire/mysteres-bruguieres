import AsyncStorage from '@react-native-async-storage/async-storage';

import { initialProgress, Progress } from '../game/adventure';
import { initialPuzzle, PuzzleLine } from '../game/puzzle';
import { reportError } from '../telemetry/telemetry';

const KEY = 'game.progress.v1';

const isIndex = (value: unknown, screens: number): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) < screens;
const isCount = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;

function isLine(value: unknown): value is PuzzleLine {
  const line = value as PuzzleLine;
  return !!line && typeof line.solved === 'boolean' && typeof line.revealed === 'boolean' && isCount(line.wrong);
}

// Stored progress is trusted only if every field has the expected shape; otherwise the adventure starts afresh
// (a stale position can be caught up, an invented one cannot).
export function parseProgress(raw: string | null, screens: number): Progress {
  if (!raw) return initialProgress;
  try {
    const p = JSON.parse(raw) as Partial<Progress>;
    const lines = p.puzzle?.lines;
    const valid =
      isIndex(p.current, screens) &&
      isIndex(p.furthest, screens) &&
      p.current <= p.furthest &&
      isCount(p.score) &&
      Array.isArray(p.solved) &&
      p.solved.every((i) => isIndex(i, screens)) &&
      Array.isArray(p.reached) &&
      p.reached.every((i) => isIndex(i, screens)) &&
      !!p.wrong &&
      typeof p.wrong === 'object' &&
      Object.values(p.wrong).every(isCount) &&
      Array.isArray(lines) &&
      lines.length === initialPuzzle.lines.length &&
      lines.every(isLine) &&
      (p.rating === null || (Number.isInteger(p.rating) && p.rating! >= 1 && p.rating! <= 5));
    return valid ? (p as Progress) : initialProgress;
  } catch {
    return initialProgress;
  }
}

export async function loadProgress(screens: number): Promise<Progress> {
  try {
    return parseProgress(await AsyncStorage.getItem(KEY), screens);
  } catch (error) {
    reportError(error, 'load_progress');
    return initialProgress;
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  } catch (error) {
    reportError(error, 'save_progress');
  }
}

export async function clearProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (error) {
    reportError(error, 'clear_progress');
  }
}
