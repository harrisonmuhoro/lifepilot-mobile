import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../common/Text';

export interface SectionProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  title,
  actionText,
  onAction,
  children,
  style,
}) => {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.xl }, style]}>
      <View
        style={[
          styles.headerRow,
          { marginBottom: spacing.md, paddingHorizontal: spacing.lg },
        ]}
      >
        <Text variant="h3" weight="bold">
          {title}
        </Text>
        {actionText && onAction && (
          <TouchableOpacity activeOpacity={0.7} onPress={onAction}>
            <Text variant="bodySm" color="primary" weight="medium">
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ paddingHorizontal: spacing.lg }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
