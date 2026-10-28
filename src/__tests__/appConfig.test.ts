// The Expo config decides the Android manifest: check the privacy-relevant parts without a native build.
const appConfig = require('../../app.config.js');

const config = appConfig({ config: { plugins: ['expo-localization'] } });
const pluginNames = config.plugins.map((p: string | [string, unknown]) => (Array.isArray(p) ? p[0] : p));

it('blocks the advertising ID, recording, step counter and background location permissions', () => {
  expect(config.android.blockedPermissions).toEqual(
    expect.arrayContaining([
      'com.google.android.gms.permission.AD_ID',
      'android.permission.RECORD_AUDIO',
      'android.permission.ACTIVITY_RECOGNITION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
    ]),
  );
});

it('asks for foreground location only', () => {
  const location = config.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-location');
  expect(location[1]).toMatchObject({ isAndroidBackgroundLocationEnabled: false, isAndroidForegroundServiceEnabled: false });
  expect(pluginNames).toContain('./plugins/with-release-signing');
});

it('declares the testing deep link scheme and the launcher name per language', () => {
  expect(config.scheme).toBe('mysteresbruguieres');
  expect(config.locales.fr.android.app_name).toBe('Mystère à Bruguières');
  expect(config.locales.en.android.app_name).toBe('Mystery in Bruguières');
  expect(config.orientation).toBe('portrait');
});
