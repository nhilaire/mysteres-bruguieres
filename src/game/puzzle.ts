// The final puzzle: 7 operations on the 9 riddle answers; each result is a letter's place in the alphabet.

// Positions are 1-based, as the player reads them ("2nd minus 1st").
export type Operation =
  | { kind: 'sub'; a: number; b: number }
  | { kind: 'add'; a: number; b: number }
  // "a-th divided by b-th, minus that b-th"
  | { kind: 'divSub'; a: number; b: number };

export const OPERATIONS: readonly Operation[] = [
  { kind: 'sub', a: 2, b: 1 },
  { kind: 'sub', a: 2, b: 3 },
  { kind: 'sub', a: 4, b: 3 },
  { kind: 'sub', a: 5, b: 1 },
  { kind: 'divSub', a: 9, b: 7 },
  { kind: 'add', a: 6, b: 2 },
  { kind: 'sub', a: 3, b: 8 },
];

export function operationResult(op: Operation, numbers: readonly number[]): number {
  const a = numbers[op.a - 1];
  const b = numbers[op.b - 1];
  switch (op.kind) {
    case 'sub':
      return a - b;
    case 'add':
      return a + b;
    case 'divSub':
      return a / b - b;
  }
}

export function letterOf(position: number): string {
  return Number.isInteger(position) && position >= 1 && position <= 26 ? String.fromCharCode(64 + position) : '?';
}

export function word(numbers: readonly number[]): string {
  return OPERATIONS.map((op) => letterOf(operationResult(op, numbers))).join('');
}

export type PuzzleLine = { solved: boolean; wrong: number; revealed: boolean };
export type PuzzleState = { lines: PuzzleLine[] };

export const initialPuzzle: PuzzleState = {
  lines: OPERATIONS.map(() => ({ solved: false, wrong: 0, revealed: false })),
};

export const REVEAL_AFTER = 3;

// Lines are solved in order; -1 once all are solved.
export function activeLine(state: PuzzleState): number {
  return state.lines.findIndex((line) => !line.solved);
}

export function isPuzzleSolved(state: PuzzleState): boolean {
  return activeLine(state) === -1;
}

function updateLine(state: PuzzleState, index: number, line: PuzzleLine): PuzzleState {
  return { lines: state.lines.map((l, i) => (i === index ? line : l)) };
}

export function submit(
  state: PuzzleState,
  numbers: readonly number[],
  value: number,
): { state: PuzzleState; result: 'right' | 'wrong' | 'ignored' } {
  const index = activeLine(state);
  if (index === -1) return { state, result: 'ignored' };
  const line = state.lines[index];
  if (value === operationResult(OPERATIONS[index], numbers)) {
    return { state: updateLine(state, index, { ...line, solved: true }), result: 'right' };
  }
  return { state: updateLine(state, index, { ...line, wrong: line.wrong + 1 }), result: 'wrong' };
}

export function canReveal(state: PuzzleState): boolean {
  const index = activeLine(state);
  return index !== -1 && state.lines[index].wrong >= REVEAL_AFTER;
}

// "Show me": fills the active line after REVEAL_AFTER wrong attempts.
export function reveal(state: PuzzleState): PuzzleState {
  if (!canReveal(state)) return state;
  const index = activeLine(state);
  return updateLine(state, index, { ...state.lines[index], solved: true, revealed: true });
}

export function puzzleTotals(state: PuzzleState): { wrong: number; revealed: number } {
  return {
    wrong: state.lines.reduce((sum, line) => sum + line.wrong, 0),
    revealed: state.lines.filter((line) => line.revealed).length,
  };
}

const MAX_DIGITS = 3;

export function typeDigit(input: string, digit: number): string {
  if (input.length >= MAX_DIGITS) return input;
  return input === '0' ? String(digit) : input + String(digit);
}

export function eraseDigit(input: string): string {
  return input.slice(0, -1);
}
