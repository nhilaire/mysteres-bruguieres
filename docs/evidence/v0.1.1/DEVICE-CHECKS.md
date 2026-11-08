# Device checks v0.1.1 (emulator)

Commit: 5647342 (REPORT.md Overall PASS)
APK: `dist/mysteres-bruguieres-0.1.1-universal.apk`, SHA-256 `16651fb3e74ed12979bd1c2418055b1fe9864bb4ef19de3a77b5e776fe1d85f2` (`raw/device-apk-sha256.txt`, same as REPORT.md)
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36), cold-booted (no snapshot)
Run on 2026-11-08 right after the REPORT.md run, on the APK installed by it.

| AC | Command | Result | Raw output |
|---|---|---|---|
| AC-04 | `aapt2 dump badging <apk> \| grep application-label` | default `Mystery in Bruguières`, `-fr` `Mystère à Bruguières`, `-en` `Mystery in Bruguières` | `raw/device-launcher-labels.txt` |
| AC-30 | `aapt2 dump permissions <apk>` | dangerous: only `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`; no `AD_ID`, `RECORD_AUDIO`, `ACTIVITY_RECOGNITION`, `ACCESS_BACKGROUND_LOCATION` | `raw/device-permissions.txt` |
| AC-34 | `adb logcat -s ReactNativeJS` while replaying smoke, radar-without-gps, radar-riddle and final-puzzle (all passed), then `am start -d mysteresbruguieres://seed/17` (church narration) | `SOUND_LOADED` for bells, chime, ping, right, tick, wrong (6/6), 0 `SOUND_ERROR` | `raw/device-sounds.txt`, `raw/device-js-log.txt` |
| AC-36 | `adb shell dumpsys window`, game in front after the flows | `type=navigationBars ... visible=false`, `type=statusBars ... visible=true` | `raw/device-system-bars.txt` |
| AC-29 (ANR) | `adb logcat -d -b events,crash` after the verify run (10 Maestro flows + telemetry flow) and `dumpsys dropbox --print data_app_anr` | 0 `am_anr`, 0 `am_crash`, 0 `FATAL EXCEPTION` for the package, 0 dropbox ANR entry | `raw/device-anr-events.txt` |
| AC-27 (off) | `setprop debug.firebase.analytics.app <pkg>`, `log.tag.FA`/`FA-SVC` VERBOSE, `logcat -c`, then smoke.yaml and radar-without-gps.yaml (consent refused; title-start and a place reached by « J'y suis ! », both flows passed), `adb logcat -d -s FA FA-SVC` | 48 FA lines, 0 `Logging event`, 0 upload; "App measurement disabled via the manifest", "Event not sent since app measurement is disabled" | `raw/device-telemetry-off.txt`, `raw/device-telemetry-off-maestro-*.txt` |

v0.1.1 note (T-29): on this cold-booted emulator the Play Services "Location Accuracy" sheet opens over the radar
when the location is allowed; with the a7d9959 build it reopened forever after « No thanks » (the T-28 foreground
re-check restarted the watch), which made the telemetry flow miss `place_reached`. On the 5647342 build the sheet
is dismissed once and the radar stays (telemetry flow passed, REPORT.md step 14).

Still to check on the user's phone at release (`docs/DEVICE-CHECKS.md`): launcher name seen in French and English,
bells and effects heard, compass arrow, navigation bar hidden on the phone, on-site walk (AC-31), feel (AC-35).
