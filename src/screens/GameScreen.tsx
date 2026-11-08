import { useCallback, useEffect } from 'react';
import { BackHandler, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

import { answer, AnswerVerdict, arrive, canGoBack, canGoForward, goBack, goForward, next, Progress, rate } from '../game/adventure';
import { PuzzleState } from '../game/puzzle';
import { riddleAnswers, stepOf } from '../game/scenario';
import { useI18n } from '../i18n/I18nProvider';
import { SCENARIOS } from '../i18n/scenario';
import { DaylightBackground } from '../ui/DaylightBackground';
import { font, spacing, workshop } from '../ui/theme';
import { EndView } from './game/EndView';
import { FinalPuzzleView } from './game/FinalPuzzleView';
import { NarrationView } from './game/NarrationView';
import { QuizView } from './game/QuizView';
import { RadarView } from './game/RadarView';

export type GameEvents = {
  onPlaceReached?: (step: number, kind: 'auto' | 'manual', hasFix: boolean) => void;
  onMapsOpened?: (step: number) => void;
  onRiddleSolved?: (step: number, firstTry: boolean, wrong: number) => void;
  onPuzzleSolved?: (puzzle: PuzzleState) => void;
  onFinished?: (score: number) => void;
  onRated?: (rating: number) => void;
};

type Props = {
  progress: Progress;
  onProgress: (update: (progress: Progress) => Progress) => void;
  onMenu: () => void;
  onRestart: () => void;
  events?: GameEvents;
};

// Cross-fade with a slight slide between two screens of the adventure.
const ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 24 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }] },
}).duration(250);

export function GameScreen({ progress, onProgress, onMenu, onRestart, events = {} }: Props) {
  const { t, language } = useI18n();
  const scenario = SCENARIOS[language];
  const index = progress.current;
  const screen = scenario.screens[index];

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onMenu();
      return true;
    });
    return () => sub.remove();
  }, [onMenu]);

  // The end screen is reported the first time it is reached.
  const goNext = useCallback(() => {
    const target = index + 1;
    if (scenario.screens[target]?.type === 'final' && progress.furthest < target) events.onFinished?.(progress.score);
    onProgress((p) => next(scenario, p));
  }, [events, index, onProgress, progress.furthest, progress.score, scenario]);

  const onArrive = useCallback(
    (kind: 'auto' | 'manual', hasFix: boolean) => {
      if (!progress.reached.includes(index)) events.onPlaceReached?.(stepOf(scenario, index), kind, hasFix);
      onProgress((p) => arrive(scenario, p, index).progress);
    },
    [events, index, onProgress, progress.reached, scenario],
  );

  const onAnswer = (choice: string): AnswerVerdict => {
    const outcome = answer(scenario, progress, index, choice);
    if (outcome.result === 'right') events.onRiddleSolved?.(stepOf(scenario, index), outcome.firstTry, progress.wrong[index] ?? 0);
    onProgress(() => outcome.progress);
    return { result: outcome.result, firstTry: outcome.firstTry };
  };

  let content: React.ReactNode;
  switch (screen.type) {
    case 'home':
    case 'explanation':
      content = <NarrationView texts={screen.texts} sound={screen.sound} onFinish={goNext} />;
      break;
    case 'radar':
      content = (
        <RadarView
          target={screen}
          step={stepOf(scenario, index)}
          onArrive={onArrive}
          onLost={() => events.onMapsOpened?.(stepOf(scenario, index))}
        />
      );
      break;
    case 'quiz':
      content = <QuizView quiz={screen} solved={progress.solved.includes(index)} onAnswer={onAnswer} onNext={goNext} />;
      break;
    case 'final_puzzle':
      content = (
        <FinalPuzzleView
          numbers={riddleAnswers(scenario)}
          puzzle={progress.puzzle}
          onChange={(puzzle) => {
            if (puzzle.lines.every((l) => l.solved) && !progress.puzzle.lines.every((l) => l.solved)) events.onPuzzleSolved?.(puzzle);
            onProgress((p) => ({ ...p, puzzle }));
          }}
          onContinue={goNext}
        />
      );
      break;
    case 'final':
      content = (
        <EndView
          texts={screen.texts}
          score={progress.score}
          rating={progress.rating}
          onRate={(stars) => {
            if (progress.rating === null) events.onRated?.(stars);
            onProgress((p) => rate(p, stars));
          }}
          onRestart={onRestart}
        />
      );
      break;
  }

  const radar = screen.type === 'radar';
  const back = canGoBack(scenario, progress);
  const forward = canGoForward(scenario, progress);

  return (
    <View style={[styles.screen, { paddingTop: (StatusBar.currentHeight ?? 0) + spacing.sm }]} testID="game-screen">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <DaylightBackground />
      <View style={styles.bar}>
        <Pressable
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel={t.game.menuLabel}
          accessibilityHint={t.game.menuHint}
          style={styles.menu}
          testID="game-menu"
        >
          <Text style={styles.menuText}>☰ {t.game.menu}</Text>
        </Pressable>
        {!radar && (
          <View style={styles.arrows}>
            <Arrow label="‹" a11y={t.game.back} enabled={back} onPress={() => onProgress((p) => goBack(scenario, p))} testID="game-back" />
            <Arrow
              label="›"
              a11y={t.game.forward}
              enabled={forward}
              onPress={() => onProgress((p) => goForward(scenario, p))}
              testID="game-forward"
            />
          </View>
        )}
      </View>
      <Animated.View key={`${language}-${index}`} entering={ENTER} style={styles.content} testID={`game-step-${index}`}>
        {content}
      </Animated.View>
    </View>
  );
}

function Arrow({
  label,
  a11y,
  enabled,
  onPress,
  testID,
}: {
  label: string;
  a11y: string;
  enabled: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled: !enabled }}
      style={[styles.arrow, !enabled && styles.arrowOff]}
      testID={testID}
    >
      <Text style={styles.arrowText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  menu: {
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(36, 23, 8, 0.85)',
  },
  menuText: { color: workshop.goldBright, fontSize: font.body, fontWeight: '700' },
  arrows: { flexDirection: 'row', gap: spacing.sm },
  arrow: {
    width: 48,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36, 23, 8, 0.85)',
  },
  arrowOff: { opacity: 0.3 },
  arrowText: { color: workshop.goldBright, fontSize: 28, fontWeight: '700', marginTop: -4 },
  content: { flex: 1 },
});
