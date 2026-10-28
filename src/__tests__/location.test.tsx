import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { classify, locationAdvice, PermissionState } from '../location/permissions';
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
