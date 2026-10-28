import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { initialProgress, rate } from '../game/adventure';
import { EndView } from '../screens/game/EndView';

function Harness({ onRate }: { onRate: (n: number) => void }) {
  const [progress, setProgress] = useState(initialProgress);
  return (
    <EndView
      texts={['Merci', 'Au revoir']}
      score={7}
      rating={progress.rating}
      onRate={(n) => {
        onRate(n);
        setProgress((p) => rate(p, n));
      }}
      onRestart={jest.fn()}
    />
  );
}

it('shows the score out of 9, records one rating, then the stars are read-only with a thank-you', async () => {
  const onRate = jest.fn();
  await render(<Harness onRate={onRate} />);
  expect(screen.getByTestId('end-score').props.children).toBe('Énigmes trouvées du premier coup : 7 / 9');
  expect(screen.getByText('Donne ta note à cette aventure :')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('end-star-4'));
  expect(onRate).toHaveBeenCalledWith(4);
  expect(screen.getByText('Merci pour ta note !')).toBeTruthy();
  expect(screen.getByTestId('end-star-4').props.accessibilityState).toMatchObject({ checked: true, disabled: true });
  await fireEvent.press(screen.getByTestId('end-star-1'));
  expect(onRate).toHaveBeenCalledTimes(1);
});

it('shows Auguste happy and offers to restart', async () => {
  const onRestart = jest.fn();
  await render(<EndView texts={['Fin']} score={9} rating={5} onRate={jest.fn()} onRestart={onRestart} />);
  expect(screen.getByTestId('auguste-reaction-happy')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('end-restart'));
  expect(onRestart).toHaveBeenCalled();
});
