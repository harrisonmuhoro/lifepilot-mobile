import { useMemo } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppInit } from '../src/hooks/useAppInit';
import { useTheme } from '../src/hooks/useTheme';
import { LoadingState } from '../src/components/common/LoadingState';
import { ErrorState } from '../src/components/common/ErrorState';
import { View } from 'react-native';

export default function RootLayout() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      }),
    []
  );

  const { isReady, dbError } = useAppInit();
  const { colors } = useTheme();

  if (dbError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorState
          title="Database Initialization Error"
          message={`Unable to initialize the local SQLite database: ${dbError.message}`}
        />
      </View>
    );
  }

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingState message="Starting LifePilot..." />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
