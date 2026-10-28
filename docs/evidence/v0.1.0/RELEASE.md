# Release: Mystère à Bruguières v0.1.0

Phone install: PASS
User acceptance: pending
Date: 2026-10-28
Commit: 1b5100c
APK: mysteres-bruguieres-0.1.0-arm64-v8a.apk (41.3 MB, arm64-v8a)
SHA-256: 926b97b597e32fa06de641219ac3ce2a2a52b73afdb9436acaeee6112efd0ecc
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
