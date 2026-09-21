import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateTip } from './calc.ts';
import { formatAmount, formatPercent, parseNumericInput, sanitizeNumericText } from './format.ts';

const base = { billAmount: 100, people: 1, tipPercent: 15, roundUpPerPerson: false };

test('computes tip, total and per-person share', () => {
  const r = calculateTip({ ...base, billAmount: 80, people: 4, tipPercent: 20 });
  assert.equal(r.tipAmount, 16);
  assert.equal(r.totalAmount, 96);
  assert.equal(r.perPerson, 24);
  assert.equal(r.effectiveTipPercent, 20);
  assert.equal(r.roundingAdded, 0);
});

test('avoids floating point drift on awkward amounts', () => {
  const r = calculateTip({ ...base, billAmount: 0.1 + 0.2, tipPercent: 10 });
  assert.equal(r.totalAmount, 0.33);
});

test('rounds each share up and charges the difference as extra tip', () => {
  // 100 + 18% = 118, split 7 ways = 16.857... -> 17 each -> 119 total.
  const r = calculateTip({ ...base, billAmount: 100, people: 7, tipPercent: 18, roundUpPerPerson: true });
  assert.equal(r.perPerson, 17);
  assert.equal(r.totalAmount, 119);
  assert.equal(r.tipAmount, 19);
  assert.equal(r.roundingAdded, 1);
  assert.equal(r.effectiveTipPercent, 19);
});

test('rounding up is a no-op when the split is already whole', () => {
  const r = calculateTip({ ...base, billAmount: 80, people: 4, tipPercent: 20, roundUpPerPerson: true });
  assert.equal(r.perPerson, 24);
  assert.equal(r.roundingAdded, 0);
});

test('clamps people to at least one', () => {
  const r = calculateTip({ ...base, billAmount: 50, people: 0, tipPercent: 10 });
  assert.equal(r.perPerson, 55);
});

test('handles an empty bill without producing NaN', () => {
  const r = calculateTip({ ...base, billAmount: Number.NaN, tipPercent: 20, roundUpPerPerson: true });
  assert.equal(r.tipAmount, 0);
  assert.equal(r.totalAmount, 0);
  assert.equal(r.perPerson, 0);
  assert.equal(r.effectiveTipPercent, 0);
});

test('a zero tip leaves the bill untouched', () => {
  const r = calculateTip({ ...base, billAmount: 42.5, tipPercent: 0 });
  assert.equal(r.tipAmount, 0);
  assert.equal(r.totalAmount, 42.5);
});

test('formats amounts with grouped thousands', () => {
  assert.equal(formatAmount(1234.5), '1,234.50');
  assert.equal(formatAmount(0), '0.00');
  assert.equal(formatAmount(1234567.891), '1,234,567.89');
});

test('formats percentages without trailing zeros', () => {
  assert.equal(formatPercent(18), '18%');
  assert.equal(formatPercent(18.75), '18.8%');
});

test('parses partial and comma-decimal input', () => {
  assert.equal(parseNumericInput(''), 0);
  assert.equal(parseNumericInput('12,50'), 12.5);
  assert.equal(parseNumericInput('abc'), 0);
});

test('keeps at most one decimal separator while typing', () => {
  assert.equal(sanitizeNumericText('12.3.4'), '12.34');
  assert.equal(sanitizeNumericText('12.999'), '12.99');
  assert.equal(sanitizeNumericText('18.75', 1), '18.7');
});
