import { useState, useEffect, useCallback } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '../database/sqlite';
import { runMigrations } from '../database/migrationRunner';
import { migrations } from '../database/migrations';
import { DatabaseState } from '../types/database';
import { logger } from '../utils/logger';

const TAG = 'useDatabase';

export const useDatabase = (): DatabaseState & {
  db: SQLiteDatabase | null;
  refresh: () => Promise<void>;
} => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [state, setState] = useState<DatabaseState>({
    isInitialized: false,
    isLoading: true,
    currentVersion: 0,
    error: null,
  });

  const init = useCallback(async () => {
    try {
      logger.info(TAG, 'Initializing database and running migrations...');
      const database = await getDatabase();
      const version = await runMigrations(database, migrations);

      setDb(database);
      setState({
        isInitialized: true,
        isLoading: false,
        currentVersion: version,
        error: null,
      });
      logger.info(TAG, `Database ready. Active schema version: ${version}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(TAG, 'Database initialization failed', error);
      setState({
        isInitialized: false,
        isLoading: false,
        currentVersion: 0,
        error,
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const database = await getDatabase();
        const version = await runMigrations(database, migrations);
        if (isMounted) {
          setDb(database);
          setState({
            isInitialized: true,
            isLoading: false,
            currentVersion: version,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setState({
            isInitialized: false,
            isLoading: false,
            currentVersion: 0,
            error,
          });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...state,
    db,
    refresh: init,
  };
};
