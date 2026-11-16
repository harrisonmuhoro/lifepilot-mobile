import { runMigrations } from '../../src/database/migrationRunner';
import { Migration } from '../../src/types/database';
import type { SQLiteDatabase } from 'expo-sqlite';

interface AppliedVersionRecord {
  version: number;
  name: string;
  applied_at: string;
}

describe('Database Migration Runner', () => {
  let executedSql: string[] = [];
  let appliedVersions: AppliedVersionRecord[] = [];

  const mockDb = {
    execAsync: jest.fn(async (sql: string) => {
      executedSql.push(sql);
    }),
    getAllAsync: jest.fn(async () => {
      return [...appliedVersions];
    }),
    runAsync: jest.fn(
      async (_sql: string, params: [number, string, string]) => {
        appliedVersions.push({
          version: params[0],
          name: params[1],
          applied_at: params[2],
        });
      }
    ),
  } as unknown as SQLiteDatabase;

  beforeEach(() => {
    executedSql = [];
    appliedVersions = [];
    jest.clearAllMocks();
  });

  it('applies unapplied migrations in ascending sequential order', async () => {
    const migration1: Migration = {
      version: 1,
      name: 'create_test_table',
      up: jest.fn(async (db: SQLiteDatabase) => {
        await db.execAsync('CREATE TABLE test (id TEXT PRIMARY KEY);');
      }),
    };

    const migration2: Migration = {
      version: 2,
      name: 'add_name_column',
      up: jest.fn(async (db: SQLiteDatabase) => {
        await db.execAsync('ALTER TABLE test ADD COLUMN name TEXT;');
      }),
    };

    const latestVersion = await runMigrations(mockDb, [migration2, migration1]);

    expect(latestVersion).toBe(2);
    expect(migration1.up).toHaveBeenCalled();
    expect(migration2.up).toHaveBeenCalled();
    expect(appliedVersions).toHaveLength(2);
    expect(appliedVersions[0]?.version).toBe(1);
    expect(appliedVersions[1]?.version).toBe(2);
  });

  it('skips already applied migrations', async () => {
    appliedVersions.push({
      version: 1,
      name: 'already_applied',
      applied_at: new Date().toISOString(),
    });

    const migration1: Migration = {
      version: 1,
      name: 'already_applied',
      up: jest.fn(),
    };

    const migration2: Migration = {
      version: 2,
      name: 'new_migration',
      up: jest.fn(),
    };

    const latestVersion = await runMigrations(mockDb, [migration1, migration2]);

    expect(latestVersion).toBe(2);
    expect(migration1.up).not.toHaveBeenCalled();
    expect(migration2.up).toHaveBeenCalled();
  });

  it('rolls back transaction if a migration fails', async () => {
    const failingMigration: Migration = {
      version: 1,
      name: 'failing_migration',
      up: jest.fn(async () => {
        throw new Error('Disk full error');
      }),
    };

    await expect(runMigrations(mockDb, [failingMigration])).rejects.toThrow(
      'Disk full error'
    );

    // Ensure ROLLBACK was issued
    expect(executedSql).toContain('ROLLBACK;');
  });
});
