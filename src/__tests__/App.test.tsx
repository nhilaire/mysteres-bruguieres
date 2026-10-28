import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from '../App';
import { appName } from '../config/app';
import { deviceLanguageTags } from '../i18n/deviceLocale';

// render/fireEvent are awaited: asynchronous in React Native Testing Library 14+, harmless before.
// The phone is French unless a test says otherwise (jest.setup.js mocks deviceLanguageTags).
describe('App', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.mocked(deviceLanguageTags).mockReturnValue(['fr-FR']);
  });

  it('asks for consent in French on a French phone, then shows the home screen', async () => {
    await render(<App />);
    expect(await screen.findByText('Tes données, ton choix')).toBeTruthy();
    await fireEvent.press(screen.getByText('Je refuse'));
    expect(await screen.findByText("Commencer l'aventure")).toBeTruthy();
    expect(screen.getByText(appName('fr'))).toBeTruthy();
  });

  it('speaks English on an English phone', async () => {
    jest.mocked(deviceLanguageTags).mockReturnValue(['en-US']);
    await render(<App />);
    expect(await screen.findByText('Your data, your choice')).toBeTruthy();
  });

  it('uses the fallback language on a phone in an unsupported language', async () => {
    jest.mocked(deviceLanguageTags).mockReturnValue(['it-IT']);
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    await render(<App />);
    expect(await screen.findByTestId('title-screen')).toBeTruthy();
    expect(screen.getByText('Start the adventure')).toBeTruthy();
  });

  it('switches language from the settings at once and remembers the choice', async () => {
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    await render(<App />);
    await fireEvent.press(await screen.findByText('Réglages'));
    await fireEvent.press(screen.getByTestId('settings-language-en'));
    expect(await screen.findByText('Settings')).toBeTruthy();
    expect(await AsyncStorage.getItem('settings.language.v1')).toBe('en');

    await screen.unmount();
    await render(<App />);
    expect(await screen.findByText('Start the adventure')).toBeTruthy();
  });

  it('goes back to the phone language with the automatic choice', async () => {
    await AsyncStorage.multiSet([
      ['telemetry.consent.v1', 'denied'],
      ['settings.language.v1', 'en'],
    ]);
    await render(<App />);
    await fireEvent.press(await screen.findByText('Settings'));
    await fireEvent.press(screen.getByTestId('settings-language-auto'));
    expect(await screen.findByText('Réglages')).toBeTruthy();
  });

  it('shows the About screen: story, word from the author, data, version', async () => {
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    await render(<App />);
    await fireEvent.press(await screen.findByText('À propos du jeu'));
    expect(screen.getByTestId('about-screen')).toBeTruthy();
    expect(screen.getByText("L'histoire de ce jeu")).toBeTruthy();
    expect(screen.getByText(/développeur indépendant passionné/)).toBeTruthy();
    expect(screen.getByText(/bugs/)).toBeTruthy();
    expect(screen.getByText(/^Version [0-9]+[.][0-9]+[.][0-9]+$/)).toBeTruthy();
    expect(screen.getByText(/traînant d'un monument à l'autre/)).toBeTruthy();
    expect(screen.getByText('Comment ça marche')).toBeTruthy();
    expect(screen.getByText(/Compte environ 2 heures/)).toBeTruthy();
    expect(screen.getByText(/Ta position ne quitte jamais ton téléphone/)).toBeTruthy();
  });

  it('does not ask again once the player has chosen', async () => {
    await AsyncStorage.setItem('telemetry.consent.v1', 'denied');
    await render(<App />);
    expect(await screen.findByText("Commencer l'aventure")).toBeTruthy();
    expect(screen.queryByText('Tes données, ton choix')).toBeNull();
  });
});
