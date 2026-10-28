import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { LanguageSetting } from './i18n';
import { I18nProvider } from './i18n/I18nProvider';
import { AboutScreen } from './screens/AboutScreen';
import { ConsentScreen } from './screens/ConsentScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TitleScreen } from './screens/TitleScreen';
import { configureFeedback } from './feedback/feedback';
import { defaultFeedbackSettings, FeedbackSettings, loadFeedbackSettings, saveFeedbackSettings } from './storage/feedbackSettings';
import { loadLanguageSetting, saveLanguageSetting } from './storage/languageSetting';
import { Consent, loadConsent, saveConsent } from './telemetry/consentStore';
import { applyConsent } from './telemetry/telemetry';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { colors } from './ui/theme';

type Route = 'home' | 'settings' | 'about';

export default function App() {
  const [consent, setConsentState] = useState<Consent | 'loading'>('loading');
  const [route, setRoute] = useState<Route>('home');
  const [languageSetting, setLanguageSetting] = useState<LanguageSetting>('auto');
  const [feedback, setFeedback] = useState<FeedbackSettings>(defaultFeedbackSettings);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [storedConsent, storedLanguage, storedFeedback] = await Promise.all([
        loadConsent(),
        loadLanguageSetting(),
        loadFeedbackSettings(),
      ]);
      configureFeedback(storedFeedback);
      if (storedConsent !== 'unknown') await applyConsent(storedConsent === 'granted');
      if (alive) {
        setLanguageSetting(storedLanguage);
        setFeedback(storedFeedback);
        setConsentState(storedConsent);
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
    content = <AboutScreen onBack={() => setRoute('home')} />;
  } else if (route === 'settings') {
    content = (
      <SettingsScreen
        telemetryEnabled={consent === 'granted'}
        onToggleTelemetry={decide}
        feedback={feedback}
        onChangeFeedback={changeFeedback}
        onBack={() => setRoute('home')}
      />
    );
  } else {
    content = (
      <TitleScreen
        summary={{ started: false, places: 0, solved: 0, percent: 0 }}
        onStart={() => setRoute('home')}
        onRestart={() => setRoute('home')}
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
