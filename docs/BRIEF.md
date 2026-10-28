# Brief: mysteres-bruguieres

Date: 2026-10-28
Project slug: mysteres-bruguieres
Final app name: Mystère à Bruguières

## Original brief

il s'agit d'un jeu d'exploration d'une ville, dont la grosse partie est faite ici C:\dev\mysteres-bruguieres-react, à repasser dans l'usine.
On n'hésite pas à améliorer des choses, comme les animations, l'interaction, le radar, etc.
public famillle

## Clarifying questions

Answers are summarised in English. Format: `- **Q:** question` then `  **A:** answer`.
Mark assumptions the user accepted as `(default accepted)`.

### Concept and players

- **Q:** What is the game?
  **A:** A port into the factory of an existing geolocated treasure hunt (source: a prior React Native/Expo project, not a git repo): a family walks to 9 real places in the centre of Bruguieres (Haute-Garonne), guided by a GPS + compass radar, while a fictional narrator, Auguste Meridius (master clockmaker and "keeper of memory" of the town), tells the history of each place. At each place an observation riddle (multiple choice, the answer is on site, not in the phone) gives a number; the 9 numbers feed a final puzzle revealing the Occitan word GAMOUNA ("ford of the monks").
- **Q:** Who is it for?
  **A:** Families (from the original brief).
- **Q:** Is the route content (9 places, Auguste's texts, riddles, GAMOUNA) kept?
  **A:** Kept as is (34 scenario screens), only translated into English. The port improves the form, not the substance. (default accepted)

### Story (About screen)

- **Q:** Why was this game made?
  **A:** At first to show the town to the author's children; then it was shown to the neighbours, and the author wanted to share it.
- **Q:** About screen text (French, approved as is)?
  **A:** « J'ai d'abord créé ce jeu pour faire visiter Bruguières à mes enfants autrement qu'en les traînant d'un monument à l'autre. Puis je l'ai montré aux voisins, qui ont joint leurs pas aux nôtres… et j'ai eu envie de le partager avec toutes les familles curieuses de la ville. » followed by the standard mention that it was made by a passionate independent developer. The source game's "how to play" bullets (9 places, ~2 h, GPS and battery, saved progress, first-try scoring, maps fallback) stay on the About screen.

### Gameplay and controls

- **Q:** Can the game be played away from Bruguieres?
  **A:** On site only, as today: GPS radar plus the manual "I'm here!" button and the "I can't find the place" button that opens the maps app. No remote mode, no demo mode. (default accepted)
- **Q:** Which improvements matter most?
  **A:** (1) A livelier radar (animated sweep, pulse speeding up when getting closer, smoothed needle, proximity feedback); (2) Auguste animations and screen transitions (livelier portrait, celebration on a right answer); (3) an interactive final puzzle: the player does the calculations and sees the letters of GAMOUNA appear one by one. Riddle interaction improvements (hints, numbers notebook) were not selected.

### Progression, scoring, difficulty

- **Q:** End of game: keep the score and the rating?
  **A:** Yes, as today: score x/9 (one point per riddle solved at the first try; the final puzzle is not scored), then a 1-5 star rating given once. The rating goes to Firebase only if the player consented. (default accepted)
- **Q:** Session length and saving?
  **A:** About 2 hours on foot or by bike (from the source game's About screen); progress is saved automatically on the phone so the walk can be paused and resumed. (default accepted, from the source)

### Look, sound and feel

- **Q:** Which sounds?
  **A:** Discreet sound effects: radar ping, chime on arrival, right/wrong answer sounds, plus the existing church bells (`eglise.mp3`). No background music. A setting mutes all sounds. (default accepted)
- **Q:** Haptics?
  **A:** Yes on key moments: a proximity tick that speeds up near the place, a vibration on arrival and on answers. Can be turned off in the settings. (default accepted)
- **Q:** Use the extra Gemini images and the video found at the root of the source project to animate Auguste?
  **A:** To be examined during the PRD: Claude reviews them and proposes which ones to integrate; nothing is committed without the user's agreement. The look keeps the source's two moods (golden daylight in game, ink-and-brass workshop for menu/About/settings); the 4-frame Auguste sprite scenes have no text in them.

### Languages

- **Q:** Languages of the game?
  **A:** French (reference) + English, English as fallback for other phone languages; follows the phone, switch in the settings. (default accepted)
- **Q:** Final app name in English?
  **A:** "Mystery in Bruguières".
- **Q:** Images with text or spoken audio to translate?
  **A:** None: the Auguste images contain no text and the only audio is church bells. All text is drawn by the UI.

### Screens and settings

- **Q:** Tu or vous?
  **A:** Tu, as in the source game: Auguste speaks warmly to the family. (default accepted)

### Telemetry and success metrics

- **Q:** What shows that the game works (opt-in Firebase only)?
  **A:** All four: (1) completed routes - starts, the step where families drop out, completions (funnel per step); (2) the end rating (average stars); (3) hard riddles - riddles missed at the first try, to spot badly worded questions; (4) radar help - use of "I'm here!" (manual arrival) and "I can't find the place", per step, to spot badly placed coordinates. No identifiers, no device UUID, no position ever sent.

### Constraints

- **Q:** What is out of scope for this version?
  **A:** Other towns or routes (the engine stays scenario-driven but one route ships), an in-app map (the "I can't find the place" link to the maps app stays), multiplayer or online leaderboard, iOS. Also no remote/demo mode (see Gameplay).
- **Q:** Offline?
  **A:** Yes: everything (texts, images, sounds) is bundled; only GPS is needed, no network. (default accepted)

## Decisions taken during discovery

- Port of the existing game into the factory; scenario content kept verbatim (French), English translation added.
- The Azure backend (send1/send2 notifications) is removed: no backend. Those moments become opt-in Firebase Analytics events.
- No device UUID in telemetry (the source sent one); opt-in consent screen added (the source had none).
- The source `.env`, `google-services.json`, APK and build/upload scripts are never copied into the new repository.
- New Android package (io.github.nhilaire.mysteresbruguieres): it installs next to the old APK, not over it.

