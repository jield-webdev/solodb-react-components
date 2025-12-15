import { describe, it, expect } from 'vitest';
import { parseToDate, formatDate, formatDateTime } from '@/utils/datetime';

describe('utils/datetime', () => {
  describe('parseToDate', () => {
    it('returns null for nullish input', () => {
      expect(parseToDate(null)).toBeNull();
      expect(parseToDate(undefined)).toBeNull();
    });

    it('parses Date objects and validates invalid dates', () => {
      const d = new Date('2024-01-02T03:04:00Z');
      expect(parseToDate(d)).toBe(d);
      // Invalid Date
      const invalid = new Date('not-a-date');
      expect(parseToDate(invalid)).toBeNull();
    });

    it('parses ISO strings and timestamps', () => {
      expect(parseToDate('2024-05-06T07:08:00Z')).not.toBeNull();
      expect(parseToDate(1714979280000)).not.toBeNull();
    });

    it('returns null for unparseable strings', () => {
      expect(parseToDate('not a date')).toBeNull();
    });
  });

  describe('formatDate', () => {
    // Normalize to ensure consistent values independent of timezone by using UTC parts
    // The util uses local time; to make deterministic, create a date with known local values.
    // Here, build a local date explicitly
    const localDate = new Date(2024, 11, 5, 9, 7, 0); // months are 0-based

    it('returns empty string for invalid input', () => {
      expect(formatDate('not-a-date', 'DD-MM-YY')).toBe('');
    });

    it('formats using supported tokens with zero padding', () => {
      expect(formatDate(localDate, 'DD-MM-YYYY HH:mm')).toBe('05-12-2024 09:07');
      expect(formatDate(localDate, 'DD-MM-YY H:m')).toBe('05-12-24 9:7');
    });

    it('replaces longer tokens before shorter ones', () => {
      // Ensure YYYY is not partially replaced by YY first
      expect(formatDate(localDate, 'YYYY YY')).toBe('2024 24');
    });
  });

  describe('formatDateTime', () => {
    it('uses default format when not provided', () => {
      const d = new Date(2024, 0, 2, 3, 4, 0);
      expect(formatDateTime(d)).toBe('02-01-24 03:04');
    });

    it('passes custom format through to formatDate', () => {
      const d = new Date(2024, 6, 15, 16, 9, 0);
      expect(formatDateTime(d, 'DD/MM/YYYY HH:mm')).toBe('15/07/2024 16:09');
    });
  });
});
