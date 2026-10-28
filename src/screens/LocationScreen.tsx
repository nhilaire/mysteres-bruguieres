import { useCallback, useEffect, useState } from 'react';
import { AppState, BackHandler, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n/I18nProvider';
import {
  checkLocationPermission,
  enableLocationServices,
  LocationAction,
  locationAdvice,
  PermissionState,
  requestLocationPermission,
} from '../location/permissions';
import { Button } from '../ui/Button';
import { Screen } from '../ui/Screen';
import { colors, font, spacing, workshop } from '../ui/theme';

type Props = { onContinue: (withGps: boolean) => void; onBack: () => void };

// Explains why the radar needs the position before any system dialog, and what refusing costs.
export function LocationScreen({ onContinue, onBack }: Props) {
  const { t } = useI18n();
  const [state, setState] = useState<PermissionState | null>(null);

  const update = useCallback(
    (next: PermissionState) => {
      if (next === 'granted') onContinue(true);
      else setState(next);
    },
    [onContinue],
  );

  useEffect(() => {
    checkLocationPermission().then(update);
    // Back from the system settings with the permission granted: straight into the game.
    const sub = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') checkLocationPermission().then(update);
    });
    return () => sub?.remove();
  }, [update]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  if (state === null) return <Screen testID="location-screen">{null}</Screen>;

  const advice = locationAdvice(state);
  const act = async (action: LocationAction) => {
    if (action === 'allow' || action === 'askAgain') update(await requestLocationPermission());
    else if (action === 'enable') update(await enableLocationServices());
    else if (action === 'retry') update(await checkLocationPermission());
    else Linking.openSettings().catch(() => undefined);
  };

  return (
    <Screen testID="location-screen">
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.kicker}>{t.location.kicker.toUpperCase()}</Text>
        <Text style={styles.title} accessibilityRole="header" testID={`location-state-${state}`}>
          {t.location[advice.title]}
        </Text>
        <Text style={styles.paragraph}>{t.location.why}</Text>
        <View style={styles.card}>
          <Text style={styles.bullet}>{t.location.private}</Text>
          <Text style={styles.bullet}>{t.location.battery}</Text>
          <Text style={styles.bullet}>{t.location.compass}</Text>
        </View>
        {advice.body && <Text style={styles.paragraph}>{t.location[advice.body]}</Text>}
        {advice.action === 'openSettings' && <Text style={styles.hint}>{t.location.returnHint}</Text>}
      </ScrollView>
      {advice.action && <Button label={t.location[advice.action]} onPress={() => act(advice.action!)} testID="location-action" />}
      <Button label={t.location.withoutGps} onPress={() => onContinue(false)} variant="secondary" testID="location-without-gps" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md, paddingBottom: spacing.md },
  kicker: { color: workshop.goldDeep, fontSize: font.small, fontWeight: '800', letterSpacing: 2 },
  title: { color: workshop.goldBright, fontSize: font.heading, fontWeight: '800' },
  paragraph: { color: colors.text, fontSize: font.body, lineHeight: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: workshop.ink700 },
  bullet: { color: colors.text, fontSize: font.small + 1, lineHeight: 21 },
  hint: { color: colors.muted, fontSize: font.small, fontStyle: 'italic' },
});
