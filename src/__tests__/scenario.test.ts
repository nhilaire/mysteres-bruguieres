import { answerPosition, isQuiz, questionLines, quizIndexes, radarIndexes, riddleAnswers, screenTexts, stepOf } from '../game/scenario';
import { SCENARIOS } from '../i18n/scenario';
import { frenchTypographyErrors } from './helpers/typography';

const fr = SCENARIOS.fr;

describe('French scenario (ported verbatim from the source game)', () => {
  it('has the 34 screens of the source, the final quiz turned into the interactive puzzle', () => {
    expect(fr.screens).toHaveLength(34);
    expect(fr.screens[0].type).toBe('home');
    expect(fr.screens[31].type).toBe('final_puzzle');
    expect(fr.screens[33].type).toBe('final');
  });

  it('has 9 places, each radar followed by its riddle', () => {
    const radars = radarIndexes(fr);
    expect(radars).toHaveLength(9);
    radars.forEach((index) => expect(fr.screens[index + 1].type).toBe('quiz'));
    expect(quizIndexes(fr)).toEqual(radars.map((index) => index + 1));
  });

  it('keeps the 9 riddle answers that spell GAMOUNA', () => {
    expect(riddleAnswers(fr)).toEqual([2, 9, 8, 21, 17, 5, 4, 7, 100]);
  });

  it('has each answer among its choices', () => {
    fr.screens.filter(isQuiz).forEach((quiz) => expect(answerPosition(quiz)).toBeGreaterThanOrEqual(0));
  });

  it('numbers places and riddles from 1 to 9', () => {
    expect(stepOf(fr, 3)).toBe(1);
    expect(stepOf(fr, 4)).toBe(1);
    expect(stepOf(fr, 27)).toBe(9);
    expect(stepOf(fr, 28)).toBe(9);
    expect(stepOf(fr, 0)).toBe(0);
  });

  it('plays the church bells on one narration screen', () => {
    const withSound = fr.screens.filter((s) => 'sound' in s && s.sound === 'bells');
    expect(withSound).toHaveLength(1);
  });

  it('has no empty text', () => {
    fr.screens.flatMap(screenTexts).forEach((text) => expect(text.trim()).not.toBe(''));
  });

  it('uses French typography: no ordinary space before : ; ! ? nor inside guillemets', () => {
    const errors = fr.screens.flatMap(screenTexts).flatMap(frenchTypographyErrors);
    expect(errors).toEqual([]);
  });

  it('splits multi-line questions on ->', () => {
    expect(questionLines('a -> b ->  c')).toEqual(['a', 'b', 'c']);
  });
});
