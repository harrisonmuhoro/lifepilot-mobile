import { Platform } from 'react-native';
import { TypographyTokens } from '../types/theme';

const systemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography: TypographyTokens = {
  fontFamily: {
    regular: systemFont,
    medium: systemFont,
    semiBold: systemFont,
    bold: systemFont,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 32,
  },
  lineHeight: {
    xs: 15,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 34,
    xxxl: 40,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};
