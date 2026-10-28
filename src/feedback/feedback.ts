// Sounds and vibrations, gated by the player's settings. Every call is fire-and-forget: a missing audio or haptic
// engine never breaks the game.
import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { SoundName, SOUNDS } from '../assets';
import type { FeedbackSettings } from '../storage/feedbackSettings';

let settings: FeedbackSettings = { sound: true, haptics: true };
const players = new Map<SoundName, AudioPlayer>();

export function configureFeedback(next: FeedbackSettings): void {
  settings = next;
  if (!next.sound) players.forEach((player) => safely(() => player.pause()));
}

function safely(action: () => unknown): void {
  try {
    const result = action();
    if (result instanceof Promise) result.catch(() => undefined);
  } catch {
    // Audio or haptics unavailable: the game goes on silently.
  }
}

function playerFor(name: SoundName): AudioPlayer {
  let player = players.get(name);
  if (!player) {
    player = createAudioPlayer(SOUNDS[name]);
    players.set(name, player);
    // Proof in logcat that the sound was loaded on the device (the emulator runs without audio).
    console.log(`SOUND_LOADED ${name}`);
  }
  return player;
}

export function playSound(name: SoundName): void {
  if (!settings.sound) return;
  safely(() => {
    const player = playerFor(name);
    player.seekTo(0);
    player.play();
  });
}

export function stopSound(name: SoundName): void {
  const player = players.get(name);
  if (player) safely(() => player.pause());
}

export type HapticKind = 'tick' | 'letter' | 'arrival' | 'right' | 'wrong';

export function vibrate(kind: HapticKind): void {
  if (!settings.haptics) return;
  safely(() => {
    switch (kind) {
      case 'tick':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'letter':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'arrival':
      case 'right':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'wrong':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  });
}
