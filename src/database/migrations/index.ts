import { Migration } from '../../types/database';
import { migration001 } from './001_initial_schema';

/**
 * List of all database migrations in sequential order.
 * When creating a new migration:
 * 1. Create a new file (e.g. 002_add_budgets.ts)
 * 2. Export a Migration object with incremented version number
 * 3. Append to this array
 */
export const migrations: Migration[] = [migration001];
