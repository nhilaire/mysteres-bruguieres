import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { AppState, AppStateStatus } from 'react-native';

import { classify, locationAdvice, PermissionState } from '../location/permissions';
import { useGeolocation } from '../location/useGeolocation';
import { LocationScreen } from '../screens/LocationScreen';

type Response = Awaited<ReturnType<typeof Location.getForegroundPermissionsAsync>>;
const response = (granted: boolean, status: string, canAskAgain: boolean) =>
  ({ granted, status, canAskAgain, expires: 'never' }) as unknown as Response;

describe('permission states', () => {
  it('classifies the system answer', () => {
    expect(classify(response(true, 'granted', true))).toBe('granted');
    expect(classify(response(false, 'undetermined', true))).toBe('undetermined');
    expect(classify(response(false, 'denied', true))).toBe('denied');
    expect(classify(response(false, 'denied', false))).toBe('blocked');
  });

  it.each([
    ['undetermined', 'title', 'systemHint', 'allow'],
    ['denied', 'deniedTitle', 'denied', 'askAgain'],
    ['blocked', 'blockedTitle', 'blocked', 'openSettings'],
    ['servicesDisabled', 'servicesDisabledTitle', 'servicesDisabled', 'enable'],
    ['error', 'errorTitle', 'error', 'retry'],
  ] as const)('%s: message %s / %s, action %s', (state, title, body, action) => {
    expect(locationAdvice(state as PermissionState)).toEqual({ title, body, action });
  });
});

describe('location explainer screen', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    [response(false, 'undetermined', true), true, 'Autoriser la position'],
    [response(false, 'denied', true), true, "Redemander l'autorisation"],
    [response(false, 'denied', false), true, 'Ouvrir les réglages'],
  ])('shows the matching action', async (permission, services, label) => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(permission);
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(services);
    await render(<LocationScreen onContinue={jest.fn()} onBack={jest.fn()} />);
    expect(await screen.findByText(label)).toBeTruthy();
  });

  it('asks to turn location on when the services are off', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(response(true, 'granted', true));
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);
    await render(<LocationScreen onContinue={jest.fn()} onBack={jest.fn()} />);
    expect(await screen.findByText('Activer la localisation')).toBeTruthy();
  });

  it('enters the game directly when the permission is already granted', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(response(true, 'granted', true));
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    const onContinue = jest.fn();
    await render(<LocationScreen onContinue={onContinue} onBack={jest.fn()} />);
    await screen.findByTestId('location-screen');
    expect(onContinue).toHaveBeenCalledWith(true);
  });

  it('enters the game after the player allows it', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(response(false, 'undetermined', true));
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(response(true, 'granted', true));
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    const onContinue = jest.fn();
    await render(<LocationScreen onContinue={onContinue} onBack={jest.fn()} />);
    await fireEvent.press(await screen.findByTestId('location-action'));
    expect(onContinue).toHaveBeenCalledWith(true);
  });

  it('"Play without GPS" enters the game without location', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(response(false, 'denied', true));
    const onContinue = jest.fn();
    await render(<LocationScreen onContinue={onContinue} onBack={jest.fn()} />);
    await fireEvent.press(await screen.findByTestId('location-without-gps'));
    expect(onContinue).toHaveBeenCalledWith(false);
  });
});

describe('radar position (useGeolocation)', () => {
  type Listener = (state: AppStateStatus) => void;
  let listeners: Listener[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    listeners = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      listeners.push(listener as Listener);
      return { remove: () => (listeners = listeners.filter((l) => l !== listener)) } as never;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('recovers when location is turned back on while the app was in the background', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(response(true, 'granted', true));
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);
    let emit: (position: { coords: { latitude: number; longitude: number } }) => void = () => undefined;
    jest.mocked(Location.watchPositionAsync).mockImplementation(async (_options, callback) => {
      emit = callback as never;
      return { remove: jest.fn() };
    });
    const { result } = await renderHook(() => useGeolocation(true));
    await act(async () => undefined);
    expect(result.current).toEqual({ status: 'unavailable' });
    expect(Location.watchPositionAsync).not.toHaveBeenCalled();

    // The player turns location on in the system settings, then comes back to the game.
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    await act(async () => listeners.forEach((l) => l('active')));
    expect(Location.watchPositionAsync).toHaveBeenCalledTimes(1);
    await act(async () => emit({ coords: { latitude: 43.7, longitude: 1.4 } }));
    expect(result.current).toEqual({ status: 'fix', latitude: 43.7, longitude: 1.4 });
  });

  it('does not restart a watch that was refused when the app comes back to the foreground (T-29)', async () => {
    // The Play Services "Location Accuracy" sheet is an activity over the game: declining it rejects the watch and
    // brings the app back to the foreground. Restarting the watch there would open the sheet again, forever.
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(response(true, 'granted', true));
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.watchPositionAsync).mockRejectedValue(new Error('Location settings are not satisfied'));
    const { result } = await renderHook(() => useGeolocation(true));
    await act(async () => undefined);
    expect(result.current).toEqual({ status: 'unavailable' });
    expect(Location.watchPositionAsync).toHaveBeenCalledTimes(1);
    await act(async () => listeners.forEach((l) => l('active')));
    await act(async () => listeners.forEach((l) => l('active')));
    expect(Location.watchPositionAsync).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ status: 'unavailable' });
  });

  it('does not restart a running watch when the app comes back to the foreground', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(response(true, 'granted', true));
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.watchPositionAsync).mockImplementation(async (_options, callback) => {
      (callback as never as (p: { coords: { latitude: number; longitude: number } }) => void)({ coords: { latitude: 1, longitude: 2 } });
      return { remove: jest.fn() };
    });
    const { result } = await renderHook(() => useGeolocation(true));
    await act(async () => undefined);
    expect(result.current).toEqual({ status: 'fix', latitude: 1, longitude: 2 });
    await act(async () => listeners.forEach((l) => l('active')));
    expect(Location.watchPositionAsync).toHaveBeenCalledTimes(1);
  });
});
