import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, spacing, workshop } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  // Smaller second line under the label (also read as the accessibility hint).
  caption?: string;
  disabled?: boolean;
  testID?: string;
};

// Brass plate (primary), engraved outline (secondary) or plain text (ghost).
export function Button({ label, onPress, variant = 'primary', caption, disabled, testID }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={caption}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, disabled && styles.disabled]}
    >
      <View style={styles.texts}>
        <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
        {caption && <Text style={[styles.caption, primary ? styles.primaryCaption : styles.secondaryCaption]}>{caption}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: 14, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  primary: { backgroundColor: colors.accent, borderWidth: 2, borderColor: workshop.goldBright },
  secondary: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: workshop.goldDeep },
  ghost: { backgroundColor: 'transparent', minHeight: 44 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
  texts: { alignItems: 'center', gap: 2 },
  label: { fontSize: font.body, fontWeight: '700', textAlign: 'center' },
  primaryLabel: { color: colors.accentText },
  secondaryLabel: { color: colors.text },
  caption: { fontSize: font.small - 1, textAlign: 'center' },
  primaryCaption: { color: workshop.ink700 },
  secondaryCaption: { color: colors.muted },
});
