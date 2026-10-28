// The only runtime permission the game asks for: foreground location. The compass reads sensors that need none.
import * as Location from 'expo-location';

export type PermissionState = 'undetermined' | 'granted' | 'denied' | 'blocked' | 'servicesDisabled' | 'error';

type Response = { granted: boolean; status: string; canAskAgain: boolean };

export function classify(response: Response): PermissionState {
  if (response.granted) return 'granted';
  if (response.status === 'undetermined') return 'undetermined';
  return response.canAskAgain ? 'denied' : 'blocked';
}

async function withServicesCheck(state: PermissionState): Promise<PermissionState> {
  if (state !== 'granted') return state;
  try {
    return (await Location.hasServicesEnabledAsync()) ? 'granted' : 'servicesDisabled';
  } catch {
    // An unreadable flag must not block the player: the radar shows its own "no location" state.
    return 'granted';
  }
}

// Reads the current state without any system dialog.
export async function checkLocationPermission(): Promise<PermissionState> {
  try {
    return await withServicesCheck(classify(await Location.getForegroundPermissionsAsync()));
  } catch {
    return 'error';
  }
}

export async function requestLocationPermission(): Promise<PermissionState> {
  try {
    return await withServicesCheck(classify(await Location.requestForegroundPermissionsAsync()));
  } catch {
    return 'error';
  }
}

// Android "turn on location" sheet from Play Services, instead of sending the player into the settings app.
export async function enableLocationServices(): Promise<PermissionState> {
  try {
    await Location.enableNetworkProviderAsync();
    return await checkLocationPermission();
  } catch {
    return 'servicesDisabled';
  }
}

export type LocationAction = 'allow' | 'askAgain' | 'openSettings' | 'enable' | 'retry';

// What the explainer screen says and offers for each state ('granted' goes straight to the game).
export function locationAdvice(state: PermissionState): {
  title: 'title' | 'deniedTitle' | 'blockedTitle' | 'servicesDisabledTitle' | 'errorTitle';
  body: 'systemHint' | 'denied' | 'blocked' | 'servicesDisabled' | 'error' | null;
  action: LocationAction | null;
} {
  switch (state) {
    case 'undetermined':
      return { title: 'title', body: 'systemHint', action: 'allow' };
    case 'denied':
      return { title: 'deniedTitle', body: 'denied', action: 'askAgain' };
    case 'blocked':
      return { title: 'blockedTitle', body: 'blocked', action: 'openSettings' };
    case 'servicesDisabled':
      return { title: 'servicesDisabledTitle', body: 'servicesDisabled', action: 'enable' };
    case 'error':
      return { title: 'errorTitle', body: 'error', action: 'retry' };
    case 'granted':
      return { title: 'title', body: null, action: null };
  }
}
