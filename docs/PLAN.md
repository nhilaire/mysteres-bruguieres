# Plan: Mystère à Bruguières v0.1.1

Each task is small (one commit), references the acceptance criteria it serves, and names its proof.
Format: `- [ ] T-01 Title (AC-01, AC-02) - proof: unit|e2e|device`. Check the box only when the proof passes.

## Tasks

- [x] T-01 Scenario model and French scenario: port the 34 screens verbatim (no-break space typography), final quiz becomes `final_puzzle`, typed loader (AC-05, AC-32) - proof: unit
- [x] T-02 English scenario with the same structure, structural parity test fr/en (AC-05, AC-03) - proof: unit
- [x] T-03 Geo maths: Haversine, bearing, 8-way cardinal, localized distance label, tilt-compensated heading, shortest-path angle smoothing (AC-10, AC-13) - proof: unit
- [x] T-04 Radar rules: arrival detector (2 readings ≤ 15 m), pulse interval, proximity zone, ping/haptic gating, maps link, arrival method (AC-11, AC-12, AC-15, AC-33) - proof: unit
- [x] T-05 Adventure engine: navigation (back/forward/skip passed radars), riddle attempts and first-try scoring, places reached, rating once, restart (AC-16, AC-21) - proof: unit
- [x] T-06 Final puzzle engine: operations from the scenario answers, keypad input, wrong counts, "Show me" after 3, solved state (AC-18, AC-19) - proof: unit
- [x] T-07 Persistence: progress (incl. puzzle state, rating) and settings (sounds, vibrations), versioned keys, restart keeps settings (AC-22, AC-25) - proof: unit
- [x] T-08 Dictionaries fr/en from the PRD player copy, French typography test on every French string (AC-02, AC-32) - proof: unit
- [x] T-09 Assets: Auguste sprite sheets, title image, reaction portraits cropped from board h9oqowh9, church bells, generated sound effects with WAV header test, launcher icon, LICENSES.md (AC-34) - proof: unit
- [x] T-10 Sound and haptics service gated by the settings, bells on the church narration screen (AC-25, AC-34) - proof: unit
- [x] T-11 Location permission states and explainer screen (6 states, AppState re-check, "Play without GPS") (AC-07, AC-08) - proof: unit
- [x] T-12 Workshop theme, title screen (new / in progress, progress card, restart confirmation) and settings screen (language, sounds, vibrations, statistics) (AC-06, AC-03, AC-25, AC-01) - proof: unit
- [x] T-13 Narration screen: typewriter text, talking sprite with breathing, screen transitions (AC-09) - proof: unit
- [x] T-14 Radar screen: GPS and compass hooks, animated SVG radar (sweep, pulse rings, coloured blip, smoothed arrow, arrival flash), I'm here / maps buttons (AC-14, AC-12) - proof: unit
- [x] T-15 Riddle screen with Auguste reactions (happy / head scratching), green/red states (AC-17, AC-16) - proof: unit
- [x] T-16 Final puzzle screen: numbers, alphabet strip, keypad, letter flip, GAMOUNA reveal with surprised reaction (AC-19, AC-20) - proof: unit
- [x] T-17 End screen: score x/9, one-time rating (AC-24) - proof: unit
- [x] T-18 Game router, menu button, Android back, App routes and resume (AC-21, AC-23, AC-06) - proof: unit
- [x] T-19 About screen: story, how it works, developer line, data, version (AC-28) - proof: unit
- [x] T-20 Telemetry calls for the 8 PRD events, consent stored and switchable (AC-26, AC-01, AC-33) - proof: unit
- [x] T-21 App config: expo-location / expo-sensors / expo-audio plugins, blocked permissions, testing deep link (AC-30) - proof: unit
- [x] T-22 Maestro flows: consent + relaunch, language, title, location explainer, radar arrival with mocked location, riddle, final puzzle, end + rating, resume after kill, about, telemetry (AC-01, AC-03, AC-06, AC-07, AC-14, AC-17, AC-20, AC-23, AC-24, AC-27, AC-28) - proof: e2e
- [x] T-23 Device checks list for verify and release: launcher name per language, cold start, no crash, manifest permissions, on-site walk, feel (AC-04, AC-29, AC-30, AC-31, AC-35) - proof: device

- [x] T-24 Hide the Android navigation bar (config plugin on MainActivity, re-hidden on focus) (AC-36) - proof: device
- [x] T-25 Riddle: the right answer stays on screen with the point message until Continue (AC-17) - proof: unit

## v0.1.1 bug fixes

- [x] T-26 Riddle: the point message follows the engine verdict (no "+1 point" after a wrong answer made before a remount) (AC-16, AC-17) - proof: unit
- [x] T-27 Final puzzle: the arrival chime plays only when the puzzle gets solved, not when a solved puzzle is shown again (AC-20, AC-25) - proof: unit
- [x] T-28 Radar: re-check the location and restart the watch when the app comes back to the foreground while the position is unavailable (AC-14, AC-08) - proof: unit
- [x] T-29 Consent: a failed consent write is reported and never blocks the consent screen (AC-26, AC-01) - proof: unit
- [x] T-30 Telemetry: adventure_start only when the adventure really starts (not on Start then back from the location explainer) (AC-26, AC-27) - proof: unit

## Notes

- Source: the prior Expo SDK 53 project (local, not a repo). Ported code is adapted to SDK 57 and the factory layout
  (`src/game/` pure logic, `src/screens/` thin UI). Never copied: `.env`, `google-services.json`, APK, build/upload
  scripts, Azure client, device UUID.
- Pure logic first (T-01..T-08), then UI. Animations use Reanimated 4 + react-native-svg (ADR 0001).
- E2E reaching late screens (final puzzle, end) uses a testing deep link that seeds progress at a given screen
  (T-21), as loto-quine does; it only skips ahead in a local, non-competitive game.
- Maestro mocks the position with `setLocation` (emulator) for the radar arrival flow.
- Risk: compass on the emulator is absent: the radar must render its "no compass" state without crashing.
