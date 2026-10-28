# Device checks v0.1.0 (emulator)

Commit: 573b33d (REPORT.md Overall PASS)
APK: `dist/mysteres-bruguieres-0.1.0-universal.apk`, SHA-256 `29d7438904693cbb9ef8da69f0eff071a2bdc56b6b3e93b6c3cb7854c205b789` (`raw/device-apk-sha256.txt`, same as REPORT.md)
Target: emulator sdk_gphone64_x86_64, Android 16 (API 36)

| AC | Command | Result | Raw output |
|---|---|---|---|
| AC-04 | `aapt dump badging <apk> \| grep application-label` | default `Mystery in Bruguières`, `-fr` `Mystère à Bruguières`, `-en` `Mystery in Bruguières` | `raw/device-launcher-labels.txt` |
| AC-30 | `aapt dump permissions <apk>` | dangerous: only `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`; no `AD_ID`, `RECORD_AUDIO`, `ACTIVITY_RECOGNITION`, `ACCESS_BACKGROUND_LOCATION` | `raw/device-permissions.txt` |
| AC-34 | live `adb logcat -s ReactNativeJS:V` during the radar-riddle and final-puzzle flows (both passed), then `am start -d mysteresbruguieres://seed/17` (church narration) | `SOUND_LOADED` for ping, chime, right, wrong, tick, bells (6/6) | `raw/device-sounds.txt`, `raw/device-js-log.txt` |
| AC-36 | `adb shell dumpsys window`, game in front after the flows | `type=navigationBars visible=false`, `type=statusBars visible=true` | `raw/device-system-bars.txt` |
| AC-27 (off) | `setprop debug.firebase.analytics.app <pkg>`, live `adb logcat FA:V FA-SVC:V` during smoke.yaml and radar-without-gps.yaml (consent refused; title-start and a place reached by "I'm here!", both flows passed) | 0 `Logging event` for adventure_start / place_reached / riddle_solved; 9 FA lines "App measurement disabled via the manifest" / "Event not sent since app measurement is disabled" | `raw/device-telemetry-off.txt`, `raw/device-telemetry-off-maestro-*.txt` |

Still to check on the user's phone at release (`docs/DEVICE-CHECKS.md`): launcher name seen in French and English,
bells and effects heard, compass arrow, navigation bar hidden on the phone, on-site walk (AC-31), feel (AC-35).

Note: the final-puzzle flow types 27 keys; Maestro waits ~11 s after each tap on this emulator, so the flow needs about
6 minutes (it passes inside verify's 20-minute budget).
