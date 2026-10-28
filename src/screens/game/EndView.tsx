import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useI18n } from '../../i18n/I18nProvider';
import { AugustePortrait } from '../../ui/AugustePortrait';
import { Button } from '../../ui/Button';
import { daylight, font, spacing } from '../../ui/theme';

type Props = {
  texts: readonly string[];
  score: number;
  rating: number | null;
  onRate: (stars: number) => void;
  onRestart: () => void;
};

export function EndView({ texts, score, rating, onRate, onRestart }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  return (
    <ScrollView contentContainerStyle={styles.container} testID="end-screen">
      <AugustePortrait width={Math.min(width * 0.45, 200)} reaction="happy" />
      <Text style={styles.title} accessibilityRole="header">
        {t.final.title}
      </Text>
      <View style={styles.card}>
        {texts.map((text) => (
          <Text key={text} style={styles.text}>
            {text}
          </Text>
        ))}
      </View>
      <Text style={styles.score} testID="end-score">
        {t.final.score(score)}
      </Text>
      <Text style={styles.rate}>{rating === null ? t.final.rate : t.final.thanks}</Text>
      <View style={styles.stars} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = rating !== null && n <= rating;
          return (
            <Pressable
              key={n}
              testID={`end-star-${n}`}
              accessibilityRole="radio"
              accessibilityLabel={t.final.star(n)}
              accessibilityState={{ checked: rating === n, disabled: rating !== null }}
              disabled={rating !== null}
              onPress={() => onRate(n)}
              hitSlop={6}
            >
              <Text style={[styles.star, { color: filled ? daylight.star : daylight.starOff }]}>★</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.spacer} />
      <Button label={t.final.restart} onPress={onRestart} variant="secondary" testID="end-restart" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', gap: spacing.md, paddingBottom: spacing.md },
  title: { color: daylight.text, fontSize: font.title - 4, fontWeight: '900', textAlign: 'center' },
  card: { alignSelf: 'stretch', backgroundColor: daylight.card, borderRadius: 18, padding: spacing.md, gap: spacing.sm },
  text: { color: daylight.text, fontSize: font.body, lineHeight: 24, textAlign: 'center' },
  score: { color: daylight.text, fontSize: font.body + 1, fontWeight: '800', textAlign: 'center' },
  rate: { color: daylight.text, fontSize: font.body },
  stars: { flexDirection: 'row', gap: spacing.sm },
  star: { fontSize: 44 },
  spacer: { flex: 1 },
});
