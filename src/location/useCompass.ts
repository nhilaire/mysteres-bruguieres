import * as Location from 'expo-location';
import { Accelerometer, Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

import { compensatedHeading, Vector3 } from '../game/geo';

export type CompassState = { mode: 'pending' | 'native' | 'fused' | 'unavailable'; heading: number | null };

// Native heading first (sensor fusion by the OS, most reliable); otherwise magnetometer + accelerometer with tilt
// compensation; 'unavailable' without a magnetometer (e.g. most emulators).
export function useCompass(active: boolean): CompassState {
  const [state, setState] = useState<CompassState>({ mode: 'pending', heading: null });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const subscriptions: { remove: () => void }[] = [];
    let lastAccel: Vector3 = { x: 0, y: 0, z: 1 };

    const fallback = async () => {
      const [mag, accel] = await Promise.all([Magnetometer.isAvailableAsync(), Accelerometer.isAvailableAsync()]);
      if (cancelled) return;
      if (!mag) {
        setState({ mode: 'unavailable', heading: null });
        return;
      }
      if (accel) {
        Accelerometer.setUpdateInterval(180);
        subscriptions.push(Accelerometer.addListener((reading) => (lastAccel = reading)));
      }
      Magnetometer.setUpdateInterval(120);
      subscriptions.push(
        Magnetometer.addListener((reading) => {
          if (!cancelled) setState({ mode: 'fused', heading: compensatedHeading(reading, lastAccel) });
        }),
      );
    };

    (async () => {
      try {
        const sub = await Location.watchHeadingAsync((reading) => {
          const heading = reading.trueHeading >= 0 ? reading.trueHeading : reading.magHeading;
          if (!cancelled && heading >= 0) setState({ mode: 'native', heading });
        });
        if (cancelled) sub.remove();
        else subscriptions.push(sub);
      } catch {
        await fallback().catch(() => !cancelled && setState({ mode: 'unavailable', heading: null }));
      }
    })();

    return () => {
      cancelled = true;
      subscriptions.forEach((s) => s.remove());
    };
  }, [active]);

  return state;
}
