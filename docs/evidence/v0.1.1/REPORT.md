# Verification report: Mystère à Bruguières v0.1.1

Overall: PASS
Commit: 5647342
Date: 2026-11-08 20:22 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: mysteres-bruguieres-0.1.1-universal.apk (99.1 MB)
SHA-256: 16651fb3e74ed12979bd1c2418055b1fe9864bb4ef19de3a77b5e776fe1d85f2

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit 5647342 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | lint | WARN | no "lint" script in package.json (app scaffolded before ESLint was part of the overlay) |
| 4 | unit tests (Jest) | PASS | Tests:       225 passed, 225 total |
| 5 | expo-doctor | WARN | issues reported (see raw/expo-doctor.txt) |
| 6 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 7 | release build | PASS | mysteres-bruguieres-0.1.1-universal.apk, 99.1 MB, Firebase on |
| 8 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 9 | install (adb) | PASS | Performing Streamed Install Success |
| 10 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 11 | cold start time | PASS | median 627 ms of 790 / 627 / 557 ms after a warm-up launch (target < 3000 ms) |
| 12 | Maestro E2E flows | PASS | 10/10 flows passed, 21 screenshots in screens/ |
| 13 | no crash during e2e flows | PASS | 0 fatal log lines (crash buffer + errors, raw/logcat-e2e.txt) |
| 14 | telemetry events after consent | PASS | seen in logcat: adventure_start, place_reached |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
