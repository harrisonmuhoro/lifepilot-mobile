import type { SQLiteDatabase } from 'expo-sqlite';
import {
  SyncOperationType,
  SyncOutboxRecord,
  SyncStatus,
} from '../../types/database';
import { generateUUID } from '../../utils/uuid';
import { logger } from '../../utils/logger';

const TAG = 'SyncOutboxRepository';

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
   * Resets any orphaned 'in_progress' items back to 'pending'
   * (e.g., if the application crashed mid-sync).
   */
  async resetOrphanedInProgress(): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      `UPDATE sync_outbox
       SET status = 'pending',
           updated_at = ?
       WHERE status = 'in_progress';`,
      [now]
    );
  }

  async getPending(limit = 50): Promise<SyncOutboxRecord[]> {
    // Automatically reset orphaned in_progress items from prior crashes
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
