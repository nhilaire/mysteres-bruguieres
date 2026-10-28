import { useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { playSound, vibrate } from '../../feedback/feedback';
import { approachAngle, bearingDegrees, bearingToCardinal, distanceMeters, formatDistance } from '../../game/geo';
import {
  ArrivalState,
  dialRadius,
  initialArrival,
  mapsDirectionsUrl,
  nextArrival,
  proximityFeedback,
  proximityZone,
  pulseIntervalSeconds,
} from '../../game/radar';
import type { RadarScreen } from '../../game/scenario';
import { useI18n } from '../../i18n/I18nProvider';
import { useCompass } from '../../location/useCompass';
import { useGeolocation } from '../../location/useGeolocation';
import { Button } from '../../ui/Button';
import { daylight, font, spacing } from '../../ui/theme';
import { RadarDial } from './RadarDial';

export const ARRIVAL_DELAY_MS = 1200;

type Props = {
  target: RadarScreen;
  step: number;
  onArrive: (kind: 'auto' | 'manual', hasFix: boolean) => void;
  onLost: () => void;
};

export function RadarView({ target, step, onArrive, onLost }: Props) {
  const { t, language } = useI18n();
  const { width, height } = useWindowDimensions();
  const geo = useGeolocation(true);
  const compass = useCompass(true);
  const [arrived, setArrived] = useState(false);
  const arrival = useRef<ArrivalState>(initialArrival);
  const [arrowAngle, setArrowAngle] = useState<number | null>(null);

  const hasFix = geo.status === 'fix';
  const distance = hasFix ? distanceMeters(geo.latitude, geo.longitude, target.latitude, target.longitude) : Number.NaN;
  const bearing = hasFix ? bearingDegrees(geo.latitude, geo.longitude, target.latitude, target.longitude) : null;
  const heading = compass.heading;
  const relative = bearing !== null && heading !== null ? bearing - heading : null;

  // Arrival: 2 consecutive readings within the radius, then the riddle after a short celebration.
  useEffect(() => {
    if (!hasFix || arrived) return;
    const result = nextArrival(arrival.current, distance);
    arrival.current = result.state;
    if (result.arrived) {
      setArrived(true);
      playSound('chime');
      vibrate('arrival');
    }
    // One step per GPS reading: the position object changes on each reading.
  }, [geo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!arrived) return;
    const id = setTimeout(() => onArrive('auto', true), ARRIVAL_DELAY_MS);
    return () => clearTimeout(id);
  }, [arrived, onArrive]);

  // The arrow takes the shortest way round (no 359° -> 0° spin).
  useEffect(() => {
    if (relative === null) return;
    setArrowAngle((current) => (current === null ? relative : approachAngle(current, relative, 0.5)));
  }, [relative]);

  // Proximity rhythm: ping and haptic tick only near the place.
  const pulseSeconds = pulseIntervalSeconds(distance);
  const near = proximityFeedback(distance) && !arrived;
  const period = Math.round(pulseSeconds * 10) * 100;
  useEffect(() => {
    if (!near) return;
    const id = setInterval(() => {
      playSound('ping');
      vibrate('tick');
    }, period);
    return () => clearInterval(id);
  }, [near, period]);

  const openMaps = () => {
    onLost();
    Linking.openURL(mapsDirectionsUrl(target.latitude, target.longitude)).catch(() => undefined);
  };

  const size = Math.min(width - 2 * spacing.lg, height * 0.42, 360);
  const compassReady = heading !== null;
  const cardinal = bearing === null ? null : t.dir[bearingToCardinal(bearing)];
  const status = arrived
    ? t.radar.arrived
    : geo.status === 'searching'
      ? t.radar.searching
      : geo.status === 'unavailable'
        ? t.radar.noLocation
        : formatDistance(distance, language);

  return (
    <View style={styles.container} testID="radar-screen">
      <Text style={styles.step}>{t.radar.step(step)}</Text>
      <Text style={styles.message}>{target.message}</Text>
      <View
        style={styles.dial}
        accessible
        accessibilityLabel={hasFix && cardinal ? t.radar.radarLabel(formatDistance(distance, language), cardinal) : t.radar.searching}
      >
        <RadarDial
          size={size}
          targetAngle={bearing === null ? null : compassReady ? arrowAngle : bearing}
          targetRadius={dialRadius(distance)}
          northAngle={compassReady ? -heading : 0}
          arrow={compassReady && hasFix}
          zone={proximityZone(distance)}
          pulseSeconds={pulseSeconds}
          arrived={arrived}
        />
      </View>
      <Text style={[hasFix || arrived ? styles.distance : styles.status, arrived && styles.arrived]} testID="radar-status">
        {status}
      </Text>
      {hasFix && cardinal && !arrived && <Text style={styles.direction}>{t.radar.direction(cardinal)}</Text>}
      {hasFix && !compassReady && !arrived && <Text style={styles.hint}>{t.radar.noCompass}</Text>}
      <View style={styles.spacer} />
      <Button label={t.radar.imHere} onPress={() => onArrive('manual', hasFix)} disabled={arrived} testID="radar-im-here" />
      <Button label={t.radar.lost} onPress={openMaps} variant="secondary" disabled={arrived} testID="radar-lost" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', gap: spacing.sm },
  step: { color: daylight.muted, fontSize: font.small, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  message: { color: daylight.text, fontSize: font.heading - 2, fontWeight: '800', textAlign: 'center' },
  dial: { marginVertical: spacing.sm },
  distance: { color: daylight.text, fontSize: 40, fontWeight: '900' },
  status: { color: daylight.text, fontSize: font.body + 2, fontWeight: '700', textAlign: 'center' },
  arrived: { color: daylight.success },
  direction: { color: daylight.text, fontSize: font.body, fontWeight: '600' },
  hint: { color: daylight.muted, fontSize: font.small, textAlign: 'center' },
  spacer: { flex: 1 },
});
