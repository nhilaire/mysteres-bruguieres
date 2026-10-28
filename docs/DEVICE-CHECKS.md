# Device checks (release build)

The `[device]` and `[manual]` acceptance criteria are proven on the emulator during `/verify-app` and on the user's
phone during `/release-apk`. Each check names the command or observation that proves it.

| AC | Check | Proof |
|---|---|---|
| AC-04 | Name under the icon in French and in English | `aapt dump badging <apk>` lists `application-label:'Mystery in Bruguières'` (default), `application-label-fr:'Mystère à Bruguières'`, `application-label-en:'Mystery in Bruguières'`; phone launcher in both languages |
| AC-29 | Cold start < 3 s, no crash or ANR during the Maestro flows | `verify.mjs` cold start line and logcat crash buffer |
| AC-30 | Dangerous permissions limited to foreground location | `aapt dump permissions <apk>`: only `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` among dangerous ones; no `AD_ID`, `RECORD_AUDIO`, `ACTIVITY_RECOGNITION`, `ACCESS_BACKGROUND_LOCATION` |
| AC-34 | Sounds play on the device | `SOUND_LOADED <name>` lines in logcat (`adb logcat -s ReactNativeJS`): ping, chime, right, wrong, tick, bells; the user hears the bells on the church narration screen |
| AC-36 | Android navigation bar hidden, status bar kept | `adb shell dumpsys window`: `type=navigationBars visible=false`, `type=statusBars visible=true`; on the phone: no bottom bar, a swipe from the bottom shows it briefly, hidden again after the maps app |
| AC-31 | On site in Bruguières, at least one step | The user walks to one place: the radar leads there, the pulse and ticks speed up under 50 m, arrival triggers by itself; the radar feels livelier than the source game |
| AC-35 | Feel | Screen transitions, Auguste breathing and his reactions (right, wrong, GAMOUNA, end) feel livelier than the source game |

## Emulator notes

- The emulator has no real compass: the radar shows the "compass unavailable" line and the cardinal direction; the
  arrow is checked on the phone.
- Positions are mocked with Maestro `setLocation` (radar-riddle flow). The emulator plays no audio (`-no-audio`):
  sound playback is proven by `SOUND_LOADED` lines, hearing by the user on the phone.
