export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;

  // Primary branding
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryContent: string;

  // Secondary branding
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryContent: string;

  // Semantic & Financial indicators
  success: string;
  successSubtle: string;
  successContent: string;

  warning: string;
  warningSubtle: string;
  warningContent: string;

  danger: string;
  dangerSubtle: string;
  dangerContent: string;

  info: string;
  infoSubtle: string;
  infoContent: string;

  // Typography colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Navigation
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Overlays
  overlay: string;
}

export interface TypographyTokens {
  fontFamily: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  lineHeight: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  fontWeight: {
    regular: '400';
    medium: '500';
    semiBold: '600';
    bold: '700';
  };
}

export interface SpacingTokens {
  none: 0;
  xs: 4;
  sm: 8;
  md: 12;
  lg: 16;
  xl: 20;
  xxl: 24;
  xxxl: 32;
  huge: 48;
}

export interface BorderRadiusTokens {
  none: 0;
  xs: 4;
  sm: 8;
  md: 12;
  lg: 16;
  xl: 24;
  full: 9999;
}

export interface ElevationTokens {
  none: object;
  sm: object;
  md: object;
  lg: object;
}

export interface AppTheme {
  isDark: boolean;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  elevation: ElevationTokens;
}
