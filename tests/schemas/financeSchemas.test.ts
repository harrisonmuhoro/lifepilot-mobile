import {
  transactionSchema,
  toMinorUnits,
  formatMinorUnits,
} from '../../src/schemas/financeSchemas';

describe('Finance Schemas & Monetary Input Validation', () => {
  describe('transactionSchema validation', () => {
    it('validates a correct transaction with integer minor units and KES currency', () => {
      const result = transactionSchema.safeParse({
        amount_minor: 125050,
        type: 'expense',
        category: 'Groceries',
        date: '2026-11-17',
        currency: 'KES',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount_minor).toBe(125050);
        expect(result.data.currency).toBe('KES');
      }
    });

    it('rejects floating-point non-integer minor unit amounts', () => {
      const result = transactionSchema.safeParse({
        amount_minor: 1250.5,
        type: 'expense',
        category: 'Groceries',
        date: '2026-11-17',
      });

      expect(result.success).toBe(false);
    });

    it('rejects zero amount_minor', () => {
      const result = transactionSchema.safeParse({
        amount_minor: 0,
        type: 'expense',
        category: 'Groceries',
        date: '2026-11-17',
      });

      expect(result.success).toBe(false);
    });

    it('rejects negative amount_minor (schema requires positive)', () => {
      const result = transactionSchema.safeParse({
        amount_minor: -100,
        type: 'expense',
        category: 'Groceries',
        date: '2026-11-17',
      });

      expect(result.success).toBe(false);
    });

    it('rejects invalid transaction type strings', () => {
      const result = transactionSchema.safeParse({
        amount_minor: 1000,
        type: 'purchase',
        category: 'Groceries',
        date: '2026-11-17',
      });

      expect(result.success).toBe(false);
    });

    it('rejects malformed date format', () => {
      const result = transactionSchema.safeParse({
        amount_minor: 1000,
        type: 'expense',
        category: 'Groceries',
        date: '17-11-2026', // wrong format
      });

      expect(result.success).toBe(false);
    });

    it('rejects empty category', () => {
      const result = transactionSchema.safeParse({
        amount_minor: 1000,
        type: 'expense',
        category: '',
        date: '2026-11-17',
      });

      expect(result.success).toBe(false);
    });

    it('rejects currency codes that are not 3 letters', () => {
      const result = transactionSchema.safeParse({
        amount_minor: 1000,
        type: 'expense',
        category: 'Food',
        date: '2026-11-17',
        currency: 'US', // too short
      });

      expect(result.success).toBe(false);
    });

    it('defaults currency to KES if unspecified', () => {
      const result = transactionSchema.safeParse({
        amount_minor: 5000,
        type: 'income',
        category: 'Salary',
        date: '2026-11-17',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('KES');
      }
    });

    it('accepts all valid transaction types', () => {
      const types = ['income', 'expense', 'transfer'] as const;
      for (const type of types) {
        const result = transactionSchema.safeParse({
          amount_minor: 1000,
          type,
          category: 'Test',
          date: '2026-11-17',
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('toMinorUnits — conversion accuracy', () => {
    it('converts 1250.50 to 125050 without floating-point error', () => {
      expect(toMinorUnits(1250.5)).toBe(125050);
      expect(toMinorUnits('1250.50')).toBe(125050);
    });

    it('converts 0.99 to 99', () => {
      expect(toMinorUnits('0.99')).toBe(99);
    });

    it('converts 100.5 to 10050', () => {
      expect(toMinorUnits('100.5')).toBe(10050);
    });

    it('converts whole number 10 to 1000', () => {
      expect(toMinorUnits(10)).toBe(1000);
    });

    it('converts "500.00" to 50000', () => {
      expect(toMinorUnits('500.00')).toBe(50000);
    });

    it('converts string with trailing zero cent "0.10" to 10', () => {
      expect(toMinorUnits('0.10')).toBe(10);
    });
  });

  describe('toMinorUnits — negative value handling', () => {
    it('converts negative string amounts preserving sign', () => {
      expect(toMinorUnits('-10.50')).toBe(-1050);
    });

    it('converts negative numeric amounts preserving sign', () => {
      expect(toMinorUnits(-12.5)).toBe(-1250);
    });

    it('converts negative zero-cent amounts correctly', () => {
      expect(toMinorUnits('-5.00')).toBe(-500);
    });
  });

  describe('toMinorUnits — input rejection', () => {
    it('rejects empty string', () => {
      expect(() => toMinorUnits('')).toThrow('Monetary amount cannot be empty');
    });

    it('rejects whitespace-only string', () => {
      expect(() => toMinorUnits('   ')).toThrow(
        'Monetary amount cannot be empty'
      );
    });

    it('rejects alphabetic invalid string "invalid"', () => {
      expect(() => toMinorUnits('invalid')).toThrow(
        'Invalid monetary amount format'
      );
    });

    it('rejects malformed string with multiple decimal points "12.34.56"', () => {
      expect(() => toMinorUnits('12.34.56')).toThrow(
        'Invalid monetary amount format'
      );
    });

    it('rejects NaN numeric input', () => {
      expect(() => toMinorUnits(NaN)).toThrow('Invalid monetary amount format');
    });

    it('rejects positive Infinity', () => {
      expect(() => toMinorUnits(Infinity)).toThrow(
        'Amount must be a finite number'
      );
    });

    it('rejects negative Infinity', () => {
      expect(() => toMinorUnits(-Infinity)).toThrow(
        'Amount must be a finite number'
      );
    });

    it('rejects amounts with 3 decimal places (excess precision)', () => {
      expect(() => toMinorUnits('10.123')).toThrow(
        'Monetary amount cannot have more than 2 decimal places'
      );
    });

    it('rejects amounts with more than 2 decimal places "1250.505"', () => {
      expect(() => toMinorUnits('1250.505')).toThrow(
        'Monetary amount cannot have more than 2 decimal places'
      );
    });

    it('rejects amounts exceeding Number.MAX_SAFE_INTEGER bounds', () => {
      // 9007199254740992 * 100 would overflow safe integer
      expect(() => toMinorUnits('9007199254740992.00')).toThrow(
        'Amount exceeds maximum safe numeric bound'
      );
    });

    it('rejects string "NaN"', () => {
      // Number('NaN') === NaN
      expect(() => toMinorUnits('NaN')).toThrow(
        'Invalid monetary amount format'
      );
    });

    it('rejects string "Infinity"', () => {
      // Number('Infinity') === Infinity
      expect(() => toMinorUnits('Infinity')).toThrow(
        'Amount must be a finite number'
      );
    });
  });

  describe('formatMinorUnits — display formatting', () => {
    it('formats 125050 KES to "KES 1,250.50"', () => {
      expect(formatMinorUnits(125050, 'KES')).toBe('KES 1,250.50');
    });

    it('formats 0 to "KES 0.00"', () => {
      expect(formatMinorUnits(0, 'KES')).toBe('KES 0.00');
    });

    it('formats 99 to "KES 0.99"', () => {
      expect(formatMinorUnits(99, 'KES')).toBe('KES 0.99');
    });

    it('formats 50000 to "KES 500.00"', () => {
      expect(formatMinorUnits(50000, 'KES')).toBe('KES 500.00');
    });

    it('formats negative -1250 to "-KES 12.50"', () => {
      expect(formatMinorUnits(-1250, 'KES')).toBe('-KES 12.50');
    });

    it('formats negative -5000 to "-KES 50.00"', () => {
      expect(formatMinorUnits(-5000, 'KES')).toBe('-KES 50.00');
    });

    it('formats large values with comma thousand separators', () => {
      expect(formatMinorUnits(125050000, 'KES')).toBe('KES 1,250,500.00');
    });

    it('handles NaN input gracefully returning zero display', () => {
      expect(formatMinorUnits(NaN, 'KES')).toBe('KES 0.00');
    });

    it('handles Infinity gracefully returning zero display', () => {
      expect(formatMinorUnits(Infinity, 'KES')).toBe('KES 0.00');
    });

    it('defaults currency to KES when not provided', () => {
      expect(formatMinorUnits(10000)).toBe('KES 100.00');
    });
  });
});
