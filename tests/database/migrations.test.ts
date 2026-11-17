import {
  runMigrations,
  getAppliedMigrations,
} from '../../src/database/migrationRunner';
import { migration001 } from '../../src/database/migrations/001_initial_schema';
import { migration002 } from '../../src/database/migrations/002_convert_transaction_amounts_to_minor_units';
import { Migration } from '../../src/types/database';
import type { SQLiteDatabase } from 'expo-sqlite';

interface AppliedVersionRecord {
  version: number;
  name: string;
  applied_at: string;
}

describe('Database Migration Runner & Compatibility Tests', () => {
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
    const m1: Migration = {
      version: 1,
      name: 'initial_schema',
      up: jest.fn(async (db: SQLiteDatabase) => {
        await db.execAsync('CREATE TABLE test (id TEXT PRIMARY KEY);');
      }),
    };

    const m2: Migration = {
      version: 2,
      name: 'second_migration',
      up: jest.fn(async (db: SQLiteDatabase) => {
        await db.execAsync('ALTER TABLE test ADD COLUMN name TEXT;');
      }),
    };

    const latestVersion = await runMigrations(mockDb, [m2, m1]);

    expect(latestVersion).toBe(2);
    expect(m1.up).toHaveBeenCalled();
    expect(m2.up).toHaveBeenCalled();
    expect(appliedVersions).toHaveLength(2);
    expect(appliedVersions[0]?.version).toBe(1);
    expect(appliedVersions[1]?.version).toBe(2);
  });

  it('skips already applied migrations without re-running them', async () => {
    appliedVersions.push({
      version: 1,
      name: 'initial_schema',
      applied_at: new Date().toISOString(),
    });

    const m1: Migration = {
      version: 1,
      name: 'initial_schema',
      up: jest.fn(),
    };

    const m2: Migration = {
      version: 2,
      name: 'second_migration',
      up: jest.fn(),
    };

    const latestVersion = await runMigrations(mockDb, [m1, m2]);

    expect(latestVersion).toBe(2);
    expect(m1.up).not.toHaveBeenCalled();
    expect(m2.up).toHaveBeenCalled();
    expect(appliedVersions).toHaveLength(2);
    expect(appliedVersions[1]?.version).toBe(2);
  });

  it('rejects duplicate migration versions with a clear safeguard error', async () => {
    const m1: Migration = { version: 1, name: 'first', up: jest.fn() };
    const m2: Migration = { version: 1, name: 'duplicate', up: jest.fn() };

    await expect(runMigrations(mockDb, [m1, m2])).rejects.toThrow(
      'Duplicate migration version detected'
    );
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
    // Version must NOT be recorded when migration fails
    expect(appliedVersions).toHaveLength(0);
  });

  it('issues BEGIN TRANSACTION and COMMIT wrapping each successful migration', async () => {
    const m1: Migration = {
      version: 1,
      name: 'simple',
      up: jest.fn(async (db) => {
        await db.execAsync('CREATE TABLE t (id TEXT);');
      }),
    };

    await runMigrations(mockDb, [m1]);

    expect(executedSql).toContain('BEGIN TRANSACTION;');
    expect(executedSql).toContain('COMMIT;');
    expect(executedSql).not.toContain('ROLLBACK;');
  });

  it('issues ROLLBACK and NOT COMMIT when migration throws', async () => {
    const m1: Migration = {
      version: 1,
      name: 'failing',
      up: jest.fn(async () => {
        throw new Error('failure');
      }),
    };

    await expect(runMigrations(mockDb, [m1])).rejects.toThrow();

    expect(executedSql).toContain('ROLLBACK;');
    expect(executedSql).not.toContain('COMMIT;');
  });

  it('allows retry after a failed migration — reruns the failed migration on next call', async () => {
    let callCount = 0;
    const retryableMigration: Migration = {
      version: 1,
      name: 'retryable',
      up: jest.fn(async () => {
        callCount++;
        if (callCount === 1) throw new Error('Transient failure');
        // Second call succeeds
      }),
    };

    // First attempt fails
    await expect(runMigrations(mockDb, [retryableMigration])).rejects.toThrow(
      'Transient failure'
    );
    expect(appliedVersions).toHaveLength(0);

    // Second attempt should succeed (migration not recorded, so it runs again)
    await runMigrations(mockDb, [retryableMigration]);
    expect(appliedVersions).toHaveLength(1);
    expect(appliedVersions[0]?.version).toBe(1);
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

  it('rejects a migration with version 0 or negative version', async () => {
    const invalid: Migration = { version: 0, name: 'bad', up: jest.fn() };
    await expect(runMigrations(mockDb, [invalid])).rejects.toThrow(
      'version must be a positive integer'
    );
  });

  it('rejects a migration with a missing name', async () => {
    const invalid: Migration = { version: 1, name: '', up: jest.fn() };
    await expect(runMigrations(mockDb, [invalid])).rejects.toThrow(
      'missing a valid name'
    );
  });

  it('rejects a migration missing an up function', async () => {
    const invalid = { version: 1, name: 'no_up' } as unknown as Migration;
    await expect(runMigrations(mockDb, [invalid])).rejects.toThrow(
      'missing an up function'
    );
  });

  describe('Migration 001 — Historical Initial Schema (Immutable)', () => {
    it('creates transactions table with REAL amount column and USD default currency', async () => {
      await migration001.up(mockDb);

      const allSql = executedSql.join('\n');
      expect(allSql).toContain('amount REAL NOT NULL');
      expect(allSql).toContain("currency TEXT DEFAULT 'USD'");
    });

    it('creates sync_outbox table with correct columns', async () => {
      await migration001.up(mockDb);

      const allSql = executedSql.join('\n');
      expect(allSql).toContain('CREATE TABLE IF NOT EXISTS sync_outbox');
      expect(allSql).toContain('entity_type TEXT NOT NULL');
      expect(allSql).toContain('attempts INTEGER DEFAULT 0');
    });

    it('creates tasks table with correct columns', async () => {
      await migration001.up(mockDb);

      const allSql = executedSql.join('\n');
      expect(allSql).toContain('CREATE TABLE IF NOT EXISTS tasks');
      expect(allSql).toContain('title TEXT NOT NULL');
    });

    it('down migration drops all tables created in migration 001', async () => {
      if (migration001.down) {
        await migration001.down(mockDb);
        const allSql = executedSql.join('\n');
        expect(allSql).toContain('DROP TABLE IF EXISTS transactions');
        expect(allSql).toContain('DROP TABLE IF EXISTS tasks');
        expect(allSql).toContain('DROP TABLE IF EXISTS sync_cursor');
        expect(allSql).toContain('DROP TABLE IF EXISTS sync_outbox');
      }
    });
  });

  describe('Migration 002 — Backward-Compatible Amount Upgrade', () => {
    it('creates transactions_new table with amount_minor INTEGER and KES default currency', async () => {
      await migration002.up(mockDb);

      const allSql = executedSql.join('\n');
      expect(allSql).toContain('amount_minor INTEGER NOT NULL');
      expect(allSql).toContain("currency TEXT DEFAULT 'KES'");
    });

    it('converts existing amount REAL values using ROUND to avoid floating-point truncation', async () => {
      await migration002.up(mockDb);

      const allSql = executedSql.join('\n');
      expect(allSql).toContain('CAST(ROUND(amount * 100) AS INTEGER)');
    });

    it('remaps currency from USD (old default) to KES during column migration', async () => {
      await migration002.up(mockDb);

      const allSql = executedSql.join('\n');
      expect(allSql).toContain("WHEN currency = 'USD'");
      // Preserves explicitly set non-USD currencies
      expect(allSql).toContain('ELSE currency END');
    });

    it('drops the original transactions table and renames transactions_new', async () => {
      await migration002.up(mockDb);

      const allSql = executedSql.join('\n');
      expect(allSql).toContain('DROP TABLE transactions;');
      expect(allSql).toContain(
        'ALTER TABLE transactions_new RENAME TO transactions;'
      );
    });

    it('recreates indexes on the upgraded transactions table', async () => {
      await migration002.up(mockDb);

      const allSql = executedSql.join('\n');
      expect(allSql).toContain(
        'CREATE INDEX IF NOT EXISTS idx_transactions_date'
      );
      expect(allSql).toContain(
        'CREATE INDEX IF NOT EXISTS idx_transactions_type'
      );
    });

    it('down migration reverts amount_minor INTEGER back to amount REAL', async () => {
      if (migration002.down) {
        await migration002.down(mockDb);
        const allSql = executedSql.join('\n');
        expect(allSql).toContain('amount REAL NOT NULL');
        expect(allSql).toContain('CAST(amount_minor AS REAL) / 100.0');
      }
    });
  });

  describe('Full Migration Chain — Fresh Installation', () => {
    it('runs migrations 001 then 002 sequentially and records both versions', async () => {
      const latestVersion = await runMigrations(mockDb, [
        migration001,
        migration002,
      ]);

      expect(latestVersion).toBe(2);
      expect(appliedVersions).toHaveLength(2);
      expect(appliedVersions[0]?.version).toBe(1);
      expect(appliedVersions[0]?.name).toBe('initial_schema');
      expect(appliedVersions[1]?.version).toBe(2);
      expect(appliedVersions[1]?.name).toBe(
        'convert_transaction_amounts_to_minor_units'
      );
    });

    it('fresh install final schema contains amount_minor, not amount REAL', async () => {
      await runMigrations(mockDb, [migration001, migration002]);

      const allSql = executedSql.join('\n');
      // 002 must create the new column
      expect(allSql).toContain('amount_minor INTEGER NOT NULL');
    });
  });

  describe('Full Migration Chain — Existing Installation Upgrade', () => {
    it('skips migration 001 when already applied and applies only migration 002', async () => {
      appliedVersions.push({
        version: 1,
        name: 'initial_schema',
        applied_at: '2026-01-01T00:00:00.000Z',
      });

      const m001Up = jest.spyOn(migration001, 'up');
      const latestVersion = await runMigrations(mockDb, [
        migration001,
        migration002,
      ]);

      expect(latestVersion).toBe(2);
      expect(m001Up).not.toHaveBeenCalled();
      // Only migration 002 is added (001 was pre-existing)
      expect(appliedVersions.filter((v) => v.version === 2)).toHaveLength(1);
      m001Up.mockRestore();
    });

    it('records migration 002 exactly once when upgrading an existing installation', async () => {
      appliedVersions.push({
        version: 1,
        name: 'initial_schema',
        applied_at: '2026-01-01T00:00:00.000Z',
      });

      await runMigrations(mockDb, [migration001, migration002]);
      await runMigrations(mockDb, [migration001, migration002]);

      const v2Records = appliedVersions.filter((v) => v.version === 2);
      expect(v2Records).toHaveLength(1);
    });
  });
});
