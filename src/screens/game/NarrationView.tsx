import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { playSound, stopSound } from '../../feedback/feedback';
import { boldSegments, initialNarration, isTyping, tapNarration, TYPEWRITER_MS, typeNext, visibleText } from '../../game/narration';
import { useI18n } from '../../i18n/I18nProvider';
import { AugustePortrait } from '../../ui/AugustePortrait';
import { daylight, font, spacing } from '../../ui/theme';

type Props = {
  texts: readonly string[];
  sound?: 'bells';
  onFinish: () => void;
};

// Auguste tells the story: animated portrait on top, typewriter text below; tap the text to go on.
export function NarrationView({ texts, sound, onFinish }: Props) {
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();
  const blocks = useMemo(() => texts.map(visibleText), [texts]);
  const [state, setState] = useState(initialNarration);
  const typing = isTyping(state, blocks);

  useEffect(() => {
    if (!typing) return;
    const id = setTimeout(() => setState((s) => typeNext(s, blocks)), TYPEWRITER_MS);
    return () => clearTimeout(id);
  }, [typing, state, blocks]);

  useEffect(() => {
    if (!sound) return;
    playSound(sound);
    return () => stopSound(sound);
  }, [sound]);

  const tap = () => {
    const next = tapNarration(state, blocks);
    if (next.finished) onFinish();
    else setState(next.state);
  };

  const last = state.block === blocks.length - 1;
  const hint = typing ? t.game.tapHintTyping : last ? t.game.tapHintLast : t.game.tapHintNext;
  const portraitWidth = Math.min(width * 0.62, height * 0.3, 280);

  return (
    <View style={styles.container}>
      <View style={styles.portrait}>
        <AugustePortrait width={portraitWidth} pose={state.block} talking={typing} breathing />
      </View>
      <Pressable style={styles.card} onPress={tap} accessibilityRole="button" accessibilityHint={hint} testID="narration-tap">
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.text} testID="narration-text">
            {boldSegments(texts[state.block] ?? '', state.shown).map((segment, i) => (
              <Text key={i} style={segment.bold && styles.bold}>
                {segment.text}
              </Text>
            ))}
          </Text>
        </ScrollView>
        {!typing && <Text style={styles.continue}>{t.game.tapToContinue}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md },
  portrait: { alignItems: 'center' },
  card: { flex: 1, backgroundColor: daylight.card, borderRadius: 18, padding: spacing.md, gap: spacing.sm },
  scroll: { flexGrow: 1 },
  text: { color: daylight.text, fontSize: font.body + 1, lineHeight: 27 },
  bold: { fontWeight: '800' },
  continue: { color: daylight.muted, fontSize: font.small, textAlign: 'center', fontStyle: 'italic' },
});
