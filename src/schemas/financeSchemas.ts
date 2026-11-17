import { z } from 'zod';

export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer']);

export const transactionSchema = z.object({
  amount_minor: z
    .number({ invalid_type_error: 'Amount in minor units must be an integer' })
    .int('Amount in minor units must be an integer')
    .positive('Amount must be greater than zero'),
  type: transactionTypeEnum,
  category: z.string().min(1, 'Category is required'),
  description: z
    .string()
    .max(255, 'Description cannot exceed 255 characters')
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter ISO code')
    .default('KES'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Converts a major currency string or number (e.g. "1250.50" or 1250.5) to integer minor units (e.g. 125050)
 * without floating-point arithmetic errors.
 */
export const toMinorUnits = (majorAmount: number | string): number => {
  const str =
    typeof majorAmount === 'number'
      ? majorAmount.toFixed(2)
      : majorAmount.trim();
  const parts = str.split('.');
  const whole = parseInt(parts[0] || '0', 10);
  const rawFraction = (parts[1] || '00').padEnd(2, '0').slice(0, 2);
  const fraction = parseInt(rawFraction, 10);
  return whole * 100 + (whole >= 0 ? fraction : -fraction);
};

/**
 * Formats integer minor units (e.g. 125050) to display string (e.g. "KES 1,250.50").
 */
export const formatMinorUnits = (
  minorUnits: number,
  currency: string = 'KES'
): string => {
  const absUnits = Math.abs(minorUnits);
  const whole = Math.floor(absUnits / 100);
  const cents = (absUnits % 100).toString().padStart(2, '0');
  const formattedWhole = whole.toLocaleString('en-US');
  const sign = minorUnits < 0 ? '-' : '';
  return `${sign}${currency} ${formattedWhole}.${cents}`;
};
