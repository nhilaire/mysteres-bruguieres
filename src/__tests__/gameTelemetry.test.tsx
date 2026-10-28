import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';

import App from '../App';
import { initialPuzzle } from '../game/puzzle';
import { gameEvents } from '../telemetry/gameEvents';

jest.mock('../feedback/feedback', () => ({ playSound: jest.fn(), stopSound: jest.fn(), vibrate: jest.fn(), configureFeedback: jest.fn() }));

describe('game events -> PRD telemetry events', () => {
  const track = jest.fn();
  const events = gameEvents(track);
  beforeEach(() => track.mockClear());

  it.each([
    ['auto', true, 'auto'],
    ['manual', true, 'manual'],
    ['manual', false, 'manual_no_gps'],
  ] as const)('place_reached reports a %s arrival (fix=%s) as %s', (kind, hasFix, method) => {
    events.onPlaceReached(4, kind, hasFix);
    expect(track).toHaveBeenCalledWith('place_reached', { step: 4, method });
  });

  it('reports the other events with only their listed params', () => {
    events.onMapsOpened(2);
    events.onRiddleSolved(3, false, 9);
    events.onPuzzleSolved({ lines: initialPuzzle.lines.map((l, i) => ({ solved: true, wrong: i === 0 ? 3 : 1, revealed: i === 0 })) });
    events.onFinished(7);
    events.onRated(5);
    expect(track.mock.calls).toEqual([
      ['maps_opened', { step: 2 }],
      ['riddle_solved', { step: 3, first_try: false, wrong: 5 }],
      ['final_puzzle_solved', { wrong: 9, revealed: 1 }],
      ['adventure_finished', { score: 7 }],
      ['adventure_rating', { rating: 5 }],
    ]);
  });
});

describe('consent gate in the app', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({ granted: true, status: 'granted', canAskAgain: true } as never);
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
  });

  it('sends nothing and disables collection when consent is refused', async () => {
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('consent-refuse'));
    expect(setAnalyticsCollectionEnabled).toHaveBeenLastCalledWith(expect.anything(), false);
    expect(setCrashlyticsCollectionEnabled).toHaveBeenLastCalledWith(expect.anything(), false);
    await fireEvent.press(await screen.findByTestId('title-start'));
    await screen.findByTestId('game-screen');
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('sends adventure_start with its params once consent is given, and stops when turned off', async () => {
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('consent-accept'));
    await fireEvent.press(await screen.findByTestId('title-start'));
    await screen.findByTestId('game-screen');
    expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'adventure_start', { resumed: 0, step: 0 });

    jest.mocked(logEvent).mockClear();
    await fireEvent.press(screen.getByTestId('game-menu'));
    await fireEvent.press(await screen.findByTestId('title-settings'));
    await fireEvent(screen.getByTestId('settings-telemetry'), 'valueChange', false);
    await fireEvent(screen.getByTestId('settings-sound'), 'valueChange', false);
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('reports a settings change when statistics are on', async () => {
    await AsyncStorage.setItem('telemetry.consent.v1', 'granted');
    await render(<App />);
    await fireEvent.press(await screen.findByTestId('title-settings'));
    await fireEvent(screen.getByTestId('settings-haptics'), 'valueChange', false);
    expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'settings_change', { setting: 'haptics', value: 'off' });
  });
});
