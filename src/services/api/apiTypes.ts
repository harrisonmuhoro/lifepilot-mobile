export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
}

export interface LoginResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface SyncPushOperation {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  clientTimestamp: string;
}

export interface SyncPushPayload {
  operations: SyncPushOperation[];
}

export interface SyncPushConflict {
  operationId: string;
  entityType: string;
  entityId: string;
  reason: string;
  serverVersion?: Record<string, unknown>;
}

export interface SyncPushResponse {
  appliedCount: number;
  conflicts: SyncPushConflict[];
}

export interface SyncPullResponse<T = Record<string, unknown>> {
  cursor: string;
  hasMore: boolean;
  entities: Record<string, T[]>;
}
