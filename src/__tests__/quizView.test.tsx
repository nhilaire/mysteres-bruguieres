import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { playSound, vibrate } from '../feedback/feedback';
import type { QuizScreen } from '../game/scenario';
import { QuizView, RIGHT_DELAY_MS, WRONG_MS } from '../screens/game/QuizView';

jest.mock('../feedback/feedback', () => ({ playSound: jest.fn(), stopSound: jest.fn(), vibrate: jest.fn() }));

const quiz: QuizScreen = { type: 'quiz', intro: 'Bravo !', question: 'Combien ?', choices: ['1', '2', '3'], answer: '2' };
const judge = (choice: string) => (choice === quiz.answer ? 'right' : 'wrong');

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

it('a wrong answer turns red with the head-scratching portrait, then allows a retry', async () => {
  const onNext = jest.fn();
  await render(<QuizView quiz={quiz} solved={false} onAnswer={judge} onNext={onNext} />);
  await fireEvent.press(screen.getByTestId('quiz-choice-0'));
  expect(screen.getByTestId('quiz-wrong')).toBeTruthy();
  expect(screen.getByTestId('auguste-reaction-worried')).toBeTruthy();
  expect(playSound).toHaveBeenCalledWith('wrong');
  expect(vibrate).toHaveBeenCalledWith('wrong');
  // During the red state another tap is ignored; afterwards the player can try again.
  await fireEvent.press(screen.getByTestId('quiz-choice-1'));
  expect(screen.queryByTestId('quiz-right')).toBeNull();
  await act(async () => jest.advanceTimersByTime(WRONG_MS));
  expect(onNext).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('quiz-choice-1'));
  expect(screen.getByTestId('quiz-right')).toBeTruthy();
});

it('the right answer turns green with the happy portrait and moves on after 800 ms', async () => {
  const onNext = jest.fn();
  await render(<QuizView quiz={quiz} solved={false} onAnswer={judge} onNext={onNext} />);
  await fireEvent.press(screen.getByTestId('quiz-choice-1'));
  expect(screen.getByTestId('quiz-right')).toBeTruthy();
  expect(screen.getByTestId('auguste-reaction-amazed')).toBeTruthy();
  expect(playSound).toHaveBeenCalledWith('right');
  await act(async () => jest.advanceTimersByTime(RIGHT_DELAY_MS - 1));
  expect(onNext).not.toHaveBeenCalled();
  await act(async () => jest.advanceTimersByTime(1));
  expect(onNext).toHaveBeenCalledTimes(1);
});

it('a solved riddle is read-only', async () => {
  const onAnswer = jest.fn();
  await render(<QuizView quiz={quiz} solved onAnswer={onAnswer} onNext={jest.fn()} />);
  await fireEvent.press(screen.getByTestId('quiz-choice-0'));
  expect(onAnswer).not.toHaveBeenCalled();
  expect(screen.getByTestId('quiz-choice-1').props.accessibilityState).toMatchObject({ disabled: true, selected: true });
});
