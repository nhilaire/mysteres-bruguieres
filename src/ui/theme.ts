// Two moods, kept from the original game: Auguste's workshop (ink and brass) for the menu, settings, About,
// consent and location screens; golden daylight in the game itself.
export const workshop = {
  ink900: '#150d04',
  ink800: '#241708',
  ink700: '#33210d',
  goldBright: '#ffd77a',
  gold: '#e5b04a',
  goldDeep: '#a3701c',
  parchment: '#f6e8ca',
  parchmentMuted: '#c9b28a',
} as const;

export const daylight = {
  gradient: ['#ffe08a', '#e0b84c', '#b97a1a'] as const,
  text: '#222222',
  muted: '#555555',
  card: 'rgba(255, 248, 230, 0.82)',
  success: '#2a7d2a',
  successBg: '#b6e7b0',
  error: '#b00000',
  errorBg: '#f7b0b0',
  star: '#f5c518',
  starOff: '#cccccc',
  // Radar proximity colours (never the only cue: the distance is always written).
  cold: '#3b82c4',
  warm: '#e08a1e',
  hot: '#d23c2a',
} as const;

// Template components (Screen, Button, consent, settings) use these names.
export const colors = {
  background: workshop.ink900,
  surface: workshop.ink800,
  text: workshop.parchment,
  muted: workshop.parchmentMuted,
  accent: workshop.gold,
  accentText: workshop.ink900,
  danger: '#F97066',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;

export const font = { title: 34, heading: 24, body: 17, small: 14 } as const;
