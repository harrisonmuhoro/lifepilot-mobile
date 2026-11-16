import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useDatabase } from './useDatabase';
import { useAuthStore } from '../stores/authStore';
import { logger } from '../utils/logger';

const TAG = 'useAppInit';

// Keep the splash screen visible while initializing app resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export interface AppInitResult {
  isReady: boolean;
  dbError: Error | null;
}

export const useAppInit = (): AppInitResult => {
  const [isReady, setIsReady] = useState(false);
  const { isInitialized, error: dbError } = useDatabase();
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    const initialize = async () => {
      try {
        logger.info(TAG, 'Initializing app resources...');
        await restoreSession();

        if (isInitialized || dbError) {
          setIsReady(true);
          await SplashScreen.hideAsync();
          logger.info(TAG, 'App initialization complete, splash screen hidden');
        }
      } catch (err) {
        logger.error(TAG, 'Error during app initialization', err);
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    initialize();
  }, [isInitialized, dbError, restoreSession]);

  return {
    isReady,
    dbError,
  };
};
