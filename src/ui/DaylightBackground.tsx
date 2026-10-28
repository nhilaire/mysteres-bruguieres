import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { daylight } from './theme';

// The in-game golden gradient, drawn behind the content.
export function DaylightBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="daylight" x1="0" y1="0" x2="0" y2="1">
          {daylight.gradient.map((color, i) => (
            <Stop key={color} offset={i / (daylight.gradient.length - 1)} stopColor={color} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#daylight)" />
    </Svg>
  );
}
