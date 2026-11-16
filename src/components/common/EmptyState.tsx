import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { spacing, colors, borderRadius } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.surfaceSubtle,
              borderRadius: borderRadius.full,
              marginBottom: spacing.lg,
            },
          ]}
        >
          {icon}
        </View>
      )}
      <Text variant="h3" align="center" style={{ marginBottom: spacing.xs }}>
        {title}
      </Text>
      {description && (
        <Text
          variant="bodySm"
          color="secondary"
          align="center"
          style={{
            marginBottom: actionTitle && onAction ? spacing.lg : 0,
            maxWidth: 280,
          }}
        >
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} size="sm" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
