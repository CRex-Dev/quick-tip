import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatAmount, formatPercent } from '../lib/format';
import type { TipResult } from '../lib/calc';
import { radius, spacing, Theme, useTheme } from '../theme';

interface ResultsPanelProps {
  result: TipResult;
  people: number;
  /** The tip the user asked for, before any rounding adjustment. */
  requestedTipPercent: number;
  roundUpEnabled: boolean;
}

export function ResultsPanel({
  result,
  people,
  requestedTipPercent,
  roundUpEnabled,
}: ResultsPanelProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Only worth mentioning when rounding actually changed the numbers — an
  // exact split leaves nothing to round.
  const showRoundingNote = roundUpEnabled && result.roundingAdded > 0;

  return (
    <View
      style={styles.panel}
      accessible
      accessibilityLabel={
        `Each of ${people} ${people === 1 ? 'person' : 'people'} pays ` +
        `${formatAmount(result.perPerson)}. Tip ${formatAmount(result.tipAmount)}, ` +
        `total ${formatAmount(result.totalAmount)}.`
      }
    >
      <Text style={styles.heroLabel}>
        {people === 1 ? 'You pay' : `Each of ${people} pays`}
      </Text>
      <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
        {formatAmount(result.perPerson)}
      </Text>

      <View style={styles.divider} />

      <View style={styles.breakdown}>
        <Stat label="Tip" value={formatAmount(result.tipAmount)} theme={theme} />
        <Stat label="Total" value={formatAmount(result.totalAmount)} theme={theme} />
      </View>

      {showRoundingNote ? (
        <Text style={styles.note}>
          Rounded up — adds {formatAmount(result.roundingAdded)}, making the tip{' '}
          {formatPercent(result.effectiveTipPercent)} instead of{' '}
          {formatPercent(requestedTipPercent)}.
        </Text>
      ) : null}
    </View>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    panel: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: radius.lg,
      padding: spacing.xl,
      gap: spacing.xs,
    },
    heroLabel: {
      color: theme.colors.onPrimaryContainer,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.4,
      opacity: 0.8,
    },
    heroValue: {
      color: theme.colors.onPrimaryContainer,
      fontSize: 56,
      lineHeight: 64,
      fontWeight: '700',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.onPrimaryContainer,
      opacity: 0.25,
      marginVertical: spacing.md,
    },
    breakdown: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    stat: {
      flex: 1,
      gap: spacing.xs,
    },
    statLabel: {
      color: theme.colors.onPrimaryContainer,
      fontSize: 13,
      fontWeight: '600',
      opacity: 0.8,
    },
    statValue: {
      color: theme.colors.onPrimaryContainer,
      fontSize: 24,
      fontWeight: '600',
    },
    note: {
      color: theme.colors.onPrimaryContainer,
      fontSize: 13,
      lineHeight: 18,
      opacity: 0.85,
      marginTop: spacing.md,
    },
  });
