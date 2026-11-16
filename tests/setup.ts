// Mock expo-secure-store
const secureStoreMock: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    secureStoreMock[key] = value;
  }),
  getItemAsync: jest.fn(async (key: string) => secureStoreMock[key] ?? null),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete secureStoreMock[key];
  }),
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  hideAsync: jest.fn().mockResolvedValue(true),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'LifePilot',
    slug: 'lifepilot-mobile',
    extra: {
      apiUrl: 'http://10.0.2.2:8000/api/v1',
      apiTimeout: 15000,
      environment: 'test',
    },
  },
}));
