import { Migration } from '../../types/database';
import { migration001 } from './001_initial_schema';
import { migration002 } from './002_convert_transaction_amounts_to_minor_units';

/**
 * List of all database migrations in sequential order.
 * Historical migrations are immutable once released.
 */
export const migrations: Migration[] = [migration001, migration002];
