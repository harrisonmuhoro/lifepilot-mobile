import { useColorScheme } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { darkTheme, lightTheme } from '../theme';
import { AppTheme, ThemeMode } from '../types/theme';

export interface UseThemeResult {
  theme: AppTheme;
  colors: AppTheme['colors'];
  typography: AppTheme['typography'];
  spacing: AppTheme['spacing'];
  borderRadius: AppTheme['borderRadius'];
  elevation: AppTheme['elevation'];
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeResult => {
  const systemScheme = useColorScheme();
  const { themeMode, setThemeMode, toggleTheme } = useThemeStore();

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  return {
    theme,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    elevation: theme.elevation,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
  };
};
