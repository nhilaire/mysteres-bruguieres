# Verification report: Mystère à Bruguières v0.1.0

Overall: PASS
Commit: 585ae07
Date: 2026-10-29 09:01 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: mysteres-bruguieres-0.1.0-universal.apk (99.1 MB)
SHA-256: c5d36af32ed669e0d840bc8cd29926da188b70af5f99af0797c4151e8759a8d5

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit 585ae07 |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       215 passed, 215 total |
| 4 | expo-doctor | PASS | all checks passed |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | mysteres-bruguieres-0.1.0-universal.apk, 99.1 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | median 673 ms of 684 / 673 / 619 ms after a warm-up launch (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 10/10 flows passed, 22 screenshots in screens/ |
| 12 | no crash during e2e flows | PASS | 0 fatal log lines (crash buffer + errors, raw/logcat-e2e.txt) |
| 13 | telemetry events after consent | PASS | seen in logcat: adventure_start, place_reached |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
