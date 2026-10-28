import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { configureFeedback, playSound, stopSound } from '../feedback/feedback';
import { boldSegments, initialNarration, isTyping, tapNarration, typeNext, visibleText } from '../game/narration';
import { NarrationView } from '../screens/game/NarrationView';

jest.mock('../feedback/feedback', () => ({
  ...jest.requireActual('../feedback/feedback'),
  playSound: jest.fn(),
  stopSound: jest.fn(),
}));

const blocks = ['Abc', 'De'];

describe('typewriter rules', () => {
  it('reveals one character at a time', () => {
    let state = initialNarration;
    state = typeNext(state, blocks);
    expect(state).toEqual({ block: 0, shown: 1 });
    expect(isTyping(state, blocks)).toBe(true);
  });

  it('a tap while typing shows the whole block', () => {
    const { state, finished } = tapNarration({ block: 0, shown: 1 }, blocks);
    expect(state).toEqual({ block: 0, shown: 3 });
    expect(finished).toBe(false);
  });

  it('a tap after the block goes to the next block', () => {
    expect(tapNarration({ block: 0, shown: 3 }, blocks)).toEqual({ state: { block: 1, shown: 0 }, finished: false });
  });

  it('a tap on the last block finishes the screen', () => {
    expect(tapNarration({ block: 1, shown: 2 }, blocks).finished).toBe(true);
  });

  it('renders **bold** and hides the markers', () => {
    expect(boldSegments('a **b** c')).toEqual([
      { text: 'a ', bold: false },
      { text: 'b', bold: true },
      { text: ' c', bold: false },
    ]);
    expect(boldSegments('a **bc** d', 3)).toEqual([
      { text: 'a ', bold: false },
      { text: 'b', bold: true },
    ]);
    expect(visibleText('a **b** c')).toBe('a b c');
  });
});

describe('narration screen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    configureFeedback({ sound: true, haptics: true });
  });

  it('types the text, completes on tap, then finishes on the last block', async () => {
    const onFinish = jest.fn();
    await render(<NarrationView texts={['Bonjour', 'Fin']} onFinish={onFinish} />);
    await act(() => jest.advanceTimersByTime(30 * 3));
    expect(screen.getByTestId('narration-text').props.children).toBeTruthy();
    await fireEvent.press(screen.getByTestId('narration-tap'));
    expect(screen.getByText('Bonjour')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('narration-tap'));
    await fireEvent.press(screen.getByTestId('narration-tap'));
    expect(screen.getByText('Fin')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('narration-tap'));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('plays the church bells on its screen and stops them when leaving', async () => {
    await render(<NarrationView texts={['Ding']} sound="bells" onFinish={jest.fn()} />);
    expect(playSound).toHaveBeenCalledWith('bells');
    await screen.unmount();
    expect(stopSound).toHaveBeenCalledWith('bells');
  });

  it('plays no sound on a screen without sound', async () => {
    await render(<NarrationView texts={['Rien']} onFinish={jest.fn()} />);
    expect(playSound).not.toHaveBeenCalled();
  });
});
