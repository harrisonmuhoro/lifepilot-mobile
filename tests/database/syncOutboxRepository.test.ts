import { SyncOutboxRepository } from '../../src/database/repositories/syncOutboxRepository';
import type { SQLiteDatabase } from 'expo-sqlite';
import { SyncOutboxRecord } from '../../src/types/database';

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
    expect(item.entity_id).toBe('task-123');
    expect(item.operation).toBe('CREATE');
    expect(item.status).toBe('pending');
    expect(item.attempts).toBe(0);
    expect(item.error).toBeNull();
    expect(mockDb.runAsync).toHaveBeenCalledTimes(1);

    const insertCall = executedQueries[0];
    expect(insertCall?.sql).toContain("'pending'");
    expect(insertCall?.params).toContain('task');
    expect(insertCall?.params).toContain('task-123');
  });

  describe('resetOrphanedInProgress (stale-lease recovery)', () => {
    it('resets only stale in_progress records older than the threshold, not recent ones', async () => {
      const repository = new SyncOutboxRepository(mockDb);
      await repository.resetOrphanedInProgress();

      const resetQuery = executedQueries.find((q) =>
        q.sql.includes("status = 'in_progress'")
      );
      expect(resetQuery).toBeDefined();
      // Must use updated_at < threshold (stale-lease check), not unconditional reset
      expect(resetQuery?.sql).toContain('updated_at < ?');
      expect(resetQuery?.sql).toContain("SET status = 'pending'");
    });

    it('passes two timestamps: the new updated_at value and the stale threshold cutoff', async () => {
      const repository = new SyncOutboxRepository(mockDb);
      await repository.resetOrphanedInProgress();

      const resetQuery = executedQueries.find((q) =>
        q.sql.includes("status = 'in_progress'")
      );
      // Params: [now.toISOString(), thresholdTime]
      expect(resetQuery?.params).toHaveLength(2);
      const [nowParam, thresholdParam] = resetQuery?.params ?? [];
      // The threshold must be strictly earlier than "now"
      expect(new Date(nowParam as string).getTime()).toBeGreaterThan(
        new Date(thresholdParam as string).getTime()
      );
    });
  });

  describe('getPending', () => {
    it('calls resetOrphanedInProgress (stale-lease) before fetching pending items', async () => {
      const repository = new SyncOutboxRepository(mockDb);
      await repository.getPending(50);

      // resetOrphanedInProgress uses runAsync; getAllAsync is for the select
      const resetQuery = executedQueries.find(
        (q) =>
          q.sql.includes("status = 'in_progress'") &&
          q.sql.includes('updated_at < ?')
      );
      expect(resetQuery).toBeDefined();
      expect(mockDb.getAllAsync).toHaveBeenCalled();
    });

    it('queries only pending/failed items below the retry limit', async () => {
      const repository = new SyncOutboxRepository(mockDb);
      await repository.getPending(10);

      const selectCall = (mockDb.getAllAsync as jest.Mock).mock.calls[0];
      const sql = selectCall?.[0] as string;
      expect(sql).toContain("status IN ('pending', 'failed')");
      expect(sql).toContain('attempts < 5');
      expect(sql).toContain('LIMIT ?');
    });
  });

  describe('updateStatus — retry increment behavior', () => {
    it('does NOT increment retry attempts when status transitions to in_progress', async () => {
      const repository = new SyncOutboxRepository(mockDb);
      await repository.updateStatus('item-1', 'in_progress');

      const updateQuery = executedQueries.find((q) =>
        q.sql.includes('UPDATE sync_outbox')
      );
      expect(updateQuery).toBeDefined();
      expect(updateQuery?.sql).not.toContain('attempts = attempts + 1');
    });

    it('does NOT increment retry attempts when status transitions to synced', async () => {
      const repository = new SyncOutboxRepository(mockDb);
      await repository.updateStatus('item-1', 'synced');

      const updateQuery = executedQueries.find((q) =>
        q.sql.includes('UPDATE sync_outbox')
      );
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
      expect(updateQuery?.params).toContain('item-1');
    });

    it('passes null error message when transitioning to non-failed state', async () => {
      const repository = new SyncOutboxRepository(mockDb);
      await repository.updateStatus('item-2', 'synced', null);

      const updateQuery = executedQueries.find((q) =>
        q.sql.includes('UPDATE sync_outbox')
      );
      expect(updateQuery?.params).toContain(null);
    });
  });

  describe('retry limit enforcement', () => {
    it('excludes items at or above 5 retry attempts from getPending results', async () => {
      // The SQL itself filters attempts < 5. Verify the query contract.
      const repository = new SyncOutboxRepository(mockDb);
      await repository.getPending(50);

      const selectCall = (mockDb.getAllAsync as jest.Mock).mock.calls[0];
      const sql = selectCall?.[0] as string;
      expect(sql).toContain('attempts < 5');
    });
  });

  describe('removeCompleted', () => {
    it('deletes a completed item by id', async () => {
      const repository = new SyncOutboxRepository(mockDb);
      await repository.removeCompleted('completed-item-id');

      const deleteQuery = executedQueries.find((q) =>
        q.sql.includes('DELETE FROM sync_outbox')
      );
      expect(deleteQuery).toBeDefined();
      expect(deleteQuery?.params).toContain('completed-item-id');
    });
  });

  describe('countPending', () => {
    it('returns pending count from database query', async () => {
      (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce({ count: 7 });
      const repository = new SyncOutboxRepository(mockDb);
      const count = await repository.countPending();

      expect(count).toBe(7);
      expect(mockDb.getFirstAsync).toHaveBeenCalled();
    });

    it('returns 0 when getFirstAsync returns null', async () => {
      (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
      const repository = new SyncOutboxRepository(mockDb);
      const count = await repository.countPending();
      expect(count).toBe(0);
    });
  });
});
