import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { Reaction } from '../../assets';
import { playSound, vibrate } from '../../feedback/feedback';
import type { AnswerVerdict } from '../../game/adventure';
import { questionLines, QuizScreen } from '../../game/scenario';
import { useI18n } from '../../i18n/I18nProvider';
import { AugustePortrait } from '../../ui/AugustePortrait';
import { Button } from '../../ui/Button';
import { daylight, font, spacing } from '../../ui/theme';

export const WRONG_MS = 1500;

type Props = {
  quiz: QuizScreen;
  solved: boolean;
  onAnswer: (choice: string) => AnswerVerdict;
  onNext: () => void;
};

type Feedback = { choice: string; result: 'right' | 'wrong' } | null;

export function QuizView({ quiz, solved, onAnswer, onNext }: Props) {
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();
  const [feedback, setFeedback] = useState<Feedback>(null);
  // The verdict (and Auguste's reaction) stays until the next answer; the red button only for WRONG_MS.
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null);
  // The engine's verdict on the right answer: no point when a wrong answer came first, even before a remount.
  const [scored, setScored] = useState(false);

  // The red state lasts WRONG_MS; a right answer stays on screen until the player taps Continue.
  useEffect(() => {
    if (feedback?.result !== 'wrong') return;
    const id = setTimeout(() => setFeedback(null), WRONG_MS);
    return () => clearTimeout(id);
  }, [feedback]);

  const choose = (choice: string) => {
    if (feedback || verdict === 'right') return;
    const { result, firstTry } = onAnswer(choice);
    if (result === 'ignored') return;
    setFeedback({ choice, result });
    setVerdict(result);
    if (result === 'right') setScored(firstTry);
    playSound(result);
    vibrate(result);
  };

  const reaction: Reaction | undefined = verdict === 'right' || solved ? 'amazed' : verdict === 'wrong' ? 'worried' : undefined;
  const portraitWidth = Math.min(width * 0.36, height * 0.18, 170);

  return (
    <ScrollView contentContainerStyle={styles.container} testID="quiz-screen">
      <View style={styles.header}>
        <AugustePortrait width={portraitWidth} reaction={reaction} pose={1} />
        <View style={styles.bubble}>
          <Text style={styles.intro}>{quiz.intro}</Text>
          {verdict && (
            <Text style={[styles.verdict, verdict === 'right' ? styles.rightText : styles.wrongText]} testID={`quiz-${verdict}`}>
              {verdict === 'right' ? t.quiz.right : t.quiz.wrong}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.card}>
        {questionLines(quiz.question).map((line) => (
          <Text key={line} style={styles.question}>
            {line}
          </Text>
        ))}
      </View>
      <View style={styles.choices} accessibilityRole="radiogroup">
        {quiz.choices.map((choice, i) => {
          const isRight = (solved && choice === quiz.answer) || (feedback?.choice === choice && feedback.result === 'right');
          const isWrong = feedback?.choice === choice && feedback.result === 'wrong';
          return (
            <Pressable
              key={choice}
              testID={`quiz-choice-${i}`}
              accessibilityRole="button"
              accessibilityLabel={t.quiz.answer(choice)}
              accessibilityState={{ disabled: solved, selected: isRight }}
              disabled={solved}
              onPress={() => choose(choice)}
              style={({ pressed }) => [styles.choice, pressed && styles.pressed, isRight && styles.right, isWrong && styles.wrong]}
            >
              <Text
                style={[styles.choiceText, isRight && styles.rightText, isWrong && styles.wrongText]}
                testID={isWrong ? 'quiz-red' : undefined}
              >
                {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!solved && !verdict && <Text style={styles.waiting}>{t.quiz.waiting}</Text>}
      {verdict === 'right' && (
        <Text style={styles.point} testID={scored ? 'quiz-point' : 'quiz-no-point'}>
          {scored ? t.quiz.point : t.quiz.noPoint}
        </Text>
      )}
      {(solved || verdict === 'right') && <Button label={t.quiz.continue} onPress={onNext} testID="quiz-continue" />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: spacing.md, paddingBottom: spacing.md },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  bubble: { flex: 1, gap: spacing.sm },
  intro: { color: daylight.text, fontSize: font.body, fontWeight: '700', lineHeight: 23 },
  verdict: { fontSize: font.heading - 2, fontWeight: '900' },
  card: { backgroundColor: daylight.card, borderRadius: 18, padding: spacing.md, gap: spacing.xs },
  question: { color: daylight.text, fontSize: font.body + 1, lineHeight: 25 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  choice: {
    minWidth: 92,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: '#fff8e6',
    borderWidth: 2,
    borderColor: '#a3701c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.95 }] },
  right: { backgroundColor: daylight.successBg, borderColor: daylight.success },
  wrong: { backgroundColor: daylight.errorBg, borderColor: daylight.error },
  choiceText: { color: daylight.text, fontSize: font.heading - 2, fontWeight: '800' },
  rightText: { color: daylight.success },
  wrongText: { color: daylight.error },
  point: { color: daylight.text, fontSize: font.body, fontWeight: '700', textAlign: 'center' },
  waiting: { color: daylight.muted, fontSize: font.small, textAlign: 'center', fontStyle: 'italic' },
});
