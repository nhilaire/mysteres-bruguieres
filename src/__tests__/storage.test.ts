import AsyncStorage from '@react-native-async-storage/async-storage';

import { answer, arrive, initialProgress, rate } from '../game/adventure';
import { submit } from '../game/puzzle';
import { riddleAnswers } from '../game/scenario';
import { SCENARIOS } from '../i18n/scenario';
import { clearProgress, loadProgress, parseProgress, saveProgress } from '../storage/progress';
import { defaultFeedbackSettings, loadFeedbackSettings, saveFeedbackSettings } from '../storage/feedbackSettings';
import { loadLanguageSetting, saveLanguageSetting } from '../storage/languageSetting';

const scenario = SCENARIOS.fr;
const SCREENS = scenario.screens.length;

beforeEach(async () => {
  await AsyncStorage.clear();
});

function playedProgress() {
  let p = arrive(scenario, { ...initialProgress, current: 3, furthest: 3 }, 3).progress;
  p = answer(scenario, p, 4, '3').progress;
  p = answer(scenario, p, 4, '2').progress;
  const numbers = riddleAnswers(scenario);
  let puzzle = p.puzzle;
  for (let i = 0; i < 3; i++) puzzle = submit(puzzle, numbers, 0).state;
  return rate({ ...p, puzzle, current: 31, furthest: 31 }, 4);
}

describe('progress persistence', () => {
  it('returns a fresh adventure when nothing is stored', async () => {
    expect(await loadProgress(SCREENS)).toEqual(initialProgress);
  });

  it('restores everything that was saved: screens, score, riddles, places, puzzle counts, rating', async () => {
    const saved = playedProgress();
    await saveProgress(saved);
    const loaded = await loadProgress(SCREENS);
    expect(loaded).toEqual(saved);
    // 3 wrong attempts on the active puzzle line survive a reload, so "Show me" is still offered.
    expect(loaded.puzzle.lines[0].wrong).toBe(3);
  });

  it('clears the progress on restart but keeps the settings', async () => {
    await saveProgress(playedProgress());
    await saveFeedbackSettings({ sound: false, haptics: true });
    await saveLanguageSetting('en');
    await clearProgress();
    expect(await loadProgress(SCREENS)).toEqual(initialProgress);
    expect(await loadFeedbackSettings()).toEqual({ sound: false, haptics: true });
    expect(await loadLanguageSetting()).toBe('en');
  });

  it('falls back to a fresh adventure on corrupt or out-of-range data', () => {
    expect(parseProgress('not json', SCREENS)).toEqual(initialProgress);
    expect(parseProgress(JSON.stringify({ current: 99, furthest: 99 }), SCREENS)).toEqual(initialProgress);
    expect(parseProgress(JSON.stringify({ current: 2 }), SCREENS)).toEqual(initialProgress);
  });
});

describe('sound and vibration settings', () => {
  it('are on by default', async () => {
    expect(defaultFeedbackSettings).toEqual({ sound: true, haptics: true });
    expect(await loadFeedbackSettings()).toEqual({ sound: true, haptics: true });
  });

  it('persist each switch', async () => {
    await saveFeedbackSettings({ sound: false, haptics: false });
    expect(await loadFeedbackSettings()).toEqual({ sound: false, haptics: false });
  });
});
