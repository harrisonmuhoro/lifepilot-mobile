import * as SecureStore from 'expo-secure-store';
import { logger } from '../../utils/logger';

const TAG = 'SecureStorage';

export const StorageKeys = {
  AUTH_TOKEN: 'lifepilot_auth_token',
  REFRESH_TOKEN: 'lifepilot_refresh_token',
  USER_DATA: 'lifepilot_user_data',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

export class SecureStorageService {
  private isAvailableCache: boolean | null = null;

  async isAvailable(): Promise<boolean> {
    if (this.isAvailableCache !== null) {
      return this.isAvailableCache;
    }
    try {
      this.isAvailableCache = await SecureStore.isAvailableAsync();
      return this.isAvailableCache;
    } catch {
      this.isAvailableCache = false;
      return false;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        logger.warn(
          TAG,
          `SecureStore not available on platform. Skipping write for key: ${key}`
        );
        return;
      }
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (error) {
      logger.error(TAG, `Failed to store key: ${key}`, error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      logger.error(TAG, `Failed to retrieve key: ${key}`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      logger.error(TAG, `Failed to remove key: ${key}`, error);
    }
  }

  async getAuthToken(): Promise<string | null> {
    return this.getItem(StorageKeys.AUTH_TOKEN);
  }

  async setAuthToken(token: string): Promise<void> {
    return this.setItem(StorageKeys.AUTH_TOKEN, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getItem(StorageKeys.REFRESH_TOKEN);
  }

  async setRefreshToken(token: string): Promise<void> {
    return this.setItem(StorageKeys.REFRESH_TOKEN, token);
  }

  async clearAuthTokens(): Promise<void> {
    await Promise.all([
      this.removeItem(StorageKeys.AUTH_TOKEN),
      this.removeItem(StorageKeys.REFRESH_TOKEN),
      this.removeItem(StorageKeys.USER_DATA),
    ]);
  }
}

export const secureStorage = new SecureStorageService();
