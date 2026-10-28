import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { SOUNDS } from '../assets';
import { configureFeedback, playSound, stopSound, vibrate } from '../feedback/feedback';

const player = () => jest.mocked(createAudioPlayer).mock.results.at(-1)?.value;

beforeEach(() => {
  jest.clearAllMocks();
  configureFeedback({ sound: true, haptics: true });
});

describe('sounds', () => {
  it('plays a sound from the start when sounds are on', () => {
    playSound('right');
    expect(createAudioPlayer).toHaveBeenCalledWith(SOUNDS.right);
    expect(player().seekTo).toHaveBeenCalledWith(0);
    expect(player().play).toHaveBeenCalled();
  });

  it('plays nothing when sounds are off', () => {
    configureFeedback({ sound: false, haptics: true });
    playSound('wrong');
    expect(createAudioPlayer).not.toHaveBeenCalled();
  });

  it('plays the church bells when sounds are on, and stops them', () => {
    playSound('bells');
    expect(createAudioPlayer).toHaveBeenCalledWith(SOUNDS.bells);
    const bells = player();
    expect(bells.play).toHaveBeenCalled();
    stopSound('bells');
    expect(bells.pause).toHaveBeenCalled();
  });

  it('does not play the church bells when sounds are off', () => {
    configureFeedback({ sound: false, haptics: true });
    playSound('bells');
    expect(createAudioPlayer).not.toHaveBeenCalledWith(SOUNDS.bells);
  });

  it('stops a playing sound when sounds are turned off', () => {
    playSound('chime');
    const chime = player();
    configureFeedback({ sound: false, haptics: true });
    expect(chime.pause).toHaveBeenCalled();
  });
});

describe('vibrations', () => {
  it.each([
    ['tick', 'impactAsync'],
    ['letter', 'impactAsync'],
    ['arrival', 'notificationAsync'],
    ['right', 'notificationAsync'],
    ['wrong', 'notificationAsync'],
  ] as const)('%s triggers %s when vibrations are on', (kind, api) => {
    vibrate(kind);
    expect(Haptics[api]).toHaveBeenCalled();
  });

  it('never vibrates when vibrations are off', () => {
    configureFeedback({ sound: true, haptics: false });
    for (const kind of ['tick', 'letter', 'arrival', 'right', 'wrong'] as const) vibrate(kind);
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
