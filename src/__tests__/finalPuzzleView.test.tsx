import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { playSound } from '../feedback/feedback';
import { initialPuzzle, PuzzleState } from '../game/puzzle';
import { riddleAnswers } from '../game/scenario';
import { SCENARIOS } from '../i18n/scenario';
import { FinalPuzzleView, operationLabel } from '../screens/game/FinalPuzzleView';

jest.mock('../feedback/feedback', () => ({ playSound: jest.fn(), stopSound: jest.fn(), vibrate: jest.fn() }));

const numbers = riddleAnswers(SCENARIOS.fr);

function Harness({ onContinue, start = initialPuzzle }: { onContinue: () => void; start?: PuzzleState }) {
  const [puzzle, setPuzzle] = useState(start);
  return <FinalPuzzleView numbers={numbers} puzzle={puzzle} onChange={setPuzzle} onContinue={onContinue} />;
}

async function type(value: number) {
  for (const digit of String(value)) await fireEvent.press(screen.getByTestId(`keypad-${digit}`));
  await fireEvent.press(screen.getByTestId('keypad-validate'));
}

beforeEach(() => jest.clearAllMocks());

it('labels the operations with ordinals', () => {
  expect(operationLabel({ kind: 'sub', a: 2, b: 1 }, (n) => (n === 1 ? '1er' : `${n}e`))).toBe('2e − 1er');
  expect(operationLabel({ kind: 'divSub', a: 9, b: 7 }, (n) => `${n}th`)).toBe('9th ÷ 7th − 7th');
});

it('reveals GAMOUNA letter by letter when the 7 right results are typed, then continues', async () => {
  const onContinue = jest.fn();
  await render(<Harness onContinue={onContinue} />);
  expect(screen.getByTestId('auguste-reaction-focused')).toBeTruthy();
  await type(7);
  expect(screen.getByTestId('puzzle-letter-0').props.children).toBe('G');
  for (const value of [1, 13, 15, 21, 14, 1]) await type(value);
  expect(screen.getByText('GAMOUNA')).toBeTruthy();
  expect(screen.getByTestId('auguste-reaction-surprised')).toBeTruthy();
  expect(playSound).toHaveBeenCalledWith('chime');
  await fireEvent.press(screen.getByTestId('puzzle-continue'));
  expect(onContinue).toHaveBeenCalled();
});

it('a wrong result clears the input and offers "Show me" after 3 attempts', async () => {
  await render(<Harness onContinue={jest.fn()} />);
  await type(8);
  expect(screen.queryByTestId('puzzle-letter-0')).toBeNull();
  expect(playSound).toHaveBeenCalledWith('wrong');
  expect(screen.queryByTestId('puzzle-reveal')).toBeNull();
  await type(9);
  await type(10);
  await fireEvent.press(screen.getByTestId('puzzle-reveal'));
  expect(screen.getByTestId('puzzle-letter-0').props.children).toBe('G');
  expect(screen.queryByTestId('puzzle-reveal')).toBeNull();
});

it('keeps "Show me" offered when restored with 3 wrong attempts', async () => {
  const start: PuzzleState = { lines: initialPuzzle.lines.map((line, i) => (i === 0 ? { ...line, wrong: 3 } : line)) };
  await render(<Harness onContinue={jest.fn()} start={start} />);
  expect(screen.getByTestId('puzzle-reveal')).toBeTruthy();
});

it('shows a solved puzzle read-only with all 7 letters', async () => {
  const start: PuzzleState = { lines: initialPuzzle.lines.map((line) => ({ ...line, solved: true })) };
  await render(<Harness onContinue={jest.fn()} start={start} />);
  expect(screen.getByText('GAMOUNA')).toBeTruthy();
  expect(screen.queryByTestId('keypad-validate')).toBeNull();
});
