import { View, StyleSheet } from 'react-native';
import { Award, Flame, BarChart2 } from 'lucide-react-native';
import { ScreenLayout } from '../../src/components/layout/ScreenLayout';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/common/Card';
import { Text } from '../../src/components/common/Text';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Section } from '../../src/components/layout/Section';
import { useTheme } from '../../src/hooks/useTheme';

export default function InsightsScreen() {
  const { colors, spacing } = useTheme();

  return (
    <ScreenLayout scrollable>
      <Header title="Insights" subtitle="Performance analytics & trends" />

      {/* Summary KPI Row */}
      <View
        style={[
          styles.kpiRow,
          { paddingHorizontal: spacing.lg, marginVertical: spacing.md },
        ]}
      >
        <Card variant="subtle" style={styles.kpiCard}>
          <Flame size={20} color={colors.warning} />
          <Text variant="h2" weight="bold" style={{ marginVertical: 4 }}>
            0 Days
          </Text>
          <Text variant="caption" color="secondary">
            Active Streak
          </Text>
        </Card>

        <Card variant="subtle" style={styles.kpiCard}>
          <Award size={20} color={colors.success} />
          <Text variant="h2" weight="bold" style={{ marginVertical: 4 }}>
            0%
          </Text>
          <Text variant="caption" color="secondary">
            Habit Consistency
          </Text>
        </Card>
      </View>

      {/* Analytics Preview */}
      <Section title="Weekly Telemetry">
        <Card variant="default">
          <EmptyState
            icon={<BarChart2 size={32} color={colors.primary} />}
            title="Gathering Intelligence"
            description="Insights and trends will activate as you log tasks and track expenses throughout your week."
          />
        </Card>
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
});
