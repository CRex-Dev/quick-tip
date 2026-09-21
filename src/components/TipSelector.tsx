import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, Theme, useTheme } from '../theme';
import { AmountField } from './AmountField';

export const TIP_PRESETS = [10, 15, 18, 20] as const;

interface TipSelectorProps {
  /** The selected preset, or null when a custom percentage is in use. */
  selectedPreset: number | null;
  onSelectPreset: (percent: number) => void;
  customText: string;
  onChangeCustom: (text: string) => void;
}

export function TipSelector({
  selectedPreset,
  onSelectPreset,
  customText,
  onChangeCustom,
}: TipSelectorProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.presetRow}>
        {TIP_PRESETS.map((percent) => {
          const selected = selectedPreset === percent;
          return (
            <Pressable
              key={percent}
              onPress={() => onSelectPreset(percent)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${percent} percent tip`}
              android_ripple={{ color: theme.colors.ripple }}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {percent}%
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.customRow}>
        <Text style={styles.customLabel}>Custom</Text>
        <View style={styles.customField}>
          <AmountField
            compact
            value={customText}
            onChangeText={onChangeCustom}
            placeholder="0"
            suffix="%"
            maxLength={5}
            accessibilityLabel="Custom tip percentage"
          />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    presetRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    chip: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: 'transparent',
    },
    chipSelected: {
      backgroundColor: theme.colors.secondaryContainer,
      borderColor: theme.colors.secondaryContainer,
    },
    chipPressed: {
      opacity: 0.75,
    },
    chipLabel: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 15,
      fontWeight: '600',
    },
    chipLabelSelected: {
      color: theme.colors.onSecondaryContainer,
    },
    customRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    customLabel: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 15,
      fontWeight: '500',
    },
    customField: {
      flex: 1,
    },
  });
