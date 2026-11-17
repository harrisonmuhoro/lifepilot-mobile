import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from '../../types/database';

export const migration002: Migration = {
  version: 2,
  name: 'convert_transaction_amounts_to_minor_units',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // Rebuild transactions table to safely migrate amount REAL to amount_minor INTEGER
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions_new (
        id TEXT PRIMARY KEY,
        amount_minor INTEGER NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        currency TEXT DEFAULT 'KES',
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      INSERT INTO transactions_new (
        id,
        amount_minor,
        type,
        category,
        description,
        date,
        currency,
        synced,
        created_at,
        updated_at,
        deleted_at
      )
      SELECT
        id,
        CAST(ROUND(amount * 100) AS INTEGER),
        type,
        category,
        description,
        date,
        CASE WHEN currency = 'USD' OR currency IS NULL THEN 'KES' ELSE currency END,
        synced,
        created_at,
        updated_at,
        deleted_at
      FROM transactions;

      DROP TABLE transactions;

      ALTER TABLE transactions_new RENAME TO transactions;

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);
  },
  down: async (db: SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions_old (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      INSERT INTO transactions_old (
        id,
        amount,
        type,
        category,
        description,
        date,
        currency,
        synced,
        created_at,
        updated_at,
        deleted_at
      )
      SELECT
        id,
        CAST(amount_minor AS REAL) / 100.0,
        type,
        category,
        description,
        date,
        currency,
        synced,
        created_at,
        updated_at,
        deleted_at
      FROM transactions;

      DROP TABLE transactions;

      ALTER TABLE transactions_old RENAME TO transactions;

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);
  },
};
