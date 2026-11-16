import { AppTheme } from '../types/theme';
import { darkColors, lightColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { elevation } from './elevation';

export const lightTheme: AppTheme = {
  isDark: false,
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  elevation,
};

export const darkTheme: AppTheme = {
  isDark: true,
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  elevation,
};

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './borderRadius';
export * from './elevation';
