import AsyncStorage from '@react-native-async-storage/async-storage';

import { reportError } from '../telemetry/telemetry';

export type FeedbackSettings = { sound: boolean; haptics: boolean };

const KEY = 'settings.feedback.v1';

export const defaultFeedbackSettings: FeedbackSettings = { sound: true, haptics: true };

export async function loadFeedbackSettings(): Promise<FeedbackSettings> {
  try {
    const stored = JSON.parse((await AsyncStorage.getItem(KEY)) ?? 'null') as Partial<FeedbackSettings> | null;
    return {
      sound: typeof stored?.sound === 'boolean' ? stored.sound : defaultFeedbackSettings.sound,
      haptics: typeof stored?.haptics === 'boolean' ? stored.haptics : defaultFeedbackSettings.haptics,
    };
  } catch (error) {
    reportError(error, 'load_feedback_settings');
    return defaultFeedbackSettings;
  }
}

export async function saveFeedbackSettings(settings: FeedbackSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch (error) {
    reportError(error, 'save_feedback_settings');
  }
}
