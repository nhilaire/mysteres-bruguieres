// Maps what happens in the game to the PRD telemetry events (sent only after consent, see telemetry.ts).
import { puzzleTotals } from '../game/puzzle';
import { arrivalMethod } from '../game/radar';
import type { GameEvents } from '../screens/GameScreen';
import type { EventName, TelemetryEvents } from './events';

type Track = <N extends EventName>(name: N, params: TelemetryEvents[N]) => void;

export function gameEvents(track: Track): Required<GameEvents> {
  return {
    onPlaceReached: (step, kind, hasFix) => track('place_reached', { step, method: arrivalMethod(kind, hasFix) }),
    onMapsOpened: (step) => track('maps_opened', { step }),
    onRiddleSolved: (step, firstTry, wrong) => track('riddle_solved', { step, first_try: firstTry, wrong: Math.min(wrong, 5) }),
    onPuzzleSolved: (puzzle) => track('final_puzzle_solved', puzzleTotals(puzzle)),
    onFinished: (score) => track('adventure_finished', { score }),
    onRated: (rating) => track('adventure_rating', { rating }),
  };
}
