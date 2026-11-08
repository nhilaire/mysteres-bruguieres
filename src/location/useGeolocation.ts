import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
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
  // True when the watch itself was refused (the Play Services "Location Accuracy" sheet declined): that sheet is an
  // activity over the game, so the app comes back to the foreground right after, and restarting the watch there would
  // open it again, forever (T-29). The player gets a new attempt by opening the radar again.
  const watchRefused = useRef(false);

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
          watchRefused.current = false;
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
        watchRefused.current = true;
        if (!cancelled) setState({ status: 'unavailable' });
      }
    })();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [active, attempt]);

  // Location turned back on (or permission granted) in the system settings: check again on return to the game,
  // unless the watch itself was refused (see watchRefused).
  useEffect(() => {
    if (!active || !unavailable) return;
    const sub = AppState.addEventListener('change', (appState) => {
      if (appState === 'active' && !watchRefused.current) setAttempt((n) => n + 1);
    });
    // Optional chaining: Jest mocks of AppState.addEventListener may return nothing.
    return () => sub?.remove();
  }, [active, unavailable]);

  return state;
}
