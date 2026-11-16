import { useThemeStore } from '../../src/stores/themeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ themeMode: 'system' });
  });

  it('initializes with system theme by default', () => {
    expect(useThemeStore.getState().themeMode).toBe('system');
  });

  it('updates theme mode explicitly', () => {
    useThemeStore.getState().setThemeMode('dark');
    expect(useThemeStore.getState().themeMode).toBe('dark');

    useThemeStore.getState().setThemeMode('light');
    expect(useThemeStore.getState().themeMode).toBe('light');
  });

  it('toggles between light and dark modes', () => {
    useThemeStore.getState().setThemeMode('light');
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().themeMode).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().themeMode).toBe('light');
  });
});
