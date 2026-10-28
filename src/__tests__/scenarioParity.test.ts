import { answerPosition, ScenarioScreen, screenTexts } from '../game/scenario';
import { LANGUAGES } from '../i18n';
import { SCENARIOS } from '../i18n/scenario';

const fr = SCENARIOS.fr;
const others = LANGUAGES.filter((language) => language !== 'fr');

// Everything but the words: what the game logic depends on.
function shape(screen: ScenarioScreen) {
  switch (screen.type) {
    case 'home':
    case 'explanation':
      return { type: screen.type, texts: screen.texts.length, sound: screen.sound ?? null };
    case 'final':
      return { type: screen.type, texts: screen.texts.length };
    case 'radar':
      return { type: screen.type, latitude: screen.latitude, longitude: screen.longitude };
    case 'quiz':
      return { type: screen.type, choices: screen.choices.length, answer: answerPosition(screen) };
    case 'final_puzzle':
      return { type: screen.type };
  }
}

const isNumberOrName = (text: string) => /^[0-9 ]+$/.test(text);

describe.each(others)('%s scenario', (language) => {
  const scenario = SCENARIOS[language];

  it('has exactly the structure of the French scenario', () => {
    expect(scenario.screens.map(shape)).toEqual(fr.screens.map(shape));
  });

  it('keeps the same numeric answers', () => {
    scenario.screens.forEach((screen, index) => {
      const french = fr.screens[index];
      if (screen.type === 'quiz' && french.type === 'quiz') expect(screen.answer).toBe(french.answer);
    });
  });

  it('is really translated: no empty text, no text left in French', () => {
    scenario.screens.forEach((screen, index) => {
      const french = screenTexts(fr.screens[index]);
      screenTexts(screen).forEach((text, i) => {
        expect(text.trim()).not.toBe('');
        if (!isNumberOrName(text)) expect(text).not.toBe(french[i]);
      });
    });
  });

  it('has no French no-break space', () => {
    scenario.screens.flatMap(screenTexts).forEach((text) => expect(text).not.toMatch(/[  «»]/));
  });
});
