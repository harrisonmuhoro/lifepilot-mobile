import * as SecureStore from 'expo-secure-store';
import {
  secureStorage,
  StorageKeys,
} from '../../src/components/../services/storage/secureStorage';

describe('SecureStorageService', () => {
  beforeEach(async () => {
    (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    await secureStorage.clearAuthTokens();
  });

  it('stores and retrieves authentication token', async () => {
    const token = 'jwt-sample-token-12345';
    await secureStorage.setAuthToken(token);

    const retrieved = await secureStorage.getAuthToken();
    expect(retrieved).toBe(token);
  });

  it('stores and retrieves refresh token', async () => {
    const refreshToken = 'refresh-sample-token-67890';
    await secureStorage.setRefreshToken(refreshToken);

    const retrieved = await secureStorage.getRefreshToken();
    expect(retrieved).toBe(refreshToken);
  });

  it('manages demo mode flag correctly', async () => {
    expect(await secureStorage.isDemoMode()).toBe(false);

    await secureStorage.setDemoMode(true);
    expect(await secureStorage.isDemoMode()).toBe(true);

    await secureStorage.setDemoMode(false);
    expect(await secureStorage.isDemoMode()).toBe(false);
  });

  it('removes authentication token correctly', async () => {
    await secureStorage.setAuthToken('token-to-delete');
    await secureStorage.removeItem(StorageKeys.AUTH_TOKEN);

    const retrieved = await secureStorage.getAuthToken();
    expect(retrieved).toBeNull();
  });

  it('clears all credentials and demo flag upon logout', async () => {
    await secureStorage.setAuthToken('auth-token');
    await secureStorage.setRefreshToken('refresh-token');
    await secureStorage.setDemoMode(true);

    await secureStorage.clearAuthTokens();

    const auth = await secureStorage.getAuthToken();
    const refresh = await secureStorage.getRefreshToken();
    const isDemo = await secureStorage.isDemoMode();

    expect(auth).toBeNull();
    expect(refresh).toBeNull();
    expect(isDemo).toBe(false);
  });

  describe('Failure & Platform Availability Handling', () => {
    it('returns null and skips write when SecureStore is not available on platform', async () => {
      // Force service to re-evaluate availability cache
      (secureStorage as any).isAvailableCache = null;
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      await secureStorage.setItem('test_key', 'test_value');
      const value = await secureStorage.getItem('test_key');

      expect(value).toBeNull();
    });

    it('handles SecureStore.setItemAsync throws gracefully by logging and rethrowing', async () => {
      (secureStorage as any).isAvailableCache = true;
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Keychain access denied')
      );

      await expect(secureStorage.setItem('key_fail', 'val')).rejects.toThrow(
        'Keychain access denied'
      );
    });

    it('returns null when SecureStore.getItemAsync throws an error', async () => {
      (secureStorage as any).isAvailableCache = true;
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Decryption error')
      );

      const val = await secureStorage.getItem('key_corrupt');
      expect(val).toBeNull();
    });

    it('catches and handles SecureStore.deleteItemAsync errors without crashing', async () => {
      (secureStorage as any).isAvailableCache = true;
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Delete error')
      );

      await expect(
        secureStorage.removeItem('key_fail_delete')
      ).resolves.not.toThrow();
    });
  });
});
