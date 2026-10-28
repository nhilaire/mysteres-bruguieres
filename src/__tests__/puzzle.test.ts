import {
  activeLine,
  canReveal,
  eraseDigit,
  initialPuzzle,
  isPuzzleSolved,
  letterOf,
  OPERATIONS,
  operationResult,
  puzzleTotals,
  PuzzleState,
  reveal,
  REVEAL_AFTER,
  submit,
  typeDigit,
  word,
} from '../game/puzzle';
import { riddleAnswers } from '../game/scenario';
import { SCENARIOS } from '../i18n/scenario';

const numbers = riddleAnswers(SCENARIOS.fr);

describe('final puzzle cipher', () => {
  it('turns the scenario answers into 7, 1, 13, 15, 21, 14, 1', () => {
    expect(OPERATIONS.map((op) => operationResult(op, numbers))).toEqual([7, 1, 13, 15, 21, 14, 1]);
  });

  it('spells GAMOUNA', () => {
    expect(word(numbers)).toBe('GAMOUNA');
  });

  it('maps 1..26 to A..Z', () => {
    expect(letterOf(1)).toBe('A');
    expect(letterOf(26)).toBe('Z');
    expect(letterOf(0)).toBe('?');
    expect(letterOf(27)).toBe('?');
  });
});

describe('solving lines', () => {
  it('starts on the first line, nothing solved', () => {
    expect(initialPuzzle.lines).toHaveLength(7);
    expect(activeLine(initialPuzzle)).toBe(0);
    expect(isPuzzleSolved(initialPuzzle)).toBe(false);
  });

  it('a right result solves the line and activates the next one', () => {
    const { state, result } = submit(initialPuzzle, numbers, 7);
    expect(result).toBe('right');
    expect(state.lines[0]).toEqual({ solved: true, wrong: 0, revealed: false });
    expect(activeLine(state)).toBe(1);
  });

  it('a wrong result counts on that line only', () => {
    const { state, result } = submit(initialPuzzle, numbers, 8);
    expect(result).toBe('wrong');
    expect(state.lines[0].wrong).toBe(1);
    expect(state.lines[1].wrong).toBe(0);
    expect(activeLine(state)).toBe(0);
  });

  it('offers "Show me" only after 3 wrong attempts on the active line', () => {
    expect(REVEAL_AFTER).toBe(3);
    let state: PuzzleState = initialPuzzle;
    for (let i = 0; i < 2; i++) state = submit(state, numbers, 99).state;
    expect(canReveal(state)).toBe(false);
    expect(reveal(state)).toBe(state);
    state = submit(state, numbers, 99).state;
    expect(canReveal(state)).toBe(true);
    const shown = reveal(state);
    expect(shown.lines[0]).toEqual({ solved: true, wrong: 3, revealed: true });
    expect(activeLine(shown)).toBe(1);
    expect(canReveal(shown)).toBe(false);
  });

  it('is solved when the 7 lines are filled, then ignores input', () => {
    let state: PuzzleState = initialPuzzle;
    for (const value of [7, 1, 13, 15, 21, 14, 1]) state = submit(state, numbers, value).state;
    expect(isPuzzleSolved(state)).toBe(true);
    expect(activeLine(state)).toBe(-1);
    expect(submit(state, numbers, 7).result).toBe('ignored');
  });

  it('reports total wrong attempts and revealed lines', () => {
    let state: PuzzleState = initialPuzzle;
    for (let i = 0; i < 3; i++) state = submit(state, numbers, 0).state;
    state = reveal(state);
    state = submit(state, numbers, 2).state;
    state = submit(state, numbers, 1).state;
    expect(puzzleTotals(state)).toEqual({ wrong: 4, revealed: 1 });
  });
});

describe('keypad input', () => {
  it('accepts up to 3 digits', () => {
    expect(typeDigit('', 1)).toBe('1');
    expect(typeDigit('12', 3)).toBe('123');
    expect(typeDigit('123', 4)).toBe('123');
  });

  it('drops a leading zero', () => {
    expect(typeDigit('0', 5)).toBe('5');
  });

  it('erases the last digit', () => {
    expect(eraseDigit('123')).toBe('12');
    expect(eraseDigit('')).toBe('');
  });
});
