import { SyncOutboxRepository } from '../../src/database/repositories/syncOutboxRepository';
import type { SQLiteDatabase } from 'expo-sqlite';

describe('SyncOutboxRepository', () => {
  let executedQueries: { sql: string; params: any[] }[] = [];

  const mockDb = {
    runAsync: jest.fn(async (sql: string, params: any[] = []) => {
      executedQueries.push({ sql, params });
    }),
    getAllAsync: jest.fn(async () => []),
    getFirstAsync: jest.fn(async () => ({ count: 0 })),
  } as unknown as SQLiteDatabase;

  beforeEach(() => {
    executedQueries = [];
    jest.clearAllMocks();
  });

  it('enqueues a new outbox mutation item with status pending and 0 attempts', async () => {
    const repository = new SyncOutboxRepository(mockDb);
    const item = await repository.enqueue({
      entityType: 'task',
      entityId: 'task-123',
      operation: 'CREATE',
      payload: { title: 'New Task' },
    });

    expect(item.entity_type).toBe('task');
    expect(item.status).toBe('pending');
    expect(item.attempts).toBe(0);
    expect(mockDb.runAsync).toHaveBeenCalled();
  });

  it('resets orphaned in_progress items back to pending during getPending', async () => {
    const repository = new SyncOutboxRepository(mockDb);
    await repository.getPending(50);

    const resetQuery = executedQueries.find((q) =>
      q.sql.includes("status = 'pending'")
    );
    expect(resetQuery).toBeDefined();
    expect(resetQuery?.sql).toContain("WHERE status = 'in_progress'");
  });

  it('does NOT increment retry attempts when status is updated to in_progress or synced', async () => {
    const repository = new SyncOutboxRepository(mockDb);
    await repository.updateStatus('item-1', 'in_progress');

    const updateQuery = executedQueries.find((q) =>
      q.sql.includes('UPDATE sync_outbox')
    );
    expect(updateQuery).toBeDefined();
    expect(updateQuery?.sql).not.toContain('attempts = attempts + 1');
  });

  it('increments retry attempts ONLY when status is updated to failed', async () => {
    const repository = new SyncOutboxRepository(mockDb);
    await repository.updateStatus('item-1', 'failed', 'Network timeout');

    const updateQuery = executedQueries.find((q) =>
      q.sql.includes('UPDATE sync_outbox')
    );
    expect(updateQuery).toBeDefined();
    expect(updateQuery?.sql).toContain('attempts = attempts + 1');
    expect(updateQuery?.params).toContain('Network timeout');
  });
});
