import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LifePilot',
  slug: 'lifepilot-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'lifepilot',
  userInterfaceStyle: 'automatic',
  platforms: ['android', 'ios'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lifepilot.mobile',
  },
  android: {
    package: 'com.lifepilot.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundColor: '#0F172A',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0F172A',
        image: './assets/images/splash-icon.png',
        imageWidth: 100,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.lifepilot.app/v1',
    apiTimeout: process.env.EXPO_PUBLIC_API_TIMEOUT
      ? Number(process.env.EXPO_PUBLIC_API_TIMEOUT)
      : 15000,
    environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
  },
});
