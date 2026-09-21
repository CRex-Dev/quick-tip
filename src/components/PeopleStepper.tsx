import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, Theme, useTheme } from '../theme';

interface PeopleStepperProps {
  /** Raw text, so the field can be briefly empty while being edited. */
  value: string;
  onChangeText: (text: string) => void;
  onStep: (delta: number) => void;
  min: number;
  max: number;
  current: number;
}

/** Minus / editable count / plus. The count is typeable for large groups. */
export function PeopleStepper({
  value,
  onChangeText,
  onStep,
  min,
  max,
  current,
}: PeopleStepperProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <StepButton
        label="−"
        accessibilityLabel="Remove one person"
        disabled={current <= min}
        onPress={() => onStep(-1)}
        theme={theme}
      />
      <TextInput
        style={styles.count}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={3}
        selectionColor={theme.colors.primary}
        accessibilityLabel="Number of people"
        placeholder={String(min)}
        placeholderTextColor={theme.colors.outline}
      />
      <StepButton
        label="+"
        accessibilityLabel="Add one person"
        disabled={current >= max}
        onPress={() => onStep(1)}
        theme={theme}
      />
    </View>
  );
}

interface StepButtonProps {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
  theme: Theme;
}

function StepButton({ label, accessibilityLabel, disabled, onPress, theme }: StepButtonProps) {
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      android_ripple={{ color: theme.colors.ripple, borderless: false }}
      style={({ pressed }) => [
        styles.stepButton,
        disabled && styles.stepButtonDisabled,
        pressed && !disabled && styles.stepButtonPressed,
      ]}
    >
      <Text style={[styles.stepLabel, disabled && styles.stepLabelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    count: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.onSurface,
      fontSize: 32,
      fontWeight: '700',
      paddingVertical: spacing.sm,
    },
    stepButton: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: theme.colors.secondaryContainer,
    },
    stepButtonPressed: {
      opacity: 0.75,
    },
    stepButtonDisabled: {
      backgroundColor: theme.colors.surfaceContainerHigh,
    },
    stepLabel: {
      color: theme.colors.onSecondaryContainer,
      fontSize: 28,
      lineHeight: 32,
      fontWeight: '500',
    },
    stepLabelDisabled: {
      color: theme.colors.outline,
    },
  });
