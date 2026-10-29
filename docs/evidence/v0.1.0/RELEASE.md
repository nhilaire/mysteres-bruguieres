# Release: Mystère à Bruguières v0.1.0

Phone install: PASS
User acceptance: confirmed (2026-10-29)
Date: 2026-10-29
Commit: e3e06b5
APK: mysteres-bruguieres-0.1.0-arm64-v8a.apk (41.3 MB, arm64-v8a)
SHA-256: f887310b7ad083a13643738abcd2d251880fcb4ff18b80e6178889a8d5f01058
Signature: release signature valid
Phone: Android 11 (API 30, arm64-v8a)
Launch check: alive after 10 s, no fatal error

## Notes from the user test

- 2026-10-28, build 898f05f: the Android navigation bar (bottom bar) gets in the way -> hide it during the game.
  PRD AC-36 + plan T-24, implemented in 463d6a4 (config plugin on MainActivity, status bar kept).
- 2026-10-28: APK arm64 is 41.3 MB, above the PRD target (< 40 MB): the user accepted it, PRD target amended to < 45 MB.
- Next version: game.test.tsx "continues on the same screen with the same score" does not assert the score (the
  storage test proves it); seed the resume flow with a score above 0 and assert it (verifier gap, 573b33d).
- 2026-10-28, build 1b5100c: after a right answer the game moved on too fast (800 ms) -> the riddle now stays with
  the point message until the player taps Continue. PRD AC-17 amended + plan T-25.
- 2026-10-29, build e3e06b5 (arm64 SHA-256 f887310b...): the user played on the phone and accepts it. Checked by the
  user: launcher name, sounds and church bells heard, navigation bar hidden (also after the maps app), overall feel
  (AC-04, AC-34 hearing, AC-35, AC-36). Not done yet: the on-site walk in Bruguières (AC-31), to check later.
  The phone was unplugged before the session log could be saved (no raw/phone-logcat-play.txt).
