import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { MOUTH_RECTS, SHEET_SIZE } from '../assets';

const SOUNDS_DIR = join(__dirname, '..', '..', 'assets', 'sounds');

// A missing "data" chunk made ExoPlayer fail silently on a phone in another game: check the header byte by byte.
describe.each(['ping', 'chime', 'right', 'wrong', 'tick'])('%s.wav', (name) => {
  const file = readFileSync(join(SOUNDS_DIR, `${name}.wav`));

  it('is a 16-bit mono PCM WAV with a data chunk at byte 36', () => {
    expect(file.toString('ascii', 0, 4)).toBe('RIFF');
    expect(file.readUInt32LE(4)).toBe(file.length - 8);
    expect(file.toString('ascii', 8, 12)).toBe('WAVE');
    expect(file.toString('ascii', 12, 16)).toBe('fmt ');
    expect(file.readUInt16LE(20)).toBe(1);
    expect(file.readUInt16LE(22)).toBe(1);
    expect(file.readUInt16LE(34)).toBe(16);
    expect(file.toString('ascii', 36, 40)).toBe('data');
    expect(file.readUInt32LE(40)).toBe(file.length - 44);
  });

  it('is not silent', () => {
    let peak = 0;
    for (let i = 44; i < file.length; i += 2) peak = Math.max(peak, Math.abs(file.readInt16LE(i)));
    expect(peak).toBeGreaterThan(10000);
  });
});

describe('church bells', () => {
  it('is an MP3 file', () => {
    const file = readFileSync(join(SOUNDS_DIR, 'bells.mp3'));
    const id3 = file.toString('ascii', 0, 3) === 'ID3';
    const frameSync = file[0] === 0xff && (file[1] & 0xe0) === 0xe0;
    expect(id3 || frameSync).toBe(true);
  });
});

describe('Auguste sprite cells', () => {
  it('fit inside the sheet and all have the same size', () => {
    MOUTH_RECTS.forEach((r) => {
      expect(r.x + r.w).toBeLessThanOrEqual(SHEET_SIZE.width);
      expect(r.y + r.h).toBeLessThanOrEqual(SHEET_SIZE.height);
      expect([r.w, r.h]).toEqual([MOUTH_RECTS[0].w, MOUTH_RECTS[0].h]);
    });
  });
});
