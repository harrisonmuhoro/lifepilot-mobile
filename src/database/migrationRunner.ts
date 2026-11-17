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
 * Validates array of migrations for duplicates, invalid versions, or missing migration functions.
 */
const validateMigrations = (migrations: Migration[]): void => {
  const versionsSeen = new Set<number>();

  for (const m of migrations) {
    if (!m || typeof m.version !== 'number' || m.version <= 0) {
      throw new Error(
        `Invalid migration object detected: version must be a positive integer.`
      );
    }
    if (!m.name || typeof m.name !== 'string' || m.name.trim() === '') {
      throw new Error(`Migration v${m.version} is missing a valid name.`);
    }
    if (typeof m.up !== 'function') {
      throw new Error(
        `Migration v${m.version} (${m.name}) is missing an up function.`
      );
    }
    if (versionsSeen.has(m.version)) {
      throw new Error(
        `Duplicate migration version detected: v${m.version} (${m.name}).`
      );
    }
    versionsSeen.add(m.version);
  }
};

/**
 * Runs all pending migrations in ascending order with safeguards.
 * Each migration is executed inside an isolated transaction block.
 */
export const runMigrations = async (
  db: SQLiteDatabase,
  migrations: Migration[]
): Promise<number> => {
  validateMigrations(migrations);
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
