import {
  secureStorage,
  StorageKeys,
} from '../../src/services/storage/secureStorage';

describe('SecureStorageService', () => {
  beforeEach(async () => {
    await secureStorage.clearAuthTokens();
  });

  it('stores and retrieves authentication token', async () => {
    const token = 'jwt-sample-token-12345';
    await secureStorage.setAuthToken(token);

    const retrieved = await secureStorage.getAuthToken();
    expect(retrieved).toBe(token);
  });

  it('removes authentication token correctly', async () => {
    await secureStorage.setAuthToken('token-to-delete');
    await secureStorage.removeItem(StorageKeys.AUTH_TOKEN);

    const retrieved = await secureStorage.getAuthToken();
    expect(retrieved).toBeNull();
  });

  it('clears all credentials upon logout', async () => {
    await secureStorage.setAuthToken('auth-token');
    await secureStorage.setRefreshToken('refresh-token');

    await secureStorage.clearAuthTokens();

    const auth = await secureStorage.getAuthToken();
    const refresh = await secureStorage.getRefreshToken();

    expect(auth).toBeNull();
    expect(refresh).toBeNull();
  });
});
