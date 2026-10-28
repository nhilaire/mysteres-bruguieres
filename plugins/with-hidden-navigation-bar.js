// Hides the Android navigation bar (the bottom bar) while the game is in the foreground; a swipe from the bottom
// shows it briefly. The status bar (time, battery) stays: useful during a 2-hour walk. The bar is hidden again each
// time the game window regains focus (back from the maps app, the settings or the permission dialog).
const { withMainActivity } = require('@expo/config-plugins');

const IMPORTS = ['import androidx.core.view.WindowInsetsCompat', 'import androidx.core.view.WindowInsetsControllerCompat'];

const MARKER = 'plugins/with-hidden-navigation-bar.js';

const METHOD = `
  // Navigation bar hidden (${MARKER}): a swipe from the bottom shows it briefly.
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      val controller = WindowInsetsControllerCompat(window, window.decorView)
      controller.hide(WindowInsetsCompat.Type.navigationBars())
      controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
  }
`;

// Pure transformation of MainActivity.kt (unit-tested). Idempotent.
function addHiddenNavigationBar(contents) {
  if (contents.includes(MARKER)) return contents;
  const header = /class MainActivity\s*:\s*ReactActivity\(\)\s*\{/;
  if (!header.test(contents)) throw new Error('with-hidden-navigation-bar: MainActivity class header not found');
  let out = contents;
  for (const imp of IMPORTS) {
    if (!out.includes(imp)) out = out.replace('import com.facebook.react.ReactActivity\n', `${imp}\nimport com.facebook.react.ReactActivity\n`);
  }
  return out.replace(header, (match) => `${match}${METHOD}`);
}

function withHiddenNavigationBar(config) {
  return withMainActivity(config, (cfg) => {
    if (cfg.modResults.language !== 'kt') throw new Error('with-hidden-navigation-bar: MainActivity must be Kotlin');
    cfg.modResults.contents = addHiddenNavigationBar(cfg.modResults.contents);
    return cfg;
  });
}

module.exports = withHiddenNavigationBar;
module.exports.addHiddenNavigationBar = addHiddenNavigationBar;
