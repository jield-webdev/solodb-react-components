/**
 * Date/Time formatting utilities
 * Replaces react-moment with native JavaScript formatting
 */

type DateInput = Date | string | number | null | undefined;

/**
 * Safely parse various date inputs to a Date object
 */
export function parseToDate(input: DateInput): Date | null {
  if (!input) return null;

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
}

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
export function formatDate(input: DateInput, format: string): string {
  const date = parseToDate(input);
  if (!date) return '';

  const pad = (num: number) => num.toString().padStart(2, '0');

  const tokens: Record<string, string> = {
    'YYYY': date.getFullYear().toString(),
    'YY': date.getFullYear().toString().slice(-2),
    'MM': pad(date.getMonth() + 1),
    'DD': pad(date.getDate()),
    'HH': pad(date.getHours()),
    'mm': pad(date.getMinutes()),
    'H': date.getHours().toString(),
    'm': date.getMinutes().toString(),
  };

  let result = format;
  // Sort by length descending to replace longer tokens first
  Object.keys(tokens).sort((a, b) => b.length - a.length).forEach(token => {
    result = result.replace(new RegExp(token, 'g'), tokens[token]);
  });

  return result;
}

/**
 * Format a date and time
 * Common formats: "DD-MM-YY HH:mm", "DD-MM-YY H:m"
 */
export function formatDateTime(input: DateInput, format: string = "DD-MM-YY HH:mm"): string {
  return formatDate(input, format);
}
