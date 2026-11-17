import { create } from 'zustand';
import { secureStorage } from '../services/storage/secureStorage';
import { UserProfile } from '../services/api/apiTypes';
import { logger } from '../utils/logger';

const TAG = 'AuthStore';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  login: (
    token: string,
    user: UserProfile,
    refreshToken?: string
  ) => Promise<void>;
  enterDemoMode: () => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isDemoMode: false,
  isLoading: true,

  login: async (token: string, user: UserProfile, refreshToken?: string) => {
    try {
      await secureStorage.setDemoMode(false);
      await secureStorage.setAuthToken(token);
      if (refreshToken) {
        await secureStorage.setRefreshToken(refreshToken);
      }
      await secureStorage.setItem('lifepilot_user_data', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isDemoMode: false,
        isLoading: false,
      });
      logger.info(TAG, `User logged in: ${user.email}`);
    } catch (error) {
      logger.error(TAG, 'Failed to store credentials on login', error);
      throw error;
    }
  },

  enterDemoMode: async () => {
    try {
      const demoUser: UserProfile = {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@lifepilot.local',
        currency: 'KES',
        timezone: 'UTC',
        createdAt: new Date().toISOString(),
      };
      await secureStorage.clearAuthTokens();
      await secureStorage.setDemoMode(true);
      await secureStorage.setItem(
        'lifepilot_user_data',
        JSON.stringify(demoUser)
      );

      set({
        token: 'demo-mode-token',
        user: demoUser,
        isAuthenticated: true,
        isDemoMode: true,
        isLoading: false,
      });
      logger.info(TAG, 'Entered offline demo / development mode');
    } catch (error) {
      logger.error(TAG, 'Failed to initialize demo mode', error);
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
        isDemoMode: false,
        isLoading: false,
      });
      logger.info(TAG, 'User logged out and credentials cleared');
    } catch (error) {
      logger.error(TAG, 'Error during logout', error);
    }
  },

  restoreSession: async () => {
    try {
      const isDemo = await secureStorage.isDemoMode();
      const token = await secureStorage.getAuthToken();
      const userDataStr = await secureStorage.getItem('lifepilot_user_data');

      if (isDemo && userDataStr) {
        const user = JSON.parse(userDataStr) as UserProfile;
        set({
          token: 'demo-mode-token',
          user,
          isAuthenticated: true,
          isDemoMode: true,
          isLoading: false,
        });
        logger.info(TAG, 'Demo session restored');
      } else if (token && userDataStr) {
        const user = JSON.parse(userDataStr) as UserProfile;
        set({
          token,
          user,
          isAuthenticated: true,
          isDemoMode: false,
          isLoading: false,
        });
        logger.info(TAG, `Session restored for: ${user.email}`);
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isDemoMode: false,
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
        isDemoMode: false,
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
