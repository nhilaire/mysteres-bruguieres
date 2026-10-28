import {
  answer,
  arrive,
  canGoBack,
  canGoForward,
  goBack,
  goForward,
  initialProgress,
  isStarted,
  next,
  parseSeedUrl,
  Progress,
  rate,
  seedProgress,
} from '../game/adventure';
import { SCENARIOS } from '../i18n/scenario';

const scenario = SCENARIOS.fr;
// Screen layout of the French scenario: 0 home, 1-2 narration, 3 radar (place 1), 4 riddle 1 (answer "2").
const RADAR_1 = 3;
const QUIZ_1 = 4;

function at(index: number, furthest = index): Progress {
  return { ...initialProgress, current: index, furthest };
}

describe('starting', () => {
  it('starts on the first screen with nothing done', () => {
    expect(initialProgress).toMatchObject({ current: 0, furthest: 0, score: 0, solved: [], reached: [], rating: null });
    expect(isStarted(initialProgress)).toBe(false);
    expect(isStarted(next(scenario, initialProgress))).toBe(true);
  });
});

describe('riddles and score', () => {
  it('scores a point for a right first answer and moves nowhere by itself', () => {
    const { progress, result, firstTry } = answer(scenario, at(QUIZ_1), QUIZ_1, '2');
    expect(result).toBe('right');
    expect(firstTry).toBe(true);
    expect(progress.score).toBe(1);
    expect(progress.solved).toEqual([QUIZ_1]);
    expect(progress.current).toBe(QUIZ_1);
  });

  it('gives no point when the right answer comes after a wrong one', () => {
    const wrong = answer(scenario, at(QUIZ_1), QUIZ_1, '3');
    expect(wrong.result).toBe('wrong');
    expect(wrong.progress.wrong[QUIZ_1]).toBe(1);
    const right = answer(scenario, wrong.progress, QUIZ_1, '2');
    expect(right.result).toBe('right');
    expect(right.firstTry).toBe(false);
    expect(right.progress.score).toBe(0);
    expect(right.progress.solved).toEqual([QUIZ_1]);
  });

  it('counts every wrong attempt', () => {
    let p = at(QUIZ_1);
    for (const choice of ['1', '3', '4']) p = answer(scenario, p, QUIZ_1, choice).progress;
    expect(p.wrong[QUIZ_1]).toBe(3);
  });

  it('never scores again on a solved riddle', () => {
    const solved = answer(scenario, at(QUIZ_1), QUIZ_1, '2').progress;
    const again = answer(scenario, solved, QUIZ_1, '2');
    expect(again.result).toBe('ignored');
    expect(again.progress).toBe(solved);
    expect(answer(scenario, solved, QUIZ_1, '3').result).toBe('ignored');
  });

  it('ignores answers on a screen that is not a riddle', () => {
    expect(answer(scenario, at(RADAR_1), RADAR_1, '2').result).toBe('ignored');
  });
});

describe('places', () => {
  it('marks a place reached once and moves to its riddle', () => {
    const first = arrive(scenario, at(RADAR_1), RADAR_1);
    expect(first.firstTime).toBe(true);
    expect(first.progress.reached).toEqual([RADAR_1]);
    expect(first.progress.current).toBe(QUIZ_1);
    expect(first.progress.furthest).toBe(QUIZ_1);
    const second = arrive(scenario, { ...first.progress, current: RADAR_1 }, RADAR_1);
    expect(second.firstTime).toBe(false);
    expect(second.progress.reached).toEqual([RADAR_1]);
  });
});

describe('navigation', () => {
  it('cannot go back from the first screen', () => {
    expect(canGoBack(scenario, initialProgress)).toBe(false);
    expect(goBack(scenario, initialProgress)).toBe(initialProgress);
  });

  it('goes back one screen', () => {
    expect(goBack(scenario, at(2)).current).toBe(1);
  });

  it('skips radar screens already passed when going back', () => {
    const p = goBack(scenario, at(QUIZ_1));
    expect(p.current).toBe(2);
    expect(canGoBack(scenario, at(QUIZ_1))).toBe(true);
  });

  it('goes forward only up to the furthest screen reached', () => {
    expect(canGoForward(scenario, at(2, 2))).toBe(false);
    expect(goForward(scenario, at(2, 2)).current).toBe(2);
    expect(canGoForward(scenario, at(1, 2))).toBe(true);
    expect(goForward(scenario, at(1, 2)).current).toBe(2);
  });

  it('skips radar screens already passed when going forward', () => {
    expect(goForward(scenario, at(2, QUIZ_1)).current).toBe(QUIZ_1);
  });

  it('next moves on and extends the furthest screen', () => {
    const p = next(scenario, at(1, 1));
    expect(p).toMatchObject({ current: 2, furthest: 2 });
    expect(next(scenario, at(33)).current).toBe(33);
  });
});

describe('rating', () => {
  it('is given once', () => {
    const rated = rate(at(33), 4);
    expect(rated.rating).toBe(4);
    expect(rate(rated, 1)).toBe(rated);
  });

  it('accepts 1 to 5 stars only', () => {
    expect(rate(at(33), 0).rating).toBeNull();
    expect(rate(at(33), 6).rating).toBeNull();
    expect(rate(at(33), 2.5).rating).toBeNull();
  });
});

describe('testing deep link', () => {
  it('seeds a player who answered every earlier riddle at the first try', () => {
    const seeded = seedProgress(scenario, 31)!;
    expect(seeded).toMatchObject({ current: 31, furthest: 31, score: 9, rating: null });
    expect(seeded.solved).toHaveLength(9);
    expect(seeded.reached).toHaveLength(9);
    expect(seeded.puzzle.lines.every((l) => !l.solved)).toBe(true);
    expect(seedProgress(scenario, 33)!.puzzle.lines.every((l) => l.solved)).toBe(true);
    expect(seedProgress(scenario, 0)).toEqual(initialProgress);
  });

  it('rejects screens outside the scenario', () => {
    expect(seedProgress(scenario, 34)).toBeNull();
    expect(seedProgress(scenario, -1)).toBeNull();
  });

  it('reads mysteresbruguieres://seed/<screen> only', () => {
    expect(parseSeedUrl('mysteresbruguieres://seed/31')).toBe(31);
    expect(parseSeedUrl('mysteresbruguieres://seed/x')).toBeNull();
    expect(parseSeedUrl('https://example.org/seed/31')).toBeNull();
    expect(parseSeedUrl(null)).toBeNull();
  });
});
