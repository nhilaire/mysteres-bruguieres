// Typewriter narration: blocks of text revealed character by character; taps skip ahead.

export const TYPEWRITER_MS = 30;

// Mouth frames played while Auguste talks (0 = closed). Not a 0->3 sweep: speech jumps between openings and
// closes often. One frame per second: the generated frames differ slightly everywhere, faster swaps flicker.
export const MOUTH_SEQUENCE = [1, 3, 2, 0, 2, 3, 1, 2, 0, 3] as const;
export const MOUTH_FRAME_MS = 1000;

export type NarrationState = { block: number; shown: number };
export const initialNarration: NarrationState = { block: 0, shown: 0 };

export function isTyping(state: NarrationState, blocks: readonly string[]): boolean {
  return state.shown < (blocks[state.block]?.length ?? 0);
}

// One typewriter step (one more character).
export function typeNext(state: NarrationState, blocks: readonly string[]): NarrationState {
  return isTyping(state, blocks) ? { ...state, shown: state.shown + 1 } : state;
}

// Tap while typing: show the whole block. Tap after: next block, or finished on the last block.
export function tapNarration(state: NarrationState, blocks: readonly string[]): { state: NarrationState; finished: boolean } {
  if (isTyping(state, blocks)) return { state: { ...state, shown: blocks[state.block].length }, finished: false };
  if (state.block < blocks.length - 1) return { state: { block: state.block + 1, shown: 0 }, finished: false };
  return { state, finished: true };
}

export type Segment = { text: string; bold: boolean };

// "**bold**" spans of the scenario text, cut to the first `shown` characters (markers do not count).
export function boldSegments(text: string, shown = Number.POSITIVE_INFINITY): Segment[] {
  const segments: Segment[] = [];
  let left = shown;
  text.split('**').forEach((part, i) => {
    if (left <= 0 || part === '') return;
    const visible = part.slice(0, left);
    left -= visible.length;
    segments.push({ text: visible, bold: i % 2 === 1 });
  });
  return segments;
}

// Length of a block as the player sees it (without the ** markers).
export function visibleText(text: string): string {
  return text.split('**').join('');
}
