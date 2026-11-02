import { MeasurementResultValue, Target } from '@jield/solodb-typescript-core';
/**
 * Returns the numeric value of a measurement result value, or null when it has no numeric representation.
 */
export declare const getMeasurementNumericValue: (value: MeasurementResultValue | undefined | null) => number | null;
/**
 * Checks whether a value lies outside of the target bounds. A null bound means that side is unbounded.
 */
export declare const isOutsideTarget: (target: Pick<Target, "min_value" | "max_value" | "inclusive">, value: number) => boolean;
