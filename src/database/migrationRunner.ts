import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration, SchemaMigrationRecord } from '../types/database';
import { logger } from '../utils/logger';

const TAG = 'MigrationRunner';

/**
 * Ensures the migration tracking table exists.
 */
const ensureMigrationTable = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
};

/**
 * Retrieves the list of currently applied migration versions.
 */
export const getAppliedMigrations = async (
  db: SQLiteDatabase
): Promise<SchemaMigrationRecord[]> => {
  await ensureMigrationTable(db);
  const rows = await db.getAllAsync<SchemaMigrationRecord>(
    'SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC;'
  );
  return rows;
};

/**
 * Runs all pending migrations in ascending order.
 * Each migration is executed inside a transaction.
 */
export const runMigrations = async (
  db: SQLiteDatabase,
  migrations: Migration[]
): Promise<number> => {
  await ensureMigrationTable(db);

  const applied = await getAppliedMigrations(db);
  const appliedVersions = new Set(applied.map((m) => m.version));

  const sortedMigrations = [...migrations].sort(
    (a, b) => a.version - b.version
  );
  let latestVersion =
    applied.length > 0 ? (applied[applied.length - 1]?.version ?? 0) : 0;

  for (const migration of sortedMigrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    logger.info(
      TAG,
      `Applying migration v${migration.version}: ${migration.name}`
    );

    // Run each migration inside its own transaction
    await db.execAsync('BEGIN TRANSACTION;');
    try {
      await migration.up(db);

      const timestamp = new Date().toISOString();
      await db.runAsync(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);',
        [migration.version, migration.name, timestamp]
      );

      await db.execAsync('COMMIT;');
      latestVersion = migration.version;
      logger.info(
        TAG,
        `Migration v${migration.version} (${migration.name}) applied successfully`
      );
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      logger.error(
        TAG,
        `Migration v${migration.version} (${migration.name}) failed and rolled back`,
        error
      );
      throw new Error(
        `Migration v${migration.version} (${migration.name}) failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return latestVersion;
};
