# Release: Mystère à Bruguières v0.1.0

Phone install: PASS
User acceptance: pending
Date: 2026-10-28
Commit: 898f05f
APK: mysteres-bruguieres-0.1.0-arm64-v8a.apk (41.3 MB, arm64-v8a)
SHA-256: 0e39ebd1012aff7ac0dc34e3895ac8147085003abb7bc0f8c19e08fed3ef920c
Signature: release signature valid
Phone: Android 11 (API 30, arm64-v8a)
Launch check: alive after 10 s, no fatal error

## Notes from the user test

- 2026-10-28, build 898f05f: the Android navigation bar (bottom bar) gets in the way -> hide it during the game.
  PRD AC-36 + plan T-24, implemented in 463d6a4 (config plugin on MainActivity, status bar kept).
- 2026-10-28: APK arm64 is 41.3 MB, above the PRD target (< 40 MB): to decide with the user.
