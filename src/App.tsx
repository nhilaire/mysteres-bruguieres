import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { configureFeedback } from './feedback/feedback';
import { initialProgress, isStarted, Progress } from './game/adventure';
import { LanguageSetting } from './i18n';
import { I18nProvider } from './i18n/I18nProvider';
import { SCENARIOS } from './i18n/scenario';
import { checkLocationPermission } from './location/permissions';
import { AboutScreen } from './screens/AboutScreen';
import { ConsentScreen } from './screens/ConsentScreen';
import { GameScreen } from './screens/GameScreen';
import { LocationScreen } from './screens/LocationScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AdventureSummary, TitleScreen } from './screens/TitleScreen';
import { defaultFeedbackSettings, FeedbackSettings, loadFeedbackSettings, saveFeedbackSettings } from './storage/feedbackSettings';
import { loadLanguageSetting, saveLanguageSetting } from './storage/languageSetting';
import { clearProgress, loadProgress, saveProgress } from './storage/progress';
import { Consent, loadConsent, saveConsent } from './telemetry/consentStore';
import { applyConsent } from './telemetry/telemetry';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { colors } from './ui/theme';

type Route = 'title' | 'location' | 'game' | 'settings' | 'about';

// Every language has the same screens; the French scenario gives the count.
const SCREEN_COUNT = SCENARIOS.fr.screens.length;

export function summarize(progress: Progress): AdventureSummary {
  return {
    started: isStarted(progress),
    places: progress.reached.length,
    solved: progress.solved.length,
    percent: Math.round((progress.furthest / (SCREEN_COUNT - 1)) * 100),
  };
}

export default function App() {
  const [consent, setConsentState] = useState<Consent | 'loading'>('loading');
  // Each launch starts on the title screen.
  const [route, setRoute] = useState<Route>('title');
  const [languageSetting, setLanguageSetting] = useState<LanguageSetting>('auto');
  const [feedback, setFeedback] = useState<FeedbackSettings>(defaultFeedbackSettings);
  const [progress, setProgress] = useState<Progress>(initialProgress);
  // "Play without GPS" is remembered for this app session only.
  const [withoutGps, setWithoutGps] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [storedConsent, storedLanguage, storedFeedback, storedProgress] = await Promise.all([
        loadConsent(),
        loadLanguageSetting(),
        loadFeedbackSettings(),
        loadProgress(SCREEN_COUNT),
      ]);
      configureFeedback(storedFeedback);
      if (storedConsent !== 'unknown') await applyConsent(storedConsent === 'granted');
      if (alive) {
        setLanguageSetting(storedLanguage);
        setFeedback(storedFeedback);
        setProgress(storedProgress);
        setConsentState(storedConsent);
        loaded.current = true;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const decide = useCallback(async (granted: boolean) => {
    const value = granted ? 'granted' : 'denied';
    await saveConsent(value);
    await applyConsent(granted);
    setConsentState(value);
  }, []);

  const changeLanguage = useCallback(async (value: LanguageSetting) => {
    setLanguageSetting(value);
    await saveLanguageSetting(value);
  }, []);

  const changeFeedback = useCallback(async (value: FeedbackSettings) => {
    setFeedback(value);
    configureFeedback(value);
    await saveFeedbackSettings(value);
  }, []);

  // Progress is saved after every change (not before the stored one is loaded).
  useEffect(() => {
    if (loaded.current) saveProgress(progress);
  }, [progress]);

  const updateProgress = useCallback((update: (p: Progress) => Progress) => setProgress(update), []);

  const start = useCallback(async () => {
    if (withoutGps || (await checkLocationPermission()) === 'granted') setRoute('game');
    else setRoute('location');
  }, [withoutGps]);

  const restart = useCallback(async () => {
    await clearProgress();
    setProgress(initialProgress);
    setRoute('title');
  }, []);

  const toTitle = useCallback(() => setRoute('title'), []);

  let content: React.ReactNode;
  if (consent === 'loading') {
    content = (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  } else if (consent === 'unknown') {
    content = <ConsentScreen onDecision={decide} />;
  } else if (route === 'about') {
    content = <AboutScreen onBack={toTitle} />;
  } else if (route === 'settings') {
    content = (
      <SettingsScreen
        telemetryEnabled={consent === 'granted'}
        onToggleTelemetry={decide}
        feedback={feedback}
        onChangeFeedback={changeFeedback}
        onBack={toTitle}
      />
    );
  } else if (route === 'location') {
    content = (
      <LocationScreen
        onContinue={(withGps) => {
          if (!withGps) setWithoutGps(true);
          setRoute('game');
        }}
        onBack={toTitle}
      />
    );
  } else if (route === 'game') {
    content = <GameScreen progress={progress} onProgress={updateProgress} onMenu={toTitle} onRestart={restart} />;
  } else {
    content = (
      <TitleScreen
        summary={summarize(progress)}
        onStart={start}
        onRestart={restart}
        onSettings={() => setRoute('settings')}
        onAbout={() => setRoute('about')}
      />
    );
  }

  return (
    <I18nProvider setting={languageSetting} onChange={changeLanguage}>
      <ErrorBoundary>{content}</ErrorBoundary>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
