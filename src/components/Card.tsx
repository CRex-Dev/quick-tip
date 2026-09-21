import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { radius, spacing, Theme, useTheme } from '../theme';

interface CardProps {
  label?: string;
  children: ReactNode;
  style?: ViewStyle;
}

/** A Material-3 style surface container with an optional section label. */
export function Card({ label, children, style }: CardProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.card, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      // A hairline outline reads better than a shadow in dark mode, where
      // elevation shadows are effectively invisible.
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
    },
    label: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
  });
