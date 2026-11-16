import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type TextVariant =
  'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'caption' | 'label';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'success'
  | 'warning'
  | 'danger';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  weight,
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const { colors, typography } = useTheme();

  const getTextColor = (): string => {
    switch (color) {
      case 'secondary':
        return colors.textSecondary;
      case 'muted':
        return colors.textMuted;
      case 'inverse':
        return colors.textInverse;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      case 'primary':
      default:
        return colors.textPrimary;
    }
  };

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.fontSize.xxxl,
          lineHeight: typography.lineHeight.xxxl,
          fontWeight: typography.fontWeight.bold,
        };
      case 'h2':
        return {
          fontSize: typography.fontSize.xxl,
          lineHeight: typography.lineHeight.xxl,
          fontWeight: typography.fontWeight.bold,
        };
      case 'h3':
        return {
          fontSize: typography.fontSize.xl,
          lineHeight: typography.lineHeight.xl,
          fontWeight: typography.fontWeight.semiBold,
        };
      case 'bodySm':
        return {
          fontSize: typography.fontSize.sm,
          lineHeight: typography.lineHeight.sm,
          fontWeight: typography.fontWeight.regular,
        };
      case 'caption':
        return {
          fontSize: typography.fontSize.xs,
          lineHeight: typography.lineHeight.xs,
          fontWeight: typography.fontWeight.regular,
        };
      case 'label':
        return {
          fontSize: typography.fontSize.xs,
          lineHeight: typography.lineHeight.xs,
          fontWeight: typography.fontWeight.medium,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        };
      case 'body':
      default:
        return {
          fontSize: typography.fontSize.md,
          lineHeight: typography.lineHeight.md,
          fontWeight: typography.fontWeight.regular,
        };
    }
  };

  const computedStyle: TextStyle = {
    color: getTextColor(),
    textAlign: align,
    ...getVariantStyle(),
    ...(weight ? { fontWeight: typography.fontWeight[weight] } : {}),
  };

  return (
    <RNText style={[computedStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};
