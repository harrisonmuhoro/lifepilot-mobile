import {
  transactionSchema,
  toMinorUnits,
  formatMinorUnits,
} from '../../src/schemas/financeSchemas';

describe('Finance Schemas & Monetary Utilities', () => {
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
  });

  describe('toMinorUnits', () => {
    it('converts major currency numbers to integer minor units precisely', () => {
      expect(toMinorUnits(1250.5)).toBe(125050);
      expect(toMinorUnits('1250.50')).toBe(125050);
      expect(toMinorUnits('0.99')).toBe(99);
      expect(toMinorUnits(10)).toBe(1000);
      expect(toMinorUnits('100.5')).toBe(10050);
    });
  });

  describe('formatMinorUnits', () => {
    it('formats minor units to readable currency string', () => {
      expect(formatMinorUnits(125050, 'KES')).toBe('KES 1,250.50');
      expect(formatMinorUnits(0, 'KES')).toBe('KES 0.00');
      expect(formatMinorUnits(99, 'KES')).toBe('KES 0.99');
      expect(formatMinorUnits(-5000, 'KES')).toBe('-KES 50.00');
    });
  });
});
