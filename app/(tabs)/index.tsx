import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Compass,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Database,
} from 'lucide-react-native';
import { ScreenLayout } from '../../src/components/layout/ScreenLayout';
import { Text } from '../../src/components/common/Text';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Section } from '../../src/components/layout/Section';
import { useTheme } from '../../src/hooks/useTheme';
import { useDatabase } from '../../src/hooks/useDatabase';
import { useAuthStore } from '../../src/stores/authStore';

export default function DashboardScreen() {
  const { colors, spacing } = useTheme();
  const { isInitialized, currentVersion } = useDatabase();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ScreenLayout
      scrollable
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    >
      {/* Top Header */}
      <View
        style={[
          styles.headerRow,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
          },
        ]}
      >
        <View>
          <Text variant="caption" color="secondary">
            {formattedDate}
          </Text>
          <Text variant="h1" weight="bold">
            {user ? `Hello, ${user.name}` : 'Welcome, Pilot'}
          </Text>
        </View>

        <Badge
          label={isInitialized ? `SQLite v${currentVersion}` : 'Offline'}
          variant="success"
          icon={<Database size={12} color={colors.success} />}
        />
      </View>

      {/* Snapshot Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          gap: spacing.md,
        }}
      >
        {/* Planner Snapshot */}
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text variant="bodySm" color="secondary">
              {"Today's Focus"}
            </Text>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.surfaceSubtle },
              ]}
            >
              <CheckCircle2 size={16} color={colors.primary} />
            </View>
          </View>
          <Text
            variant="h2"
            weight="bold"
            style={{ marginVertical: spacing.xs }}
          >
            0 / 0
          </Text>
          <Text variant="caption" color="muted">
            All tasks cleared for today
          </Text>
        </Card>

        {/* Finance Snapshot */}
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text variant="bodySm" color="secondary">
              Net Balance
            </Text>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.successSubtle },
              ]}
            >
              <ArrowUpRight size={16} color={colors.success} />
            </View>
          </View>
          <Text
            variant="h2"
            weight="bold"
            color="success"
            style={{ marginVertical: spacing.xs }}
          >
            $0.00
          </Text>
          <Text variant="caption" color="muted">
            Ready for initial transaction
          </Text>
        </Card>

        {/* Productivity Score */}
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text variant="bodySm" color="secondary">
              Productivity
            </Text>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.surfaceSubtle },
              ]}
            >
              <TrendingUp size={16} color={colors.primary} />
            </View>
          </View>
          <Text
            variant="h2"
            weight="bold"
            style={{ marginVertical: spacing.xs }}
          >
            100%
          </Text>
          <Text variant="caption" color="muted">
            Foundation operational
          </Text>
        </Card>
      </ScrollView>

      {/* System Status Section */}
      <Section title="System Architecture">
        <Card variant="subtle" padding="md">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Compass size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text variant="body" weight="semiBold">
                LifePilot Offline-First Core
              </Text>
              <Text
                variant="caption"
                color="secondary"
                style={{ marginTop: 2 }}
              >
                Local SQLite database is configured with WAL mode, automated
                migrations, and transactional integrity.
              </Text>
            </View>
          </View>
        </Card>
      </Section>

      {/* Today's Agenda Section */}
      <Section
        title="Today's Agenda"
        actionText="View Planner"
        onAction={() => {}}
      >
        <Card variant="default">
          <EmptyState
            icon={<CheckCircle2 size={28} color={colors.primary} />}
            title="Ready for Planning"
            description="No tasks scheduled yet. Start by establishing your daily priorities."
            actionTitle="Add Priority"
            onAction={() => {}}
          />
        </Card>
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricCard: {
    width: 160,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
