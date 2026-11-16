import { create } from 'zustand';
import { secureStorage } from '../services/storage/secureStorage';
import { UserProfile } from '../services/api/apiTypes';
import { logger } from '../utils/logger';

const TAG = 'AuthStore';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    token: string,
    user: UserProfile,
    refreshToken?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token: string, user: UserProfile, refreshToken?: string) => {
    try {
      await secureStorage.setAuthToken(token);
      if (refreshToken) {
        await secureStorage.setRefreshToken(refreshToken);
      }
      await secureStorage.setItem('lifepilot_user_data', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      logger.info(TAG, `User logged in: ${user.email}`);
    } catch (error) {
      logger.error(TAG, 'Failed to store credentials on login', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await secureStorage.clearAuthTokens();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      logger.info(TAG, 'User logged out and credentials cleared');
    } catch (error) {
      logger.error(TAG, 'Error during logout', error);
    }
  },

  restoreSession: async () => {
    try {
      const token = await secureStorage.getAuthToken();
      const userDataStr = await secureStorage.getItem('lifepilot_user_data');

      if (token && userDataStr) {
        const user = JSON.parse(userDataStr) as UserProfile;
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        logger.info(TAG, `Session restored for: ${user.email}`);
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        logger.info(TAG, 'No active session found');
      }
    } catch (error) {
      logger.error(TAG, 'Failed to restore session', error);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (partial: Partial<UserProfile>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...partial };
      set({ user: updated });
      secureStorage
        .setItem('lifepilot_user_data', JSON.stringify(updated))
        .catch((err) =>
          logger.warn(TAG, 'Failed to persist updated user', err)
        );
    }
  },
}));
