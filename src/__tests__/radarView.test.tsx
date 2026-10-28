import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Linking } from 'react-native';

import { playSound, vibrate } from '../feedback/feedback';
import type { RadarScreen } from '../game/scenario';
import { ARRIVAL_DELAY_MS, RadarView } from '../screens/game/RadarView';

jest.mock('../feedback/feedback', () => ({ playSound: jest.fn(), stopSound: jest.fn(), vibrate: jest.fn() }));

const target: RadarScreen = { type: 'radar', latitude: 43.727059, longitude: 1.411985, message: 'Rends-toi à la mairie' };
type Callback = (position: { coords: { latitude: number; longitude: number } }) => void;

let emit: Callback = () => undefined;

function grantLocation() {
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({ granted: true, status: 'granted', canAskAgain: true } as never);
  jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
  jest.mocked(Location.watchPositionAsync).mockImplementation(async (_options, callback) => {
    emit = callback as unknown as Callback;
    return { remove: jest.fn() };
  });
}

// ~ metres north of the target.
const north = (metres: number) => ({ coords: { latitude: target.latitude + metres / 111195, longitude: target.longitude } });

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

it('arrives on its own after 2 readings within 15 m, with chime and vibration, then opens the riddle', async () => {
  grantLocation();
  const onArrive = jest.fn();
  await render(<RadarView target={target} step={1} onArrive={onArrive} onLost={jest.fn()} />);
  await act(async () => emit(north(120)));
  expect(screen.getByTestId('radar-status').props.children).toBe('120 m');
  await act(async () => emit(north(10)));
  expect(onArrive).not.toHaveBeenCalled();
  await act(async () => emit(north(8)));
  expect(screen.getByText('Tu y es !')).toBeTruthy();
  expect(playSound).toHaveBeenCalledWith('chime');
  expect(vibrate).toHaveBeenCalledWith('arrival');
  await act(async () => jest.advanceTimersByTime(ARRIVAL_DELAY_MS));
  expect(onArrive).toHaveBeenCalledWith('auto', true);
});

it('pings and ticks near the place only', async () => {
  grantLocation();
  await render(<RadarView target={target} step={1} onArrive={jest.fn()} onLost={jest.fn()} />);
  await act(async () => emit(north(150)));
  await act(async () => jest.advanceTimersByTime(3000));
  expect(playSound).not.toHaveBeenCalledWith('ping');
  await act(async () => emit(north(40)));
  await act(async () => jest.advanceTimersByTime(3000));
  expect(playSound).toHaveBeenCalledWith('ping');
  expect(vibrate).toHaveBeenCalledWith('tick');
});

it('shows the step, the cardinal direction and hides the arrow without compass', async () => {
  grantLocation();
  await render(<RadarView target={target} step={3} onArrive={jest.fn()} onLost={jest.fn()} />);
  await act(async () => emit(north(300)));
  expect(screen.getByText('Étape 3 sur 9')).toBeTruthy();
  expect(screen.getByText('Direction : Sud')).toBeTruthy();
  expect(screen.queryByTestId('radar-arrow')).toBeNull();
});

it('without location, says so and "I\'m here!" opens the riddle by hand', async () => {
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({ granted: false, status: 'denied', canAskAgain: true } as never);
  const onArrive = jest.fn();
  await render(<RadarView target={target} step={1} onArrive={onArrive} onLost={jest.fn()} />);
  expect(await screen.findByText('Position indisponible.')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('radar-im-here'));
  expect(onArrive).toHaveBeenCalledWith('manual', false);
});

it('"I can\'t find the place" opens walking directions', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  const onLost = jest.fn();
  await render(<RadarView target={target} step={1} onArrive={jest.fn()} onLost={onLost} />);
  await fireEvent.press(screen.getByTestId('radar-lost'));
  expect(onLost).toHaveBeenCalled();
  expect(openURL).toHaveBeenCalledWith(expect.stringContaining('destination=43.727059,1.411985&travelmode=walking'));
});
