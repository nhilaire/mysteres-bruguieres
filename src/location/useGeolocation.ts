import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export type GeoState =
  | { status: 'searching' }
  | { status: 'fix'; latitude: number; longitude: number }
  // Permission refused, location off or GPS error: the radar falls back to "I'm here!".
  | { status: 'unavailable' };

// Watches the position only while `active` (radar screens): never during the story. Never asks for the permission
// itself (the location explainer does), so no system dialog pops up in the middle of the game.
export function useGeolocation(active: boolean): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'searching' });
  // Bumped to check again (permission, location on) and restart the watch.
  const [attempt, setAttempt] = useState(0);
  const unavailable = state.status === 'unavailable';

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;
    // A retry keeps "unavailable" on screen until a position comes: no flash of "searching".
    if (attempt === 0) setState({ status: 'searching' });
    (async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted || !(await Location.hasServicesEnabledAsync())) {
          if (!cancelled) setState({ status: 'unavailable' });
          return;
        }
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 3, timeInterval: 1500 },
          (position) => {
            if (!cancelled) setState({ status: 'fix', latitude: position.coords.latitude, longitude: position.coords.longitude });
          },
        );
        if (cancelled) sub.remove();
        else subscription = sub;
      } catch {
        if (!cancelled) setState({ status: 'unavailable' });
      }
    })();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [active, attempt]);

  // Location turned back on (or permission granted) in the system settings: check again on return to the game.
  useEffect(() => {
    if (!active || !unavailable) return;
    const sub = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') setAttempt((n) => n + 1);
    });
    // Optional chaining: Jest mocks of AppState.addEventListener may return nothing.
    return () => sub?.remove();
  }, [active, unavailable]);

  return state;
}
