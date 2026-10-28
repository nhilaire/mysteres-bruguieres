# KPIs and monitoring: Mystère à Bruguières

Firebase project: mysteres-bruguieres (dedicated project, free Spark plan, never upgraded to Blaze)
Android app: io.github.nhilaire.mysteresbruguieres
Data collection: opt-in only (consent screen). Analytics data retention: 2 months. Google signals: off.

## Business KPIs

From docs/PRD.md "KPIs". Events and params: `src/telemetry/events.ts` (= PRD "Telemetry events").

| KPI | Definition | Where to read it | Target |
|---|---|---|---|
| Route funnel | starters → each place → finished: `adventure_start` count, `place_reached` count by `step` (1-9), `adventure_finished` count | Analytics > Explore > Funnel exploration (steps: adventure_start, place_reached step=1..9, adventure_finished) | ≥ 50% of starters finish |
| Average rating | mean of `rating` on `adventure_rating` | Analytics > Events > adventure_rating (custom metric `rating`) | ≥ 4 / 5 |
| First-try rate per riddle | share of `riddle_solved` with `first_try` = 1, by `step` | Explore > Free form: rows `step`, filter event riddle_solved, breakdown `first_try` | every riddle ≥ 50% (lower = badly worded) |
| Manual arrival / lost rate per place | `place_reached` with `method` = manual / (auto + manual), by `step` (`manual_no_gps` excluded); `maps_opened` count by `step` | Explore > Free form: rows `step`, columns `method` | ≤ 30% per place (higher = coordinates to check) |
| Score distribution | `score` on `adventure_finished` | custom metric `score` | tracked |
| Final puzzle difficulty | `wrong` and `revealed` on `final_puzzle_solved` | custom metrics `wrong`, `revealed` | tracked |
| D1 retention | families resuming the next day | Analytics > Reports > Retention | tracked, no target |
| Settings usage | `settings_change` by `setting` / `value` | Analytics > Events > settings_change | tracked |

## Technical KPIs

| KPI | Definition | Where to read it | Target |
|---|---|---|---|
| Crash-free users | % users without a fatal crash | Crashlytics > Dashboard | >= 99% |
| ANR rate | app not responding events | Crashlytics > Dashboard (filter ANR) | < 0.5% |
| Non-fatal errors | `reportError()` calls | Crashlytics > Non-fatals | low and stable |
| APK size | arm64 release APK size | docs/evidence/v*/REPORT.md | < 40 MB (no Skia, no GL) |
| Cold start | launch to home screen | evidence report (device check) | < 3 s |

## Custom definitions to register in Analytics

Analytics > Admin > Custom definitions (free, up to 50 dimensions / 50 metrics):

| Name | Scope | Param | Type |
|---|---|---|---|
| step | Event | step | dimension |
| method | Event | method | dimension |
| first_try | Event | first_try | dimension (0/1) |
| resumed | Event | resumed | dimension (0/1) |
| setting | Event | setting | dimension |
| value | Event | value | dimension |
| score | Event | score | metric (standard) |
| rating | Event | rating | metric (standard) |
| wrong | Event | wrong | metric (standard) |
| revealed | Event | revealed | metric (standard) |

Never collected: position, device identifier, free text. Consent refused = nothing sent.

## How to check that events arrive

1. Build with `firebase/google-services.json` present, accept the consent screen.
2. `adb shell setprop debug.firebase.analytics.app io.github.nhilaire.mysteresbruguieres` then open Analytics > DebugView.
3. The factory's `verify.mjs --telemetry` captures the `Logging event` lines from logcat as evidence.
Standard reports update within ~24 h; DebugView is real time.
