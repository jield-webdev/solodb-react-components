import { MeasurementResultValue, Target } from "@jield/solodb-typescript-core";

/**
 * Returns the numeric value of a measurement result value, or null when it has no numeric representation.
 */
export const getMeasurementNumericValue = (value: MeasurementResultValue | undefined | null): number | null => {
  if (!value) return null;

  const numeric = value.float_value ?? value.int_value ?? (value.string_value ? parseFloat(value.string_value) : NaN);
  return numeric === null || isNaN(numeric) ? null : numeric;
};

/**
 * Checks whether a value lies outside of the target bounds. A null bound means that side is unbounded.
 */
export const isOutsideTarget = (target: Pick<Target, "min_value" | "max_value" | "inclusive">, value: number) => {
  const { min_value, max_value, inclusive } = target;

  if (min_value !== null && (inclusive ? value < min_value : value <= min_value)) return true;
  if (max_value !== null && (inclusive ? value > max_value : value >= max_value)) return true;

  return false;
};
