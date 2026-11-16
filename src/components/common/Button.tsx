import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...rest
}) => {
  const { colors, spacing, borderRadius } = useTheme();

  const getContainerStyles = (): ViewStyle => {
    let bg = colors.primary;
    let border = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'secondary':
        bg = colors.surfaceSubtle;
        break;
      case 'outline':
        bg = 'transparent';
        border = colors.border;
        borderWidth = 1;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
      case 'danger':
        bg = colors.danger;
        break;
      case 'primary':
      default:
        bg = colors.primary;
        break;
    }

    let paddingVertical: number = spacing.md;
    let paddingHorizontal: number = spacing.lg;

    if (size === 'sm') {
      paddingVertical = spacing.xs + 2;
      paddingHorizontal = spacing.md;
    } else if (size === 'lg') {
      paddingVertical = spacing.lg;
      paddingHorizontal = spacing.xxl;
    }

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth,
      borderRadius: borderRadius.md,
      paddingVertical,
      paddingHorizontal,
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextColor = (): 'primary' | 'secondary' | 'inverse' | 'danger' => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
      case 'primary':
      default:
        return 'inverse';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[styles.base, getContainerStyles(), style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.primary
              : colors.textInverse
          }
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && (
            <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>
          )}
          <Text
            variant={size === 'sm' ? 'bodySm' : size === 'lg' ? 'body' : 'body'}
            color={getTextColor()}
            weight="semiBold"
          >
            {title}
          </Text>
          {rightIcon && (
            <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
