import { create } from 'zustand';

export type SyncStatusState = 'idle' | 'syncing' | 'error' | 'success';

interface SyncState {
  status: SyncStatusState;
  pendingCount: number;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  setSyncStatus: (
    status: SyncStatusState,
    errorMessage?: string | null
  ) => void;
  setPendingCount: (count: number) => void;
  setLastSyncedAt: (timestamp: string) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,
  errorMessage: null,

  setSyncStatus: (status, errorMessage = null) => set({ status, errorMessage }),

  setPendingCount: (pendingCount) => set({ pendingCount }),

  setLastSyncedAt: (lastSyncedAt) =>
    set({ lastSyncedAt, status: 'success', errorMessage: null }),
}));
