// Scenario text per language. The structure (types, coordinates, choices order, answers position) is identical in
// every language; a test enforces it.
import type { Scenario } from '../../game/scenario';
import type { Language } from '../index';
import en from './en.json';
import fr from './fr.json';

export const SCENARIOS: Record<Language, Scenario> = {
  fr: fr as unknown as Scenario,
  en: en as unknown as Scenario,
};
