import { z } from 'zod';

export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer']);

export const transactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
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
    .default('USD'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
