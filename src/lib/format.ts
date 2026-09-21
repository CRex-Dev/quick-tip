/**
 * Display formatting.
 *
 * Deliberately locale-independent: the app ships no currency setting and never
 * touches the network, so amounts are shown as plain numbers with grouped
 * thousands rather than guessing at a currency symbol.
 */

/** 1234.5 -> "1,234.50" */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '0.00';
  const fixed = Math.abs(value).toFixed(2);
  const [whole, decimals] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${value < 0 ? '-' : ''}${grouped}.${decimals}`;
}

/** 18 -> "18%", 18.75 -> "18.8%" */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

/**
 * Parses a user-typed amount. Accepts "12", "12.5", "12,50" and "" (-> 0),
 * and returns 0 for anything unparseable so the results never read "NaN".
 */
export function parseNumericInput(text: string): number {
  if (!text) return 0;
  const normalized = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Strips characters a numeric keypad can still produce (and that pasting can
 * introduce), keeping at most one decimal separator.
 */
export function sanitizeNumericText(text: string, maxDecimals = 2): string {
  const cleaned = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  const whole = cleaned.slice(0, firstDot);
  const decimals = cleaned.slice(firstDot + 1).replace(/\./g, '').slice(0, maxDecimals);
  return `${whole}.${decimals}`;
}
