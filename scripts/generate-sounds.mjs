// Generates the game's short sound effects as 16-bit mono WAV files (no dependency, self-made: no licence issue).
// Run: node scripts/generate-sounds.mjs  -> assets/sounds/*.wav (committed).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

// A bell-like tone: a few inharmonic partials with exponential decay.
function bell(samples, start, freq, duration, gain, decay = 4) {
  const partials = [
    [1, 1],
    [2.01, 0.45],
    [2.76, 0.25],
    [5.4, 0.08],
  ];
  const from = Math.floor(start * RATE);
  const length = Math.floor(duration * RATE);
  for (let i = 0; i < length && from + i < samples.length; i++) {
    const t = i / RATE;
    const attack = Math.min(1, t / 0.004);
    const env = attack * Math.exp(-decay * t);
    let v = 0;
    for (const [ratio, amp] of partials) v += amp * Math.sin(2 * Math.PI * freq * ratio * t);
    samples[from + i] += gain * env * v;
  }
}

// A soft square-ish buzz (wrong answer), low-pass by averaging.
function buzz(samples, start, freq, duration, gain) {
  const from = Math.floor(start * RATE);
  const length = Math.floor(duration * RATE);
  for (let i = 0; i < length && from + i < samples.length; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / 0.01) * Math.min(1, (duration - t) / 0.05);
    const v = Math.tanh(3 * Math.sin(2 * Math.PI * freq * t)) * 0.6;
    samples[from + i] += gain * env * v;
  }
}

function click(samples, start, gain) {
  const from = Math.floor(start * RATE);
  for (let i = 0; i < 0.03 * RATE && from + i < samples.length; i++) {
    const t = i / RATE;
    samples[from + i] += gain * Math.exp(-180 * t) * Math.sin(2 * Math.PI * 2400 * t);
  }
}

function render(seconds, draw) {
  const samples = new Float32Array(Math.floor(seconds * RATE));
  draw(samples);
  const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  return samples.map((v) => (v / peak) * 0.8);
}

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const SOUNDS = {
  // Radar sonar ping.
  ping: render(0.35, (s) => bell(s, 0, 1320, 0.35, 1, 14)),
  // Arrival: three rising bell notes.
  chime: render(1.4, (s) => {
    bell(s, 0, 784, 1.4, 0.8, 3);
    bell(s, 0.16, 988, 1.2, 0.8, 3);
    bell(s, 0.32, 1175, 1.08, 1, 3);
  }),
  // Right answer: two quick ascending notes.
  right: render(0.6, (s) => {
    bell(s, 0, 880, 0.6, 0.8, 7);
    bell(s, 0.11, 1319, 0.49, 1, 7);
  }),
  // Wrong answer: a short low descending buzz.
  wrong: render(0.35, (s) => {
    buzz(s, 0, 196, 0.16, 1);
    buzz(s, 0.17, 165, 0.18, 1);
  }),
  // Letter found in the final puzzle: clockwork tick.
  tick: render(0.08, (s) => click(s, 0, 1)),
};

mkdirSync(OUT, { recursive: true });
for (const [name, samples] of Object.entries(SOUNDS)) {
  writeFileSync(join(OUT, `${name}.wav`), wav(samples));
  console.log(`${name}.wav ${samples.length} samples`);
}
