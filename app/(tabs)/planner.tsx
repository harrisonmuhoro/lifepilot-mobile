import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarCheck, Plus } from 'lucide-react-native';
import { ScreenLayout } from '../../src/components/layout/ScreenLayout';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/common/Card';
import { Text } from '../../src/components/common/Text';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useTheme } from '../../src/hooks/useTheme';

type FilterType = 'all' | 'today' | 'upcoming' | 'completed';

export default function PlannerScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>('today');

  const filters: { key: FilterType; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'all', label: 'All Tasks' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <ScreenLayout scrollable>
      <Header
        title="Planner"
        subtitle="Daily priorities & habit tracking"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Plus size={20} color={colors.primaryContent} />
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs */}
      <View
        style={[
          styles.filterRow,
          { paddingHorizontal: spacing.lg, marginVertical: spacing.md },
        ]}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.surfaceSubtle,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 2,
                },
              ]}
            >
              <Text
                variant="bodySm"
                weight={isActive ? 'semiBold' : 'regular'}
                style={{
                  color: isActive
                    ? colors.primaryContent
                    : colors.textSecondary,
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Content Area */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
        <Card variant="default">
          <EmptyState
            icon={<CalendarCheck size={32} color={colors.primary} />}
            title="No Tasks Scheduled"
            description="Your planner is clean and organized. Add your first priority to structure your day."
            actionTitle="Schedule New Task"
            onAction={() => {}}
          />
        </Card>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
