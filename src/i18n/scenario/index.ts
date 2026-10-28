// Scenario text per language. The structure (types, coordinates, choices order, answers position) is identical in
// every language; a test enforces it.
import type { Scenario } from '../../game/scenario';
import fr from './fr.json';

export const SCENARIOS = {
  fr: fr as unknown as Scenario,
} as const;
