// Progress through the adventure: where the player is, which places and riddles are done, the score, the rating.
// Pure reducers over a plain object (it is persisted as JSON).
import { initialPuzzle, PuzzleState } from './puzzle';
import { isQuiz, isRadar, Scenario } from './scenario';

export type Progress = {
  current: number;
  furthest: number;
  // First-try riddles.
  score: number;
  // Riddle screen indexes answered right.
  solved: number[];
  // Wrong attempts per riddle screen index.
  wrong: Record<number, number>;
  // Radar screen indexes where the player arrived.
  reached: number[];
  puzzle: PuzzleState;
  rating: number | null;
};

export const initialProgress: Progress = {
  current: 0,
  furthest: 0,
  score: 0,
  solved: [],
  wrong: {},
  reached: [],
  puzzle: initialPuzzle,
  rating: null,
};

export function isStarted(progress: Progress): boolean {
  return progress.furthest > 0;
}

const lastIndex = (scenario: Scenario) => scenario.screens.length - 1;

function moveTo(progress: Progress, index: number): Progress {
  return { ...progress, current: index, furthest: Math.max(progress.furthest, index) };
}

export function next(scenario: Scenario, progress: Progress): Progress {
  if (progress.current >= lastIndex(scenario)) return progress;
  return moveTo(progress, progress.current + 1);
}

// Back and forward never land on a radar screen: a walk already done is never redone.
function step(scenario: Scenario, progress: Progress, direction: -1 | 1): number | null {
  const limit = direction < 0 ? 0 : progress.furthest;
  for (let i = progress.current + direction; direction < 0 ? i >= limit : i <= limit; i += direction) {
    if (!isRadar(scenario.screens[i])) return i;
  }
  return null;
}

export const canGoBack = (scenario: Scenario, progress: Progress) => step(scenario, progress, -1) !== null;
export const canGoForward = (scenario: Scenario, progress: Progress) => step(scenario, progress, 1) !== null;

export function goBack(scenario: Scenario, progress: Progress): Progress {
  const index = step(scenario, progress, -1);
  return index === null ? progress : { ...progress, current: index };
}

export function goForward(scenario: Scenario, progress: Progress): Progress {
  const index = step(scenario, progress, 1);
  return index === null ? progress : { ...progress, current: index };
}

// Arrival at a place (automatic or "I'm here!"): the riddle comes next.
export function arrive(scenario: Scenario, progress: Progress, radarIndex: number): { progress: Progress; firstTime: boolean } {
  if (!isRadar(scenario.screens[radarIndex])) return { progress, firstTime: false };
  const firstTime = !progress.reached.includes(radarIndex);
  const reached = firstTime ? [...progress.reached, radarIndex] : progress.reached;
  return { progress: moveTo({ ...progress, reached }, radarIndex + 1), firstTime };
}

export type AnswerResult = 'right' | 'wrong' | 'ignored';

// A point only when the right answer is the first answer given on that riddle. A solved riddle is read-only.
export function answer(
  scenario: Scenario,
  progress: Progress,
  quizIndex: number,
  choice: string,
): { progress: Progress; result: AnswerResult; firstTry: boolean } {
  const screen = scenario.screens[quizIndex];
  if (!isQuiz(screen) || progress.solved.includes(quizIndex)) return { progress, result: 'ignored', firstTry: false };
  const wrongSoFar = progress.wrong[quizIndex] ?? 0;
  if (choice !== screen.answer) {
    return { progress: { ...progress, wrong: { ...progress.wrong, [quizIndex]: wrongSoFar + 1 } }, result: 'wrong', firstTry: false };
  }
  const firstTry = wrongSoFar === 0;
  return {
    progress: { ...progress, solved: [...progress.solved, quizIndex], score: progress.score + (firstTry ? 1 : 0) },
    result: 'right',
    firstTry,
  };
}

export function rate(progress: Progress, stars: number): Progress {
  if (progress.rating !== null || !Number.isInteger(stars) || stars < 1 || stars > 5) return progress;
  return { ...progress, rating: stars };
}

// Testing deep link (PRD): the progress of a player who reached `screen` answering every earlier riddle at the
// first try (used by Maestro to reach the final puzzle and the end screen).
export function seedProgress(scenario: Scenario, screen: number): Progress | null {
  if (!Number.isInteger(screen) || screen < 0 || screen >= scenario.screens.length) return null;
  const before = (predicate: (i: number) => boolean) => scenario.screens.flatMap((_, i) => (i < screen && predicate(i) ? [i] : []));
  const solved = before((i) => isQuiz(scenario.screens[i]));
  const puzzleDone = scenario.screens.some((s, i) => i < screen && s.type === 'final_puzzle');
  return {
    ...initialProgress,
    current: screen,
    furthest: screen,
    score: solved.length,
    solved,
    reached: before((i) => isRadar(scenario.screens[i])),
    puzzle: puzzleDone ? { lines: initialPuzzle.lines.map((line) => ({ ...line, solved: true })) } : initialPuzzle,
  };
}

export function parseSeedUrl(url: string | null): number | null {
  const match = url?.match(/^mysteresbruguieres:\/\/seed\/(\d+)$/);
  return match ? Number(match[1]) : null;
}
