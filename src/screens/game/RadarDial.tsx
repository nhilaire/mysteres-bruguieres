import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';

import { ProximityZone } from '../../game/radar';
import { daylight, workshop } from '../../ui/theme';

type Props = {
  size: number;
  // Where the target is on the dial, degrees clockwise from the top of the screen.
  targetAngle: number | null;
  // 0 (centre) .. 1 (rim).
  targetRadius: number;
  // Where north is on the dial (0 when the dial is north-up, i.e. without compass).
  northAngle: number;
  // Whether the big arrow is shown (needs a compass).
  arrow: boolean;
  zone: ProximityZone;
  pulseSeconds: number;
  arrived: boolean;
};

const ZONE_COLORS: Record<ProximityZone, string> = { cold: daylight.cold, warm: daylight.warm, hot: daylight.hot };
const SWEEP_MS = 2800;

// Brass radar: rotating sweep, pulse ring whose rhythm follows the distance, target blip coloured by proximity,
// arrow towards the target, flash on arrival. Drawn in SVG, animated by Reanimated on the UI thread.
export function RadarDial({ size, targetAngle, targetRadius, northAngle, arrow, zone, pulseSeconds, arrived }: Props) {
  const c = size / 2;
  const r = c - 6;
  const color = ZONE_COLORS[zone];

  const sweep = useSharedValue(0);
  useEffect(() => {
    sweep.value = withRepeat(withTiming(360, { duration: SWEEP_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(sweep);
  }, [sweep]);
  const sweepStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${sweep.value}deg` }] }));

  // The pulse restarts when its rhythm changes (quantised to 0.1 s so GPS noise does not restart it constantly).
  const period = Math.round(pulseSeconds * 10) * 100;
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = 0;
    pulse.value = withRepeat(withTiming(1, { duration: period, easing: Easing.out(Easing.quad) }), -1, false);
    return () => cancelAnimation(pulse);
  }, [pulse, period]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.85 * (1 - pulse.value), transform: [{ scale: 0.15 + 0.85 * pulse.value }] }));

  const arrowAngle = useSharedValue(targetAngle ?? 0);
  useEffect(() => {
    if (targetAngle !== null) arrowAngle.value = withTiming(targetAngle, { duration: 220 });
  }, [arrowAngle, targetAngle]);
  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${arrowAngle.value}deg` }] }));

  const flash = useSharedValue(0);
  useEffect(() => {
    if (arrived) flash.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0.35, { duration: 260 }), withTiming(0.9, { duration: 200 }));
  }, [arrived, flash]);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const blip =
    targetAngle === null
      ? null
      : {
          x: c + r * targetRadius * Math.sin((targetAngle * Math.PI) / 180),
          y: c - r * targetRadius * Math.cos((targetAngle * Math.PI) / 180),
        };
  const north = { x: c + (r - 16) * Math.sin((northAngle * Math.PI) / 180), y: c - (r - 16) * Math.cos((northAngle * Math.PI) / 180) };

  return (
    <View style={{ width: size, height: size }} testID="radar-dial">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="screen" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#2c4a35" />
            <Stop offset="1" stopColor="#0e1d14" />
          </RadialGradient>
        </Defs>
        <Circle cx={c} cy={c} r={c - 1} fill={workshop.goldDeep} />
        <Circle cx={c} cy={c} r={r} fill="url(#screen)" stroke={workshop.goldBright} strokeWidth={2} />
        {[0.33, 0.66].map((k) => (
          <Circle key={k} cx={c} cy={c} r={r * k} fill="none" stroke="#5f8f6c" strokeWidth={1} strokeDasharray="4 6" />
        ))}
        <Line x1={c} y1={c - r} x2={c} y2={c + r} stroke="#3e6b4b" strokeWidth={1} />
        <Line x1={c - r} y1={c} x2={c + r} y2={c} stroke="#3e6b4b" strokeWidth={1} />
        <SvgText x={north.x} y={north.y + 5} fill={workshop.goldBright} fontSize={15} fontWeight="bold" textAnchor="middle">
          N
        </SvgText>
        {blip && (
          <G>
            <Circle cx={blip.x} cy={blip.y} r={13} fill={color} opacity={0.35} />
            <Circle cx={blip.x} cy={blip.y} r={7} fill={color} stroke="#fff" strokeWidth={1.5} />
          </G>
        )}
      </Svg>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, sweepStyle]}>
        <Svg width={size} height={size}>
          <Path d={`M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 0 1 ${c + r * Math.sin(Math.PI / 5)} ${c - r * Math.cos(Math.PI / 5)} Z`} fill="#9be3a8" opacity={0.22} />
          <Line x1={c} y1={c} x2={c} y2={c - r} stroke="#b9f5c4" strokeWidth={2} opacity={0.8} />
        </Svg>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.pulse, { width: 2 * r, height: 2 * r, borderRadius: r, left: c - r, top: c - r, borderColor: color }, pulseStyle]}
      />

      {arrow && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, arrowStyle]} testID="radar-arrow">
          <Svg width={size} height={size}>
            <Path
              d={`M ${c} ${c - r * 0.62} L ${c + r * 0.16} ${c - r * 0.18} L ${c} ${c - r * 0.27} L ${c - r * 0.16} ${c - r * 0.18} Z`}
              fill={color}
              stroke="#fff"
              strokeWidth={2}
            />
          </Svg>
        </Animated.View>
      )}

      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { width: 2 * r, height: 2 * r, borderRadius: r, left: c - r, top: c - r }, flashStyle]}
        testID={arrived ? 'radar-arrived' : undefined}
      />
      <View pointerEvents="none" style={[styles.hub, { left: c - 7, top: c - 7 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: { position: 'absolute', borderWidth: 3 },
  flash: { position: 'absolute', backgroundColor: 'rgba(255, 236, 160, 0.9)' },
  hub: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: workshop.goldBright, borderWidth: 2, borderColor: workshop.ink800 },
});
