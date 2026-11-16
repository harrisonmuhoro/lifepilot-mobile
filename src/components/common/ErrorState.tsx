import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryTitle?: string;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryTitle = 'Try Again',
  style,
}) => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.dangerSubtle,
            borderRadius: borderRadius.full,
            marginBottom: spacing.lg,
          },
        ]}
      >
        <AlertCircle size={32} color={colors.danger} />
      </View>
      <Text
        variant="h3"
        color="primary"
        align="center"
        style={{ marginBottom: spacing.xs }}
      >
        {title}
      </Text>
      <Text
        variant="bodySm"
        color="secondary"
        align="center"
        style={{
          marginBottom: onRetry ? spacing.lg : 0,
          maxWidth: 300,
        }}
      >
        {message}
      </Text>
      {onRetry && (
        <Button
          title={retryTitle}
          onPress={onRetry}
          variant="outline"
          size="sm"
        />
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
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
