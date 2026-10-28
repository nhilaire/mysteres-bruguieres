# Verification report: Mystère à Bruguières v0.1.0

Overall: PASS
Commit: 573b33d
Date: 2026-10-28 19:48 UTC
Stack: expo
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36, x86_64)
APK: mysteres-bruguieres-0.1.0-universal.apk (99.1 MB)
SHA-256: 29d7438904693cbb9ef8da69f0eff071a2bdc56b6b3e93b6c3cb7854c205b789

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | clean working tree | PASS | commit 573b33d |
| 2 | typecheck | PASS | `tsc --noEmit` exit 0 |
| 3 | unit tests (Jest) | PASS | Tests:       214 passed, 214 total |
| 4 | expo-doctor | PASS | all checks passed |
| 5 | secrets & personal data scan | PASS | secret-scan (worktree): clean |
| 6 | release build | PASS | mysteres-bruguieres-0.1.0-universal.apk, 99.1 MB, Firebase on |
| 7 | release signature | PASS | release signature valid; cert SHA-256 54da35e17c99b321... |
| 8 | install (adb) | PASS | Performing Streamed Install Success |
| 9 | launch, alive after 8 s, no fatal error | PASS | process alive, 0 fatal log lines |
| 10 | cold start time | PASS | median 2332 ms of 2859 / 2029 / 2332 ms after a warm-up launch (target < 3000 ms) |
| 11 | Maestro E2E flows | PASS | 9/9 flows passed, 19 screenshots in screens/ |
| 12 | no crash during e2e flows | PASS | 0 fatal log lines (crash buffer + errors, raw/logcat-e2e.txt) |
| 13 | telemetry events after consent | PASS | seen in logcat: adventure_start, place_reached |

Screenshots: `screens/` (emulator only, no personal data). Raw logs: `raw/` (local, git-ignored).
