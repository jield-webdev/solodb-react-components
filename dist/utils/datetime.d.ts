/**
 * Date/Time formatting utilities
 * Replaces react-moment with native JavaScript formatting
 */
type DateInput = Date | string | number | null | undefined;
/**
 * Safely parse various date inputs to a Date object
 */
export declare function parseToDate(input: DateInput): Date | null;
/**
 * Format a date using a custom format string
 * Supports common patterns used in the codebase:
 * - DD: day with leading zero
 * - MM: month with leading zero
 * - YY: 2-digit year
 * - YYYY: 4-digit year
 * - HH: hours (24h) with leading zero
 * - mm: minutes with leading zero
 * - H: hours (24h) without leading zero
 * - m: minutes without leading zero
 */
export declare function formatDate(input: DateInput, format: string): string;
/**
 * Format a date and time
 * Common formats: "DD-MM-YY HH:mm", "DD-MM-YY H:m"
 */
export declare function formatDateTime(input: DateInput, format?: string): string;
export {};
