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
 * Strictly validates inputs against NaN, Infinity, malformed strings, excess decimals, and integer bounds.
 */
export const toMinorUnits = (majorAmount: number | string): number => {
  if (
    majorAmount === null ||
    majorAmount === undefined ||
    majorAmount === ''
  ) {
    throw new Error('Monetary amount cannot be empty');
  }

  let numValue: number;
  let strValue: string;

  if (typeof majorAmount === 'number') {
    numValue = majorAmount;
    if (Number.isNaN(numValue)) {
      throw new Error('Invalid monetary amount format');
    }
    if (!Number.isFinite(numValue)) {
      throw new Error('Amount must be a finite number');
    }
    strValue = majorAmount.toString();
  } else {
    strValue = majorAmount.trim();
    if (strValue === '') {
      throw new Error('Monetary amount cannot be empty');
    }
    numValue = Number(strValue);
    if (Number.isNaN(numValue)) {
      throw new Error('Invalid monetary amount format');
    }
    if (!Number.isFinite(numValue)) {
      throw new Error('Amount must be a finite number');
    }
  }

  // Check for excess decimal places beyond 2 decimal digits
  const parts = strValue.split('.');
  if (parts.length > 2) {
    throw new Error('Invalid monetary amount format');
  }
  if (parts[1] && parts[1].length > 2) {
    throw new Error('Monetary amount cannot have more than 2 decimal places');
  }

  const isNegative = strValue.startsWith('-');
  const cleanStr = isNegative ? strValue.slice(1) : strValue;
  const cleanParts = cleanStr.split('.');
  const whole = parseInt(cleanParts[0] || '0', 10);
  const centsStr = (cleanParts[1] || '00').padEnd(2, '0').slice(0, 2);
  const cents = parseInt(centsStr, 10);

  const minorUnits = whole * 100 + cents;
  const result = isNegative ? -minorUnits : minorUnits;

  if (!Number.isSafeInteger(result)) {
    throw new Error('Amount exceeds maximum safe numeric bound');
  }

  return result;
};

/**
 * Formats integer minor units (e.g. 125050) to display string (e.g. "KES 1,250.50").
 */
export const formatMinorUnits = (
  minorUnits: number,
  currency: string = 'KES'
): string => {
  if (
    typeof minorUnits !== 'number' ||
    Number.isNaN(minorUnits) ||
    !Number.isFinite(minorUnits)
  ) {
    return `${currency} 0.00`;
  }

  const absUnits = Math.abs(Math.round(minorUnits));
  const whole = Math.floor(absUnits / 100);
  const cents = (absUnits % 100).toString().padStart(2, '0');
  const formattedWhole = whole.toLocaleString('en-US');
  const sign = minorUnits < 0 ? '-' : '';
  return `${sign}${currency} ${formattedWhole}.${cents}`;
};
