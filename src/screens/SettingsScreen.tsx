import { useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { LANGUAGE_NAMES, LANGUAGES, LanguageSetting } from '../i18n';
import { useI18n } from '../i18n/I18nProvider';
import type { FeedbackSettings } from '../storage/feedbackSettings';
import { Button } from '../ui/Button';
import { Screen } from '../ui/Screen';
import { colors, font, spacing } from '../ui/theme';

type Props = {
  telemetryEnabled: boolean;
  onToggleTelemetry: (granted: boolean) => void;
  feedback: FeedbackSettings;
  onChangeFeedback: (settings: FeedbackSettings) => void;
  onBack: () => void;
};

function SwitchRow(props: { label: string; help: string; value: boolean; onChange: (value: boolean) => void; testID: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.label}>{props.label}</Text>
        <Text style={styles.help}>{props.help}</Text>
      </View>
      <Switch
        value={props.value}
        onValueChange={props.onChange}
        accessibilityLabel={props.label}
        testID={props.testID}
        trackColor={{ true: colors.accent, false: colors.background }}
      />
    </View>
  );
}

export function SettingsScreen({ telemetryEnabled, onToggleTelemetry, feedback, onChangeFeedback, onBack }: Props) {
  const { t, setting, setSetting } = useI18n();
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);
  const choices: { value: LanguageSetting; label: string }[] = [
    { value: 'auto', label: t.settings.languageAuto },
    ...LANGUAGES.map((language) => ({ value: language, label: LANGUAGE_NAMES[language] })),
  ];

  return (
    <Screen testID="settings-screen">
      <Text style={styles.title} accessibilityRole="header">
        {t.settings.title}
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        <SwitchRow
          label={t.settings.sound}
          help={t.settings.soundHelp}
          value={feedback.sound}
          onChange={(sound) => onChangeFeedback({ ...feedback, sound })}
          testID="settings-sound"
        />
        <SwitchRow
          label={t.settings.haptics}
          help={t.settings.hapticsHelp}
          value={feedback.haptics}
          onChange={(haptics) => onChangeFeedback({ ...feedback, haptics })}
          testID="settings-haptics"
        />
        <SwitchRow
          label={t.settings.telemetry}
          help={t.settings.telemetryHelp}
          value={telemetryEnabled}
          onChange={onToggleTelemetry}
          testID="settings-telemetry"
        />
        <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={t.settings.language}>
          <Text style={styles.label}>{t.settings.language}</Text>
          {choices.map(({ value, label }) => {
            const selected = value === setting;
            return (
              <Pressable
                key={value}
                testID={`settings-language-${value}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={label}
                onPress={() => setSetting(value)}
                style={[styles.choice, selected && styles.choiceSelected]}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Button label={t.settings.back} onPress={onBack} variant="secondary" testID="settings-back" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: font.heading, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
  },
  rowText: { flex: 1, gap: spacing.xs },
  label: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  help: { color: colors.muted, fontSize: font.small },
  group: { gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md },
  choice: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  choiceSelected: { borderColor: colors.accent },
  choiceText: { color: colors.muted, fontSize: font.body },
  choiceTextSelected: { color: colors.text, fontWeight: '700' },
  list: { gap: spacing.md, paddingBottom: spacing.md },
});
