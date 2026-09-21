/**
 * Tip maths. Pure functions, no React — everything the app displays comes
 * from `calculateTip`.
 *
 * All arithmetic runs on integer cents. Money in binary floating point drifts
 * (0.1 + 0.2 !== 0.3), and a tip calculator that shows 12.999999 looks broken.
 */

export interface TipInput {
  /** Bill before tip, in whole currency units. */
  billAmount: number;
  /** Number of people splitting. Values below 1 are clamped to 1. */
  people: number;
  /** Tip as a percentage, e.g. 18 for 18%. */
  tipPercent: number;
  /** Round each person's share up to the next whole currency unit. */
  roundUpPerPerson: boolean;
}

export interface TipResult {
  tipAmount: number;
  totalAmount: number;
  perPerson: number;
  /**
   * The tip percentage actually being paid. Equal to the requested percentage
   * unless rounding up pushed it higher.
   */
  effectiveTipPercent: number;
  /** Extra amount added by rounding up, across the whole table. 0 when off. */
  roundingAdded: number;
}

/** Coerces user input (possibly NaN, Infinity or negative) to a usable number. */
function sanitize(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

// Guard rails so a pasted 40-digit number can't produce Infinity downstream.
const MAX_BILL = 99_999_999;
const MAX_TIP_PERCENT = 1000;
const MAX_PEOPLE = 999;

export function calculateTip(input: TipInput): TipResult {
  const billCents = Math.round(sanitize(input.billAmount, 0, MAX_BILL) * 100);
  const people = Math.floor(sanitize(input.people, 1, MAX_PEOPLE));
  const tipPercent = sanitize(input.tipPercent, 0, MAX_TIP_PERCENT);

  let tipCents = Math.round((billCents * tipPercent) / 100);
  let totalCents = billCents + tipCents;
  let perPersonCents = totalCents / people;
  let roundingAddedCents = 0;

  if (input.roundUpPerPerson) {
    // Round the individual share up to the next whole unit, then work
    // backwards: the table pays more, so the tip absorbs the difference.
    perPersonCents = Math.ceil(totalCents / people / 100) * 100;
    const roundedTotalCents = perPersonCents * people;
    roundingAddedCents = roundedTotalCents - totalCents;
    totalCents = roundedTotalCents;
    tipCents = totalCents - billCents;
  }

  return {
    tipAmount: tipCents / 100,
    totalAmount: totalCents / 100,
    perPerson: perPersonCents / 100,
    effectiveTipPercent: billCents > 0 ? (tipCents / billCents) * 100 : 0,
    roundingAdded: roundingAddedCents / 100,
  };
}
