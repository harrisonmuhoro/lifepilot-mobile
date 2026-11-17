import {
  runMigrations,
  getAppliedMigrations,
} from '../../src/database/migrationRunner';
import { migration001 } from '../../src/database/migrations/001_initial_schema';
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

  it('rolls back transaction if a migration fails and prevents recording failed version', async () => {
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

    expect(executedSql).toContain('ROLLBACK;');
    expect(appliedVersions).toHaveLength(0);
  });

  it('persists applied migration versions and reads them via getAppliedMigrations', async () => {
    appliedVersions.push({
      version: 1,
      name: 'initial_schema',
      applied_at: '2026-01-01T00:00:00.000Z',
    });

    const result = await getAppliedMigrations(mockDb);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      version: 1,
      name: 'initial_schema',
      applied_at: '2026-01-01T00:00:00.000Z',
    });
  });

  describe('Initial Schema (migration001)', () => {
    it('executes up migration with amount_minor INTEGER and KES default currency', async () => {
      await migration001.up(mockDb);

      const allExecutedSql = executedSql.join(' ');
      expect(allExecutedSql).toContain('amount_minor INTEGER NOT NULL');
      expect(allExecutedSql).toContain("currency TEXT DEFAULT 'KES'");
      expect(allExecutedSql).not.toContain('amount REAL');
      expect(allExecutedSql).not.toContain("currency TEXT DEFAULT 'USD'");
    });

    it('executes down migration cleanly', async () => {
      if (migration001.down) {
        await migration001.down(mockDb);
        const lastExecutedSql = executedSql[executedSql.length - 1];
        expect(lastExecutedSql).toContain('DROP TABLE IF EXISTS transactions;');
      }
    });
  });
});
