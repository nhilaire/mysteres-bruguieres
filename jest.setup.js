// Native modules are replaced by in-memory mocks so that tests run in Node.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(() => Promise.resolve()),
  setConsent: jest.fn(() => Promise.resolve()),
  setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  log: jest.fn(),
  recordError: jest.fn(),
  setCrashlyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
}));

// The phone's languages: French by default; a test can switch with
// jest.mocked(deviceLanguageTags).mockReturnValue(['en-US']).
jest.mock('./src/i18n/deviceLocale', () => ({ deviceLanguageTags: jest.fn(() => ['fr-FR']) }));

// Audio: each player records its calls.
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn(), remove: jest.fn() })),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Location: no permission and no fix unless a test says otherwise.
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: false, status: 'undetermined', canAskAgain: true })),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: false, status: 'denied', canAskAgain: true })),
  hasServicesEnabledAsync: jest.fn(() => Promise.resolve(true)),
  enableNetworkProviderAsync: jest.fn(() => Promise.resolve()),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  watchHeadingAsync: jest.fn(() => Promise.reject(new Error('no heading'))),
  Accuracy: { High: 4 },
}));

jest.mock('expo-sensors', () => ({
  Magnetometer: { isAvailableAsync: jest.fn(() => Promise.resolve(false)), addListener: jest.fn(() => ({ remove: jest.fn() })), setUpdateInterval: jest.fn() },
  Accelerometer: { isAvailableAsync: jest.fn(() => Promise.resolve(false)), addListener: jest.fn(() => ({ remove: jest.fn() })), setUpdateInterval: jest.fn() },
}));
