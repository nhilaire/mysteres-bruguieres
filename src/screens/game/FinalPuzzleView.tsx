import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FlipInXUp, useAnimatedStyle, useSharedValue, withSequence, withTiming, ZoomIn } from 'react-native-reanimated';

import { playSound, vibrate } from '../../feedback/feedback';
import {
  activeLine,
  canReveal,
  eraseDigit,
  isPuzzleSolved,
  letterOf,
  Operation,
  OPERATIONS,
  operationResult,
  PuzzleState,
  reveal,
  submit,
  typeDigit,
} from '../../game/puzzle';
import { useI18n } from '../../i18n/I18nProvider';
import { AugustePortrait } from '../../ui/AugustePortrait';
import { Button } from '../../ui/Button';
import { daylight, font, spacing, workshop } from '../../ui/theme';

type Props = {
  numbers: readonly number[];
  puzzle: PuzzleState;
  onChange: (puzzle: PuzzleState, event: 'right' | 'wrong' | 'revealed') => void;
  onContinue: () => void;
};

const ALPHABET = Array.from({ length: 26 }, (_, i) => i + 1);

export function operationLabel(op: Operation, ordinal: (n: number) => string): string {
  const a = ordinal(op.a);
  const b = ordinal(op.b);
  if (op.kind === 'add') return `${a} + ${b}`;
  if (op.kind === 'sub') return `${a} − ${b}`;
  return `${a} ÷ ${b} − ${b}`;
}

