import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type GeoState =
  | { status: 'searching' }
  | { status: 'fix'; latitude: number; longitude: number }
  // Permission refused, location off or GPS error: the radar falls back to "I'm here!".
  | { status: 'unavailable' };

// Watches the position only while `active` (radar screens): never during the story. Never asks for the permission
// itself (the location explainer does), so no system dialog pops up in the middle of the game.
export function useGeolocation(active: boolean): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'searching' });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;
    setState({ status: 'searching' });
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
  }, [active]);

  return state;
}
