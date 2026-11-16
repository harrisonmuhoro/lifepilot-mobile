import * as SQLite from 'expo-sqlite';
import { Config } from '../constants/config';
import { logger } from '../utils/logger';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const TAG = 'Database';

/**
 * Returns a singleton instance of the local SQLite database.
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    logger.info(TAG, `Opening database: ${Config.dbName}`);
    dbInstance = await SQLite.openDatabaseAsync(Config.dbName);

    // Enable WAL (Write-Ahead Logging) and Foreign Keys for integrity & concurrency
    await dbInstance.execAsync('PRAGMA journal_mode = WAL;');
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');

    logger.info(
      TAG,
      'Database opened successfully with WAL and Foreign Keys enabled'
    );
    return dbInstance;
  } catch (error) {
    logger.error(TAG, 'Failed to open database', error);
    throw error;
  }
};

/**
 * Executes a callback within a safe SQLite transaction.
 * Automatically rolls back on error and commits on success.
 */
export const withTransaction = async <T>(
  db: SQLite.SQLiteDatabase,
  action: () => Promise<T>
): Promise<T> => {
  await db.execAsync('BEGIN TRANSACTION;');
  try {
    const result = await action();
    await db.execAsync('COMMIT;');
    return result;
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    logger.error(TAG, 'Transaction failed and rolled back', error);
    throw error;
  }
};

/**
 * Closes the database connection.
 */
export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    logger.info(TAG, 'Closing database instance');
    await dbInstance.closeAsync();
    dbInstance = null;
  }
};
