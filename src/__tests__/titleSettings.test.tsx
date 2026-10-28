import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { SettingsScreen } from '../screens/SettingsScreen';
import { TitleScreen } from '../screens/TitleScreen';

const handlers = () => ({ onStart: jest.fn(), onRestart: jest.fn(), onSettings: jest.fn(), onAbout: jest.fn() });

describe('title screen', () => {
  it('offers only "Start the adventure" (plus settings and about) when never started', async () => {
    await render(<TitleScreen summary={{ started: false, places: 0, solved: 0, percent: 0 }} {...handlers()} />);
    expect(screen.getByTestId('title-start')).toBeTruthy();
    expect(screen.queryByTestId('title-continue')).toBeNull();
    expect(screen.queryByTestId('title-restart')).toBeNull();
    expect(screen.queryByTestId('title-progress')).toBeNull();
    expect(screen.getByTestId('title-settings')).toBeTruthy();
    expect(screen.getByTestId('title-about')).toBeTruthy();
  });

  it('shows the progress card, Continue and Restart when in progress', async () => {
    await render(<TitleScreen summary={{ started: true, places: 3, solved: 2, percent: 36 }} {...handlers()} />);
    expect(screen.getByTestId('title-progress')).toBeTruthy();
    expect(screen.getByText('36 % · 3 lieux sur 9 · 2 énigmes résolues')).toBeTruthy();
    expect(screen.getByTestId('title-continue')).toBeTruthy();
    expect(screen.queryByTestId('title-start')).toBeNull();
  });

  it('restarts only after the destructive confirmation', async () => {
    const h = handlers();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await render(<TitleScreen summary={{ started: true, places: 1, solved: 1, percent: 10 }} {...h} />);
    await fireEvent.press(screen.getByTestId('title-restart'));
    expect(h.onRestart).not.toHaveBeenCalled();
    const buttons = alert.mock.calls[0][2]!;
    expect(buttons.map((b) => b.text)).toEqual(['Annuler', 'Tout effacer']);
    buttons[1].onPress!();
    expect(h.onRestart).toHaveBeenCalled();
  });
});

describe('settings screen', () => {
  it('switches sounds and vibrations independently', async () => {
    const onChangeFeedback = jest.fn();
    await render(
      <SettingsScreen
        telemetryEnabled={false}
        onToggleTelemetry={jest.fn()}
        feedback={{ sound: true, haptics: true }}
        onChangeFeedback={onChangeFeedback}
        onBack={jest.fn()}
      />,
    );
    await fireEvent(screen.getByTestId('settings-sound'), 'valueChange', false);
    expect(onChangeFeedback).toHaveBeenLastCalledWith({ sound: false, haptics: true });
    await fireEvent(screen.getByTestId('settings-haptics'), 'valueChange', false);
    expect(onChangeFeedback).toHaveBeenLastCalledWith({ sound: true, haptics: false });
  });

  it('shows the stored statistics choice and changes it', async () => {
    const onToggleTelemetry = jest.fn();
    await render(
      <SettingsScreen
        telemetryEnabled
        onToggleTelemetry={onToggleTelemetry}
        feedback={{ sound: true, haptics: true }}
        onChangeFeedback={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByTestId('settings-telemetry').props.value).toBe(true);
    await fireEvent(screen.getByTestId('settings-telemetry'), 'valueChange', false);
    expect(onToggleTelemetry).toHaveBeenCalledWith(false);
  });
});
