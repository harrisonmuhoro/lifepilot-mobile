import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { ScreenLayout } from '../../src/components/layout/ScreenLayout';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/common/Card';
import { Text } from '../../src/components/common/Text';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Section } from '../../src/components/layout/Section';
import { useTheme } from '../../src/hooks/useTheme';
import { formatMinorUnits } from '../../src/schemas/financeSchemas';

export default function FinanceScreen() {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <ScreenLayout scrollable>
      <Header
        title="Finance"
        subtitle="Cashflow & budget management"
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

      {/* Cashflow Overview Card */}
      <View
        style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.md }}
      >
        <Card variant="elevated">
          <Text variant="caption" color="secondary">
            Current Total Balance
          </Text>
          <Text
            variant="h1"
            weight="bold"
            color="primary"
            style={{ marginVertical: spacing.xs }}
          >
            {formatMinorUnits(0, 'KES')}
          </Text>

          <View
            style={[
              styles.statsRow,
              {
                borderTopColor: colors.borderSubtle,
                borderTopWidth: 1,
                paddingTop: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View style={styles.statItem}>
              <View style={styles.statLabelRow}>
                <ArrowDownLeft size={14} color={colors.success} />
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ marginLeft: 4 }}
                >
                  Income
                </Text>
              </View>
              <Text variant="body" weight="semiBold" color="success">
                +{formatMinorUnits(0, 'KES')}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statLabelRow}>
                <ArrowUpRight size={14} color={colors.danger} />
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ marginLeft: 4 }}
                >
                  Expenses
                </Text>
              </View>
              <Text variant="body" weight="semiBold" color="danger">
                -{formatMinorUnits(0, 'KES')}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Recent Activity */}
      <Section title="Recent Transactions">
        <Card variant="default">
          <EmptyState
            icon={<Wallet size={32} color={colors.primary} />}
            title="No Transactions Yet"
            description="Keep your financial health in check by recording your expenses and income."
            actionTitle="Record Transaction"
            onAction={() => {}}
          />
        </Card>
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
});
