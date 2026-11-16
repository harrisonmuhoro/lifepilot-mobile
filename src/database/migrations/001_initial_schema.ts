import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from '../../types/database';

export const migration001: Migration = {
  version: 1,
  name: 'initial_schema',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Sync Outbox Table for offline-first synchronization
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        client_timestamp TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sync_outbox_status
        ON sync_outbox(status, client_timestamp);

      CREATE INDEX IF NOT EXISTS idx_sync_outbox_entity
        ON sync_outbox(entity_type, entity_id);
    `);

    // 2. Sync Cursor Table for incremental synchronization tracking
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_cursor (
        entity_type TEXT PRIMARY KEY,
        last_cursor TEXT,
        last_sync_at TEXT NOT NULL
      );
    `);

    // 3. Foundation Planner Tasks Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    `);

    // 4. Foundation Finance Transactions Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL, -- 'income' | 'expense' | 'transfer'
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);
  },
  down: async (db: SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS sync_cursor;
      DROP TABLE IF EXISTS sync_outbox;
    `);
  },
};
