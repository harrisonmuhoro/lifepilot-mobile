export interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  environment: 'development' | 'staging' | 'production';
  dbName: string;
  enableOfflineSync: boolean;
  enableAnalytics: boolean;
}

export const Config: AppConfig = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api/v1',
  apiTimeout: process.env.EXPO_PUBLIC_API_TIMEOUT
    ? Number(process.env.EXPO_PUBLIC_API_TIMEOUT)
    : 15000,
  environment:
    (process.env.EXPO_PUBLIC_ENV as AppConfig['environment']) ?? 'development',
  dbName: process.env.EXPO_PUBLIC_DB_NAME ?? 'lifepilot.db',
  enableOfflineSync: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_SYNC !== 'false',
  enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
};
