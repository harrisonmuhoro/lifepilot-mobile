import type { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
  down?: (db: SQLiteDatabase) => Promise<void>;
}

export interface SchemaMigrationRecord {
  version: number;
  name: string;
  applied_at: string;
}

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncStatus = 'pending' | 'in_progress' | 'failed' | 'synced';

export interface SyncOutboxRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: SyncOperationType;
  payload: string; // JSON string
  client_timestamp: string;
  attempts: number;
  status: SyncStatus;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncCursorRecord {
  entity_type: string;
  last_cursor: string | null;
  last_sync_at: string;
}

export interface DatabaseState {
  isInitialized: boolean;
  isLoading: boolean;
  currentVersion: number;
  error: Error | null;
}
