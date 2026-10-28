import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { TITLE_IMAGE } from '../assets';
import { appName } from '../config/app';
import { useI18n } from '../i18n/I18nProvider';
import { Button } from '../ui/Button';
import { Screen } from '../ui/Screen';
import { colors, font, spacing, workshop } from '../ui/theme';

export type AdventureSummary = { started: boolean; places: number; solved: number; percent: number };

type Props = {
  summary: AdventureSummary;
  onStart: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onAbout: () => void;
};

export function TitleScreen({ summary, onStart, onRestart, onSettings, onAbout }: Props) {
  const { t, language } = useI18n();

  const confirmRestart = () =>
    Alert.alert(t.restart.title, t.restart.body, [
      { text: t.restart.cancel, style: 'cancel' },
      { text: t.restart.confirm, style: 'destructive', onPress: onRestart },
    ]);

  return (
    <Screen testID="title-screen">
      <View style={styles.hero}>
        <Image source={TITLE_IMAGE} style={styles.image} resizeMode="cover" accessibilityLabel={t.title.imageLabel} />
        <Text style={styles.tagline}>{t.title.tagline.toUpperCase()}</Text>
        <Text style={styles.name} accessibilityRole="header">
          {appName(language)}
        </Text>
      </View>
      {summary.started && (
        <View style={styles.card} testID="title-progress">
          <Text style={styles.cardTitle}>{t.title.progressTitle}</Text>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${summary.percent}%` }]} />
          </View>
          <Text style={styles.cardText}>
            {t.title.percent(summary.percent)} · {t.title.progress(summary.places, summary.solved)}
          </Text>
        </View>
      )}
      {summary.started ? (
        <>
          <Button label={t.title.continue} caption={t.title.continueHint} onPress={onStart} testID="title-continue" />
          <Button label={t.title.restart} onPress={confirmRestart} variant="secondary" testID="title-restart" />
        </>
      ) : (
        <Button label={t.title.start} onPress={onStart} testID="title-start" />
      )}
      <View style={styles.row}>
        <View style={styles.half}>
          <Button label={t.title.settings} onPress={onSettings} variant="ghost" testID="title-settings" />
        </View>
        <View style={styles.half}>
          <Button label={t.title.about} onPress={onAbout} variant="ghost" testID="title-about" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  image: { width: 210, height: 280, borderRadius: 18, borderWidth: 3, borderColor: workshop.goldDeep },
  tagline: { color: workshop.goldDeep, fontSize: font.small, fontWeight: '800', letterSpacing: 2, marginTop: spacing.sm },
  name: { color: workshop.goldBright, fontSize: font.title - 4, fontWeight: '800', textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: workshop.ink700 },
  cardTitle: { color: workshop.gold, fontSize: font.small, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  bar: { height: 8, borderRadius: 4, backgroundColor: workshop.ink700, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: workshop.gold },
  cardText: { color: colors.text, fontSize: font.small },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
});
