import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { AUGUSTE_SHEETS, MOUTH_RECTS, Reaction, REACTIONS, SHEET_SIZE } from '../assets';
import { MOUTH_FRAME_MS, MOUTH_SEQUENCE } from '../game/narration';
import { useI18n } from '../i18n/I18nProvider';
import { workshop } from './theme';

const CELL = MOUTH_RECTS[0];
export const PORTRAIT_RATIO = CELL.h / CELL.w;

type Props = {
  width: number;
  // Talking pose (sprite sheet index, cycles) or a single reaction portrait.
  pose?: number;
  reaction?: Reaction;
  talking?: boolean;
  // Slow breathing loop. Only on narration screens: a never-ending transform keeps the accessibility tree moving,
  // which stalls UI automation on screens with many taps (riddles, final puzzle).
  breathing?: boolean;
};

// Auguste's portrait. All sprite sheets stay mounted (only the current one is visible) so that changing pose or
// mouth never reloads an image: changing a frame only moves the sheet behind a fixed window.
export function AugustePortrait({ width, pose = 0, reaction, talking = false, breathing = false }: Props) {
  const { t } = useI18n();
  const height = width * PORTRAIT_RATIO;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!talking) {
      setStep(0);
      return;
    }
    const id = setInterval(() => setStep((s) => s + 1), MOUTH_FRAME_MS);
    return () => clearInterval(id);
  }, [talking]);

  // Slow breathing at rest and while talking: the portrait never looks frozen.
  const breath = useSharedValue(1);
  useEffect(() => {
    if (!breathing) return;
    breath.value = withRepeat(withTiming(1.02, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => {
      cancelAnimation(breath);
      breath.value = 1;
    };
  }, [breath, breathing]);
  const breathStyle = useAnimatedStyle(() => ({ transform: [{ scale: breath.value }] }));

  const mouth = talking ? MOUTH_SEQUENCE[step % MOUTH_SEQUENCE.length] : 0;
  const rect = MOUTH_RECTS[mouth];
  const scale = width / CELL.w;
  const current = ((pose % AUGUSTE_SHEETS.length) + AUGUSTE_SHEETS.length) % AUGUSTE_SHEETS.length;

  return (
    <View
      style={[styles.frame, { width, height }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t.game.portrait}
      testID={reaction ? `auguste-reaction-${reaction}` : 'auguste-portrait'}
    >
      <Animated.View style={[StyleSheet.absoluteFill, breathStyle]}>
        {AUGUSTE_SHEETS.map((source, i) => (
          <Image
            key={i}
            source={source}
            style={{
              position: 'absolute',
              width: SHEET_SIZE.width * scale,
              height: SHEET_SIZE.height * scale,
              left: -rect.x * scale,
              top: -rect.y * scale,
              opacity: !reaction && i === current ? 1 : 0,
            }}
          />
        ))}
        {reaction && <Image source={REACTIONS[reaction]} style={{ position: 'absolute', left: 0, top: 0, width, height }} resizeMode="cover" />}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderRadius: 16, borderWidth: 3, borderColor: workshop.goldDeep, backgroundColor: workshop.ink800 },
});
