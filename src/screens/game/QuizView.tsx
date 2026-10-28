import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { Reaction } from '../../assets';
import { playSound, vibrate } from '../../feedback/feedback';
import type { AnswerResult } from '../../game/adventure';
import { questionLines, QuizScreen } from '../../game/scenario';
import { useI18n } from '../../i18n/I18nProvider';
import { AugustePortrait } from '../../ui/AugustePortrait';
import { daylight, font, spacing } from '../../ui/theme';

export const RIGHT_DELAY_MS = 800;
export const WRONG_MS = 1500;

type Props = {
  quiz: QuizScreen;
  solved: boolean;
  onAnswer: (choice: string) => AnswerResult;
  onNext: () => void;
};

type Feedback = { choice: string; result: 'right' | 'wrong' } | null;

export function QuizView({ quiz, solved, onAnswer, onNext }: Props) {
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!feedback) return;
    const id =
      feedback.result === 'right' ? setTimeout(onNext, RIGHT_DELAY_MS) : setTimeout(() => setFeedback(null), WRONG_MS);
    return () => clearTimeout(id);
  }, [feedback, onNext]);

  const choose = (choice: string) => {
    if (feedback) return;
    const result = onAnswer(choice);
    if (result === 'ignored') return;
    setFeedback({ choice, result });
    playSound(result);
    vibrate(result);
  };

  const reaction: Reaction | undefined =
    feedback?.result === 'right' || solved ? 'amazed' : feedback?.result === 'wrong' ? 'worried' : undefined;
  const portraitWidth = Math.min(width * 0.36, height * 0.18, 170);

  return (
    <ScrollView contentContainerStyle={styles.container} testID="quiz-screen">
      <View style={styles.header}>
        <AugustePortrait width={portraitWidth} reaction={reaction} pose={1} />
        <View style={styles.bubble}>
          <Text style={styles.intro}>{quiz.intro}</Text>
          {feedback && (
            <Text style={[styles.verdict, feedback.result === 'right' ? styles.rightText : styles.wrongText]} testID={`quiz-${feedback.result}`}>
              {feedback.result === 'right' ? t.quiz.right : t.quiz.wrong}
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
              <Text style={[styles.choiceText, isRight && styles.rightText, isWrong && styles.wrongText]}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>
      {!solved && !feedback && <Text style={styles.waiting}>{t.quiz.waiting}</Text>}
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
  waiting: { color: daylight.muted, fontSize: font.small, textAlign: 'center', fontStyle: 'italic' },
});
