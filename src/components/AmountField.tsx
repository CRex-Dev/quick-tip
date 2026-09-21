import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, Theme, useTheme } from '../theme';

interface AmountFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Rendered to the left of the input, e.g. a currency mark. */
  prefix?: string;
  /** Rendered to the right of the input, e.g. "%". */
  suffix?: string;
  accessibilityLabel: string;
  maxLength?: number;
  /** Renders smaller — used for the custom-tip row. */
  compact?: boolean;
}

/** A large numeric text field with an optional prefix/suffix affix. */
export function AmountField({
  value,
  onChangeText,
  placeholder = '0',
  prefix,
  suffix,
  accessibilityLabel,
  maxLength = 12,
  compact = false,
}: AmountFieldProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const textSize = compact ? styles.inputCompact : styles.inputLarge;

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      {prefix ? <Text style={[styles.affix, textSize]}>{prefix}</Text> : null}
      <TextInput
        style={[styles.input, textSize]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.outline}
        keyboardType="decimal-pad"
        inputMode="decimal"
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel}
        selectionColor={theme.colors.primary}
        // The numeric keypad has no return key, so submit behaviour is moot;
        // the results update on every keystroke anyway.
        returnKeyType="done"
      />
      {suffix ? <Text style={[styles.affix, textSize]}>{suffix}</Text> : null}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceContainerHigh,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    wrapperCompact: {
      paddingHorizontal: spacing.md,
    },
    input: {
      flex: 1,
      color: theme.colors.onSurface,
      fontWeight: '600',
      // Vertical padding rather than a fixed height keeps the field usable at
      // large system font scales.
      paddingVertical: spacing.md,
    },
    inputLarge: {
      fontSize: 32,
    },
    inputCompact: {
      fontSize: 18,
    },
    affix: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },
  });
