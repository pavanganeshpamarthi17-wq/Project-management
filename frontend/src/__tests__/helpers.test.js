import { describe, it, expect } from 'vitest';
import { formatDate, timeAgo, isOverdue, getInitials } from '../utils/helpers';

describe('Helpers Unit Tests', () => {
  describe('formatDate', () => {
    it('should format a ISO date string correctly', () => {
      const formatted = formatDate('2026-06-07T12:00:00Z');
      expect(formatted).toBe('Jun 7, 2026');
    });

    it('should format a Date object correctly', () => {
      const date = new Date(2026, 11, 25); // December 25, 2026 local time
      const formatted = formatDate(date);
      expect(formatted).toBe('Dec 25, 2026');
    });

    it('should return a dash for null or undefined dates', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });

    it('should return a dash for invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('—');
    });
  });

  describe('timeAgo', () => {
    it('should return empty string for null or undefined input', () => {
      expect(timeAgo(null)).toBe('');
      expect(timeAgo(undefined)).toBe('');
    });

    it('should format valid date representation as time distance ago', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 3);
      const res = timeAgo(pastDate);
      expect(res).toContain('ago');
      expect(res).toContain('hour');
    });
  });

  describe('isOverdue', () => {
    it('should return false if no due date is provided', () => {
      expect(isOverdue(null)).toBe(false);
      expect(isOverdue(undefined)).toBe(false);
    });

    it('should return true for a past date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isOverdue(yesterday)).toBe(true);
    });

    it('should return false for a future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isOverdue(tomorrow)).toBe(false);
    });
  });

  describe('getInitials', () => {
    it('should return question mark if name is empty', () => {
      expect(getInitials('')).toBe('?');
      expect(getInitials(null)).toBe('?');
    });

    it('should return two initials for double barrel/normal names', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return single initial for one word name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should return only first two initials for multi-word names', () => {
      expect(getInitials('John Middle Doe')).toBe('JM');
    });
  });
});