export function FinalPuzzleView({ numbers, puzzle, onChange, onContinue }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const [input, setInput] = useState('');
  const active = activeLine(puzzle);
  const solved = isPuzzleSolved(puzzle);

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  useEffect(() => {
    if (solved) playSound('chime');
  }, [solved]);

  const validate = () => {
    if (input === '') return;
    const { state, result } = submit(puzzle, numbers, Number(input));
    setInput('');
    if (result === 'ignored') return;
    if (result === 'right') {
      playSound('tick');
      vibrate('letter');
    } else {
      playSound('wrong');
      vibrate('wrong');
      shake.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 80 }), withTiming(-6, { duration: 70 }), withTiming(0, { duration: 60 }));
    }
    onChange(state, result);
  };

  const showMe = () => {
    playSound('tick');
    vibrate('letter');
    onChange(reveal(puzzle), 'revealed');
  };

  const portraitWidth = Math.min(width * 0.28, 120);
  const lastWrong = active >= 0 && puzzle.lines[active].wrong > 0;

  return (
    <ScrollView contentContainerStyle={styles.container} testID="puzzle-screen">
      <View style={styles.header}>
        <AugustePortrait width={portraitWidth} reaction={solved ? 'surprised' : 'focused'} />
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            {t.puzzle.title}
          </Text>
          <Text style={styles.intro}>{t.puzzle.intro}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t.puzzle.numbersLabel}</Text>
        <View style={styles.numbers}>
          {numbers.map((n, i) => (
            <View key={i} style={styles.number}>
              <Text style={styles.numberRank}>{t.puzzle.ordinal(i + 1)}</Text>
              <Text style={styles.numberValue}>{n}</Text>
            </View>
          ))}
        </View>
        <View style={styles.alphabet}>
          {ALPHABET.map((n) => (
            <Text key={n} style={styles.alpha}>
              {letterOf(n)}
              <Text style={styles.alphaN}>{n}</Text>
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.lines}>
        {OPERATIONS.map((op, i) => {
          const line = puzzle.lines[i];
          const isActive = i === active;
          const result = operationResult(op, numbers);
          const row = (
            <View style={[styles.line, isActive && styles.lineActive]} testID={`puzzle-line-${i}`}>
              <Text style={styles.op}>{operationLabel(op, t.puzzle.ordinal)} =</Text>
              <Text style={styles.result}>{line.solved ? result : isActive ? input || '…' : ''}</Text>
              <View style={styles.letterBox}>
                {line.solved && (
                  <Animated.Text entering={FlipInXUp.duration(350)} style={styles.letter} testID={`puzzle-letter-${i}`}>
                    {letterOf(result)}
                  </Animated.Text>
                )}
              </View>
            </View>
          );
          return isActive ? (
            <Animated.View key={i} style={shakeStyle}>
              {row}
            </Animated.View>
          ) : (
            <View key={i}>{row}</View>
          );
        })}
      </View>

      {solved ? (
        <Animated.View entering={ZoomIn.duration(500)} style={styles.reveal} testID="puzzle-solved">
          <Text style={styles.solvedLabel}>{t.puzzle.solved}</Text>
          <Text style={styles.word}>{OPERATIONS.map((op) => letterOf(operationResult(op, numbers))).join('')}</Text>
          <Button label={t.puzzle.continue} onPress={onContinue} testID="puzzle-continue" />
        </Animated.View>
      ) : (
        <>
          {lastWrong && <Text style={styles.wrong}>{t.puzzle.wrong}</Text>}
          {canReveal(puzzle) && (
            <View style={styles.revealHelp}>
              <Text style={styles.hint}>{t.puzzle.revealHint}</Text>
              <Button label={t.puzzle.reveal} onPress={showMe} variant="secondary" testID="puzzle-reveal" />
            </View>
          )}
          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
              <Pressable
                key={d}
                testID={`keypad-${d}`}
                accessibilityRole="button"
                accessibilityLabel={String(d)}
                onPress={() => setInput((v) => typeDigit(v, d))}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyText}>{d}</Text>
              </Pressable>
            ))}
            <Pressable
              testID="keypad-erase"
              accessibilityRole="button"
              accessibilityLabel={t.puzzle.erase}
              onPress={() => setInput(eraseDigit)}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            >
              <Text style={styles.keyText}>⌫</Text>
            </Pressable>
          </View>
          <Button label={t.puzzle.validate} onPress={validate} disabled={input === ''} testID="keypad-validate" />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: spacing.md, paddingBottom: spacing.md },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  headerText: { flex: 1, gap: spacing.xs },
  title: { color: daylight.text, fontSize: font.heading, fontWeight: '900' },
  intro: { color: daylight.text, fontSize: font.small + 1, lineHeight: 21 },
  card: { backgroundColor: daylight.card, borderRadius: 16, padding: spacing.sm, gap: spacing.sm },
  label: { color: daylight.muted, fontSize: font.small, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  numbers: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  number: { alignItems: 'center', minWidth: 30, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2 },
  numberRank: { color: daylight.muted, fontSize: 11 },
  numberValue: { color: daylight.text, fontSize: font.body, fontWeight: '900' },
  alphabet: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 6, rowGap: 2 },
  alpha: { color: daylight.text, fontSize: 13, fontWeight: '800', width: 34, textAlign: 'center' },
  alphaN: { color: daylight.muted, fontSize: 10, fontWeight: '400' },
  lines: { gap: 6 },
  line: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 10, paddingHorizontal: spacing.sm, minHeight: 42 },
  lineActive: { backgroundColor: '#fff', borderWidth: 2, borderColor: workshop.goldDeep },
  op: { flex: 1, color: daylight.text, fontSize: font.body },
  result: { width: 52, textAlign: 'right', color: daylight.text, fontSize: font.body + 2, fontWeight: '900' },
  letterBox: { width: 42, alignItems: 'center' },
  letter: { color: workshop.goldDeep, fontSize: font.heading, fontWeight: '900' },
  wrong: { color: daylight.error, fontSize: font.body, fontWeight: '800', textAlign: 'center' },
  revealHelp: { gap: spacing.sm },
  hint: { color: daylight.text, fontSize: font.small, textAlign: 'center' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  key: { width: 62, height: 52, borderRadius: 12, backgroundColor: '#fff8e6', borderWidth: 2, borderColor: workshop.goldDeep, alignItems: 'center', justifyContent: 'center' },
  keyPressed: { backgroundColor: workshop.goldBright, transform: [{ scale: 0.95 }] },
  keyText: { color: daylight.text, fontSize: font.heading - 2, fontWeight: '800' },
  reveal: { alignItems: 'stretch', gap: spacing.md },
  solvedLabel: { color: daylight.text, fontSize: font.body, textAlign: 'center' },
  word: { color: workshop.ink800, fontSize: 52, fontWeight: '900', letterSpacing: 8, textAlign: 'center' },
});
