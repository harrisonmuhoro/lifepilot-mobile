import type { SQLiteDatabase } from 'expo-sqlite';
import {
  SyncOperationType,
  SyncOutboxRecord,
  SyncStatus,
} from '../../types/database';
import { generateUUID } from '../../utils/uuid';
import { logger } from '../../utils/logger';

const TAG = 'SyncOutboxRepository';

/**
 * Items that remain in 'in_progress' for longer than this duration are
 * considered orphaned (e.g. the app crashed mid-sync) and are eligible
 * for recovery. 5 minutes gives a generous window for a legitimate sync
 * operation to complete before we assume it was abandoned.
 */
const ORPHAN_STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export interface CreateOutboxItemParams {
  entityType: string;
  entityId: string;
  operation: SyncOperationType;
  payload: Record<string, unknown>;
}

export class SyncOutboxRepository {
  constructor(private db: SQLiteDatabase) {}

  async enqueue(params: CreateOutboxItemParams): Promise<SyncOutboxRecord> {
    const id = generateUUID();
    const now = new Date().toISOString();
    const payloadStr = JSON.stringify(params.payload);

    await this.db.runAsync(
      `INSERT INTO sync_outbox (
        id, entity_type, entity_id, operation, payload, client_timestamp, attempts, status, error, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 'pending', NULL, ?, ?);`,
      [
        id,
        params.entityType,
        params.entityId,
        params.operation,
        payloadStr,
        now,
        now,
        now,
      ]
    );

    logger.debug(
      TAG,
      `Enqueued outbox item: ${id} for ${params.entityType}:${params.entityId} [${params.operation}]`
    );

    return {
      id,
      entity_type: params.entityType,
      entity_id: params.entityId,
      operation: params.operation,
      payload: payloadStr,
      client_timestamp: now,
      attempts: 0,
      status: 'pending',
      error: null,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Resets stale 'in_progress' items back to 'pending'.
   *
   * Uses a stale-lease threshold rather than resetting every in_progress
   * record unconditionally. This prevents interfering with a legitimately
   * active synchronization operation that is still running in another
   * context. Only items whose updated_at timestamp is older than
   * ORPHAN_STALE_THRESHOLD_MS are considered orphaned (i.e. the process
   * that claimed them has likely crashed or timed out).
   */
  async resetOrphanedInProgress(): Promise<void> {
    const now = new Date();
    const thresholdTime = new Date(
      now.getTime() - ORPHAN_STALE_THRESHOLD_MS
    ).toISOString();

    await this.db.runAsync(
      `UPDATE sync_outbox
       SET status = 'pending',
           updated_at = ?
       WHERE status = 'in_progress'
         AND updated_at < ?;`,
      [now.toISOString(), thresholdTime]
    );
  }

  async getPending(limit = 50): Promise<SyncOutboxRecord[]> {
    // Reset only genuinely stale orphaned in_progress items (not all of them).
    await this.resetOrphanedInProgress();

    return this.db.getAllAsync<SyncOutboxRecord>(
      `SELECT * FROM sync_outbox
       WHERE status IN ('pending', 'failed') AND attempts < 5
       ORDER BY client_timestamp ASC
       LIMIT ?;`,
      [limit]
    );
  }

  async updateStatus(
    id: string,
    status: SyncStatus,
    errorMessage: string | null = null
  ): Promise<void> {
    const now = new Date().toISOString();

    // Retry attempts increment ONLY on genuine sync failure.
    // Transitioning to 'in_progress' or 'synced' does not count as a failure.
    const shouldIncrementAttempts = status === 'failed';

    if (shouldIncrementAttempts) {
      await this.db.runAsync(
        `UPDATE sync_outbox
         SET status = ?,
             attempts = attempts + 1,
             error = ?,
             updated_at = ?
         WHERE id = ?;`,
        [status, errorMessage, now, id]
      );
    } else {
      await this.db.runAsync(
        `UPDATE sync_outbox
         SET status = ?,
             error = ?,
             updated_at = ?
         WHERE id = ?;`,
        [status, errorMessage, now, id]
      );
    }
  }

  async removeCompleted(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM sync_outbox WHERE id = ?;', [id]);
  }

  async countPending(): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sync_outbox WHERE status = 'pending';"
    );
    return result?.count ?? 0;
  }
}
