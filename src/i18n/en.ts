// English translation of fr.ts (same keys, enforced by the Strings type). English typography: no space before
// ": ! ?", comma as thousands separator.
import { formatter } from './format';
import type { Strings } from './types';

const { label } = formatter('en-US');

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

export const en: Strings = {
  locale: 'en-GB',
  consent: {
    title: 'Your data, your choice',
    body:
      'Mystery in Bruguières can send anonymous statistics (steps reached, riddles, crashes) to improve the route. ' +
      'No location, no identifier.',
    accept: 'I accept',
    refuse: 'I refuse',
    footnote: 'You can change your mind in the settings.',
  },
  title: {
    tagline: 'Treasure hunt · Bruguières',
    start: 'Start the adventure',
    continue: 'Continue',
    continueHint: 'Pick up where you left off',
    restart: 'Restart',
    progressTitle: 'Investigation in progress',
    progress: (places: number, solved: number) => `${places} of 9 places · ${solved} riddles solved`,
    percent: (percent: number) => `${percent}%`,
    settings: 'Settings',
    about: 'About the game',
    imageLabel: 'Auguste Meridius, master clockmaker, in his workshop',
  },
  restart: {
    title: 'Start again from the beginning?',
    body: 'Your current progress and score will be erased. This cannot be undone.',
    confirm: 'Erase everything',
    cancel: 'Cancel',
  },
  location: {
    kicker: 'Before you set off',
    title: 'The radar needs your location',
    why:
      "Mystery in Bruguières is played in the street. At each step, a radar works out the distance and direction of the " +
      "next place from your phone's location, and detects your arrival to unlock the riddle.",
    private: '📍 Your location is only used for this calculation, on your phone. It is never stored or sent.',
    battery: '🔋 GPS only runs on radar screens, never during the story.',
    compass: '🧭 The compass turns the radar. It needs no permission.',
    systemHint: 'The question comes from your phone: choose "While using the app".',
    allow: 'Allow location',
    askAgain: 'Ask again',
    openSettings: 'Open settings',
    enable: 'Turn on location',
    retry: 'Try again',
    withoutGps: 'Play without GPS',
    deniedTitle: 'Without your location, the radar is blind',
    denied:
      'Permission was refused. The game can no longer guide you to the places or detect your arrival: you will only ' +
      'have the story\'s clues, and the "I\'m here!" button to tap at each step.',
    blockedTitle: 'Permission is blocked',
    blocked:
      'Your phone no longer lets us ask. To wake the radar up: Settings → Mystery in Bruguières → Location → ' +
      '"While using the app".',
    servicesDisabledTitle: 'Location is turned off',
    servicesDisabled: 'Permission is granted, but location is turned off on the device: no GPS signal can reach the game.',
    errorTitle: 'Unable to check your location',
    error:
      "Something went wrong while reading your phone's GPS. You can try again, or set off anyway and confirm your " +
      'arrivals by hand.',
    returnHint: 'Then come back to the game: this screen updates by itself.',
    back: 'Back to the menu',
  },
  game: {
    menu: 'Menu',
    menuLabel: 'Open the game menu',
    menuHint: 'Pauses the adventure and goes back to the title screen',
    back: 'Go to the previous screen',
    forward: 'Go to the next screen',
    tapToContinue: '(Tap to continue)',
    tapHintTyping: 'Tap to show the whole text at once',
    tapHintNext: 'Tap for the next paragraph',
    tapHintLast: 'Tap to carry on',
    portrait: 'Portrait of Auguste Meridius, master clockmaker of Bruguières',
  },
  radar: {
    step: (n: number) => `Step ${n} of 9`,
    searching: 'Looking for GPS signal…',
    noLocation: 'Location unavailable.',
    noCompass: 'Compass unavailable: follow the direction shown.',
    direction: (dir: string) => label('Direction', dir),
    arrived: "You're there!",
    imHere: "I'm here!",
    imHereLabel: 'Confirm by hand that I have arrived',
    lost: "I can't find the place",
    lostLabel: 'Open walking directions in the maps app',
    radarLabel: (distance: string, dir: string) => `Radar: place ${distance} away, heading ${dir}`,
  },
  dir: {
    n: 'North',
    ne: 'North-East',
    e: 'East',
    se: 'South-East',
    s: 'South',
    sw: 'South-West',
    w: 'West',
    nw: 'North-West',
  },
  quiz: {
    waiting: 'Waiting for your answer…',
    answer: (choice: string) => label('Answer', choice),
    right: 'Well done!',
    wrong: 'Not this one… try again!',
  },
  puzzle: {
    title: 'The last mechanism',
    intro: "Your 9 numbers are the gears. Work out each sum: the result gives a letter's place in the alphabet.",
    numbersLabel: 'Your numbers',
    ordinal,
    validate: 'Check',
    erase: 'Erase',
    wrong: 'Not quite… count again!',
    reveal: 'Show me',
    revealHint: 'Stuck? Auguste can show you this sum.',
    solved: 'The forgotten word is…',
    continue: 'Continue',
  },
  final: {
    title: 'Adventure complete!',
    score: (score: number) => `Riddles solved at the first try: ${score} / 9`,
    rate: 'Rate this adventure:',
    star: (n: number) => `Give ${n} star${n > 1 ? 's' : ''}`,
    thanks: 'Thanks for your rating!',
    restart: 'Restart the adventure',
  },
  settings: {
    title: 'Settings',
    sound: 'Sounds',
    soundHelp: 'Radar ping, chime, answers and bells.',
    haptics: 'Vibrations',
    hapticsHelp: 'Proximity tick near the place, arrival and answers.',
    telemetry: 'Anonymous statistics',
    telemetryHelp: 'Helps improve the route. No location, no identifier is sent.',
    language: 'Language',
    languageAuto: 'Automatic',
    back: 'Back',
  },
  about: {
    title: 'About',
    storyTitle: 'The story of this game',
    story: [
      'I first made this game to show Bruguières to my children without dragging them from one monument to the next. ' +
        'Then I showed it to the neighbours, who joined us on the way… and I wanted to share it with every family ' +
        'curious about the town.',
    ],
    developer: 'Made by a passionate independent developer.',
    howToTitle: 'How it works',
    howTo: [
      {
        title: 'Auguste tells the story',
        body: 'At each step, the old clockmaker opens a page of Bruguières\' memory for you and tells you where to look.',
      },
      {
        title: 'The radar guides you',
        body:
          'A compass and the live distance lead you to the next place. Once there, the screen moves on by itself, or you ' +
          'confirm with a tap.',
      },
      {
        title: 'Look and answer',
        body: "The riddle's answer is not in the phone: it is right in front of you, on a plaque, a wall, a staircase.",
      },
      {
        title: 'Wake up the past',
        body: "Each place gives you a number. Collect them all and the last puzzle will reveal Auguste's lost memory.",
      },
    ],
    practicalTitle: 'Before you set off',
    practical: [
      '9 places to discover, 9 riddles to solve.',
      'Allow about 2 hours, on foot or by bike. The route stays in the village centre.',
      'Turn on GPS and keep a good battery level: the radar uses location and compass all the time.',
      'You can stop whenever you like: progress is saved automatically on your phone.',
      "You score a point for each riddle solved at the first try. The final score is yours, not Auguste's.",
      'If the radar plays tricks on you, the "I can\'t find the place" button opens directions in your maps app.',
    ],
    authorTitle: 'A word from the author',
    author: [
      'This game did not come out of a studio: it was imagined and programmed in my free time, without pretension.',
      'It can surely be improved and probably has a few bugs. If something does not work as expected, thank you in ' +
        'advance for your patience.',
    ],
    dataTitle: 'Your data',
    data: ['Your location never leaves your phone. Anonymous statistics are only sent if you accepted them.'],
    version: (version: string) => `Version ${version}`,
    back: 'Back',
  },
  errors: {
    title: 'Oops',
    body: 'Something went wrong. Restart the game.',
    retry: 'Try again',
  },
};
