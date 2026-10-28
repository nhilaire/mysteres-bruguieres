// The adventure is a fixed list of screens, one scenario file per language with the same structure
// (src/i18n/scenario/<lang>.json). Pure TypeScript: no React, no native module.

export type NarrationScreen = {
  type: 'home' | 'explanation';
  texts: string[];
  // Background sound played while the screen is shown.
  sound?: 'bells';
};

export type RadarScreen = {
  type: 'radar';
  latitude: number;
  longitude: number;
  message: string;
};

export type QuizScreen = {
  type: 'quiz';
  intro: string;
  question: string;
  choices: string[];
  answer: string;
};

export type FinalPuzzleScreen = { type: 'final_puzzle' };

export type FinalScreen = { type: 'final'; texts: string[] };

export type ScenarioScreen = NarrationScreen | RadarScreen | QuizScreen | FinalPuzzleScreen | FinalScreen;

export type Scenario = { screens: ScenarioScreen[] };

export const isQuiz = (screen: ScenarioScreen | undefined): screen is QuizScreen => screen?.type === 'quiz';
export const isRadar = (screen: ScenarioScreen | undefined): screen is RadarScreen => screen?.type === 'radar';

export function quizIndexes(scenario: Scenario): number[] {
  return scenario.screens.flatMap((screen, index) => (isQuiz(screen) ? [index] : []));
}

export function radarIndexes(scenario: Scenario): number[] {
  return scenario.screens.flatMap((screen, index) => (isRadar(screen) ? [index] : []));
}

// 1-based place number of a radar or quiz screen (the n-th radar / n-th riddle), 0 for other screens.
export function stepOf(scenario: Scenario, index: number): number {
  const screen = scenario.screens[index];
  const list = isRadar(screen) ? radarIndexes(scenario) : isQuiz(screen) ? quizIndexes(scenario) : [];
  return list.indexOf(index) + 1;
}

// The correct answers of the scored riddles, in order, as numbers (they feed the final puzzle).
export function riddleAnswers(scenario: Scenario): number[] {
  return quizIndexes(scenario).map((index) => Number((scenario.screens[index] as QuizScreen).answer));
}

export function answerPosition(screen: QuizScreen): number {
  return screen.choices.indexOf(screen.answer);
}

// "->" splits a long question into lines (kept from the source scenario format).
export function questionLines(question: string): string[] {
  return question
    .split('->')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// Every text of a screen (used by the typography and "really translated" tests).
export function screenTexts(screen: ScenarioScreen): string[] {
  switch (screen.type) {
    case 'home':
    case 'explanation':
    case 'final':
      return screen.texts;
    case 'radar':
      return [screen.message];
    case 'quiz':
      return [screen.intro, screen.question, ...screen.choices];
    case 'final_puzzle':
      return [];
  }
}
