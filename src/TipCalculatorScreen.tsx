import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmountField } from './components/AmountField';
import { Card } from './components/Card';
import { PeopleStepper } from './components/PeopleStepper';
import { ResultsPanel } from './components/ResultsPanel';
import { TipSelector, TIP_PRESETS } from './components/TipSelector';
import { calculateTip } from './lib/calc';
import { parseNumericInput, sanitizeNumericText } from './lib/format';
import { radius, spacing, Theme, useTheme } from './theme';

const MIN_PEOPLE = 1;
const MAX_PEOPLE = 999;
const DEFAULT_TIP = 15;

/** Either one of the preset chips, or whatever is typed in the custom field. */
type TipMode = { kind: 'preset'; value: number } | { kind: 'custom' };

export function TipCalculatorScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [billText, setBillText] = useState('');
  const [peopleText, setPeopleText] = useState(String(MIN_PEOPLE));
  const [tipMode, setTipMode] = useState<TipMode>({ kind: 'preset', value: DEFAULT_TIP });
  const [customTipText, setCustomTipText] = useState('');
  const [roundUpPerPerson, setRoundUpPerPerson] = useState(false);

  // The text fields are the source of truth; these are the numbers derived
  // from them on every render, which is what makes the results feel live.
  const people = clamp(Math.floor(parseNumericInput(peopleText)) || MIN_PEOPLE, MIN_PEOPLE, MAX_PEOPLE);
  const tipPercent =
    tipMode.kind === 'preset' ? tipMode.value : parseNumericInput(customTipText);

  const result = useMemo(
    () =>
      calculateTip({
        billAmount: parseNumericInput(billText),
        people,
        tipPercent,
        roundUpPerPerson,
      }),
    [billText, people, tipPercent, roundUpPerPerson],
  );

  const handleStepPeople = (delta: number) => {
    setPeopleText(String(clamp(people + delta, MIN_PEOPLE, MAX_PEOPLE)));
  };

  const handleChangePeople = (text: string) => {
    // Allow an empty field mid-edit so the user can clear it and retype;
    // `people` falls back to the minimum until they do.
    const digits = text.replace(/[^0-9]/g, '');
    if (digits === '') {
      setPeopleText('');
      return;
    }
    setPeopleText(String(clamp(Number.parseInt(digits, 10), MIN_PEOPLE, MAX_PEOPLE)));
  };

  const handleSelectPreset = (percent: number) => {
    setTipMode({ kind: 'preset', value: percent });
    setCustomTipText('');
  };

  const handleChangeCustomTip = (text: string) => {
    setCustomTipText(sanitizeNumericText(text, 1));
    setTipMode({ kind: 'custom' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Quick Tip</Text>
          <Text style={styles.subtitle}>Tip and split, instantly</Text>
        </View>

        {/* Results sit above the inputs so they stay visible with the keyboard open. */}
        <ResultsPanel
          result={result}
          people={people}
          requestedTipPercent={tipPercent}
          roundUpEnabled={roundUpPerPerson}
        />

        <Card label="Bill amount">
          <AmountField
            value={billText}
            onChangeText={(text) => setBillText(sanitizeNumericText(text))}
            placeholder="0.00"
            accessibilityLabel="Bill amount"
          />
        </Card>

        <Card label="People">
          <PeopleStepper
            value={peopleText}
            onChangeText={handleChangePeople}
            onStep={handleStepPeople}
            min={MIN_PEOPLE}
            max={MAX_PEOPLE}
            current={people}
          />
        </Card>

        <Card label="Tip">
          <TipSelector
            selectedPreset={tipMode.kind === 'preset' ? tipMode.value : null}
            onSelectPreset={handleSelectPreset}
            customText={customTipText}
            onChangeCustom={handleChangeCustomTip}
          />
        </Card>

        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Round up per person</Text>
            <Text style={styles.toggleHint}>
              Each share rounds up to the next whole unit.
            </Text>
          </View>
          <Switch
            value={roundUpPerPerson}
            onValueChange={setRoundUpPerPerson}
            accessibilityLabel="Round up each person's share"
            trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
            thumbColor={
              roundUpPerPerson
                ? theme.colors.onPrimary
                : theme.dark
                  ? theme.colors.surfaceContainerHigh
                  : '#FFFFFF'
            }
          />
        </View>

        <Text style={styles.footer}>Works entirely offline. Nothing leaves your device.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
    },
    header: {
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    title: {
      color: theme.colors.onSurface,
      fontSize: 34,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 15,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
    },
    toggleText: {
      flex: 1,
      gap: spacing.xs,
    },
    toggleLabel: {
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
    toggleHint: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 13,
      lineHeight: 18,
    },
    footer: {
      color: theme.colors.outline,
      fontSize: 12,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });
