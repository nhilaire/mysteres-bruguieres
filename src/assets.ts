// Bundled images and sounds. Everything is local: the game works offline.
import type { ImageSourcePropType } from 'react-native';

// A rectangle inside a sprite sheet, in sheet pixels.
export type SpriteRect = { x: number; y: number; w: number; h: number };

// Auguste talking: 5 poses, each a 896x1200 sheet with a 2x2 grid of mouth openings (0 = closed, at rest).
export const SHEET_SIZE = { width: 896, height: 1200 } as const;

const CELL_W = 428;
const CELL_H = 573;

// Cell origins measured on the files (magenta gutters, inset 1-2 px). The bottom row sits 7 px lower on every sheet
// (a constant drift of the image generator): compensating it keeps the portrait from jumping while he talks.
export const MOUTH_RECTS: readonly SpriteRect[] = [
  { x: 13, y: 15, w: CELL_W, h: CELL_H },
  { x: 455, y: 15, w: CELL_W, h: CELL_H },
  { x: 13, y: 614, w: CELL_W, h: CELL_H },
  { x: 455, y: 614, w: CELL_W, h: CELL_H },
];

// One pose per paragraph, cycling: neutral, raised fingers, pocket watch, open hand, parchment.
export const AUGUSTE_SHEETS: readonly ImageSourcePropType[] = [
  require('../assets/images/auguste/scene1.jpg'),
  require('../assets/images/auguste/scene2.jpg'),
  require('../assets/images/auguste/scene3.jpg'),
  require('../assets/images/auguste/scene4.jpg'),
  require('../assets/images/auguste/scene5.jpg'),
];

export const TITLE_IMAGE: ImageSourcePropType = require('../assets/images/auguste/title.jpg');

// Auguste's reactions (single portraits): right answer, wrong answer, final puzzle, word revealed, end.
export type Reaction = 'amazed' | 'worried' | 'focused' | 'surprised' | 'happy';

export const REACTIONS: Record<Reaction, ImageSourcePropType> = {
  amazed: require('../assets/images/reactions/amazed.jpg'),
  worried: require('../assets/images/reactions/worried.jpg'),
  focused: require('../assets/images/reactions/focused.jpg'),
  surprised: require('../assets/images/reactions/surprised.jpg'),
  happy: require('../assets/images/reactions/happy.jpg'),
};

export type SoundName = 'ping' | 'chime' | 'right' | 'wrong' | 'tick' | 'bells';

export const SOUNDS: Record<SoundName, number> = {
  ping: require('../assets/sounds/ping.wav'),
  chime: require('../assets/sounds/chime.wav'),
  right: require('../assets/sounds/right.wav'),
  wrong: require('../assets/sounds/wrong.wav'),
  tick: require('../assets/sounds/tick.wav'),
  bells: require('../assets/sounds/bells.mp3'),
};
