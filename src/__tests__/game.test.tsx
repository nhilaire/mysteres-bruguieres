import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert } from 'react-native';

import App, { summarize } from '../App';
import { initialProgress, Progress } from '../game/adventure';
import { GameScreen } from '../screens/GameScreen';

jest.mock('../feedback/feedback', () => ({ playSound: jest.fn(), stopSound: jest.fn(), vibrate: jest.fn(), configureFeedback: jest.fn() }));

function Harness({ start, onMenu = jest.fn() }: { start: Progress; onMenu?: () => void }) {
  const [progress, setProgress] = useState(start);
  return <GameScreen progress={progress} onProgress={(u) => setProgress(u)} onMenu={onMenu} onRestart={jest.fn()} />;
}

const at = (current: number, furthest = current): Progress => ({ ...initialProgress, current, furthest });

describe('game navigation', () => {
  it('back is disabled on the first screen', async () => {
    await render(<Harness start={at(0)} />);
    expect(screen.getByTestId('game-back').props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.getByTestId('game-forward').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('back from a riddle skips the radar already walked', async () => {
    await render(<Harness start={at(4)} />);
    await fireEvent.press(screen.getByTestId('game-back'));
    expect(screen.getByTestId('game-step-2')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('game-forward'));
    expect(screen.getByTestId('game-step-4')).toBeTruthy();
  });

  it('hides the arrows on a radar screen but keeps the menu', async () => {
    const onMenu = jest.fn();
    await render(<Harness start={at(3)} onMenu={onMenu} />);
    expect(screen.getByTestId('radar-screen')).toBeTruthy();
    expect(screen.queryByTestId('game-back')).toBeNull();
    await fireEvent.press(screen.getByTestId('game-menu'));
    expect(onMenu).toHaveBeenCalled();
  });

  it('"I\'m here!" opens the riddle of the place', async () => {
    await render(<Harness start={at(3)} />);
    await fireEvent.press(screen.getByTestId('radar-im-here'));
    expect(screen.getByTestId('quiz-screen')).toBeTruthy();
  });
});

describe('resuming the adventure', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({ granted: true, status: 'granted', canAskAgain: true } as never);
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
  });

  it('summarizes the progress for the title screen', () => {
    expect(summarize({ ...at(11), reached: [3, 6, 9], solved: [4, 7] })).toEqual({ started: true, places: 3, solved: 2, percent: 33 });
    expect(summarize(initialProgress).started).toBe(false);
  });

  it('continues on the same screen with the same score after a relaunch', async () => {
    await AsyncStorage.setItem('game.progress.v1', JSON.stringify({ ...at(4), score: 0, reached: [3] }));
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('title-continue'));
    expect(await screen.findByTestId('game-step-4')).toBeTruthy();
    expect(screen.getByTestId('quiz-screen')).toBeTruthy();
  });

  it('saves progress as the player goes, and Restart erases it', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('title-start'));
    expect(await screen.findByTestId('game-step-0')).toBeTruthy();
    for (let i = 0; i < 20 && !screen.queryByTestId('game-step-1'); i++) await fireEvent.press(screen.getByTestId('narration-tap'));
    expect(screen.getByTestId('game-step-1')).toBeTruthy();
    expect(JSON.parse((await AsyncStorage.getItem('game.progress.v1'))!)).toMatchObject({ current: 1, furthest: 1 });
    await fireEvent.press(screen.getByTestId('game-menu'));
    await fireEvent.press(await screen.findByTestId('title-restart'));
    await act(async () => alert.mock.calls[0][2]![1].onPress!());
    expect(await screen.findByTestId('title-start')).toBeTruthy();
    expect(JSON.parse((await AsyncStorage.getItem('game.progress.v1'))!)).toMatchObject({ current: 0, furthest: 0 });
  });

  it('goes through the location explainer when the position is not granted', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({ granted: false, status: 'undetermined', canAskAgain: true } as never);
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('title-start'));
    expect(await screen.findByTestId('location-screen')).toBeTruthy();
    await fireEvent.press(await screen.findByTestId('location-without-gps'));
    expect(await screen.findByTestId('game-screen')).toBeTruthy();
  });
});

describe('final puzzle and score', () => {
  it('solving the final puzzle, even with "Show me", leaves the score unchanged', async () => {
    const { seedProgress } = require('../game/adventure');
    const { SCENARIOS } = require('../i18n/scenario');
    const start: Progress = { ...seedProgress(SCENARIOS.fr, 31), score: 6 };
    let latest = start;
    function Tracked() {
      const [progress, setProgress] = useState(start);
      latest = progress;
      return <GameScreen progress={progress} onProgress={(u) => setProgress(u)} onMenu={jest.fn()} onRestart={jest.fn()} />;
    }
    await render(<Tracked />);
    for (let i = 0; i < 3; i++) {
      await fireEvent.press(screen.getByTestId('keypad-9'));
      await fireEvent.press(screen.getByTestId('keypad-validate'));
    }
    await fireEvent.press(screen.getByTestId('puzzle-reveal'));
    for (const value of [1, 13, 15, 21, 14, 1]) {
      for (const d of String(value)) await fireEvent.press(screen.getByTestId(`keypad-${d}`));
      await fireEvent.press(screen.getByTestId('keypad-validate'));
    }
    expect(screen.getByTestId('puzzle-solved')).toBeTruthy();
    expect(latest.puzzle.lines.every((l) => l.solved)).toBe(true);
    expect(latest.score).toBe(6);
  });
});
