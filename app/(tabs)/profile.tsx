import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  User,
  Moon,
  Sun,
  Smartphone,
  Database,
  ShieldCheck,
  Info,
  LogOut,
} from 'lucide-react-native';
import { ScreenLayout } from '../../src/components/layout/ScreenLayout';
import { Header } from '../../src/components/layout/Header';
import { Card } from '../../src/components/common/Card';
import { Text } from '../../src/components/common/Text';
import { Badge } from '../../src/components/common/Badge';
import { Section } from '../../src/components/layout/Section';
import { useTheme } from '../../src/hooks/useTheme';
import { useDatabase } from '../../src/hooks/useDatabase';
import { useAuthStore } from '../../src/stores/authStore';
import { ThemeMode } from '../../src/types/theme';

export default function ProfileScreen() {
  const { colors, spacing, borderRadius, themeMode, setThemeMode } = useTheme();
  const { isInitialized, currentVersion } = useDatabase();
  const { user, logout } = useAuthStore();

  const themeOptions: {
    mode: ThemeMode;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      mode: 'light',
      label: 'Light',
      icon: <Sun size={16} color={colors.textPrimary} />,
    },
    {
      mode: 'dark',
      label: 'Dark',
      icon: <Moon size={16} color={colors.textPrimary} />,
    },
    {
      mode: 'system',
      label: 'System',
      icon: <Smartphone size={16} color={colors.textPrimary} />,
    },
  ];

  return (
    <ScreenLayout
      scrollable
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    >
      <Header title="Profile" subtitle="Account & application settings" />

      {/* User Card */}
      <View
        style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.md }}
      >
        <Card variant="elevated">
          <View style={styles.profileRow}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <User size={30} color={colors.primaryContent} />
            </View>
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text variant="h3" weight="bold">
                {user ? user.name : 'Pilot (Offline Mode)'}
              </Text>
              <Text variant="bodySm" color="secondary" style={{ marginTop: 2 }}>
                {user ? user.email : 'Local device profile'}
              </Text>
            </View>
            <Badge
              label={user ? 'Cloud' : 'Local'}
              variant={user ? 'success' : 'neutral'}
            />
          </View>
        </Card>
      </View>

      {/* Appearance Section */}
      <Section title="Appearance">
        <Card variant="default">
          <Text
            variant="bodySm"
            color="secondary"
            style={{ marginBottom: spacing.sm }}
          >
            Interface Theme
          </Text>
          <View style={styles.themeSelectorRow}>
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  activeOpacity={0.7}
                  onPress={() => setThemeMode(opt.mode)}
                  style={[
                    styles.themeButton,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected
                        ? colors.surfaceSubtle
                        : 'transparent',
                      borderRadius: borderRadius.md,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                >
                  {opt.icon}
                  <Text
                    variant="bodySm"
                    weight={isSelected ? 'semiBold' : 'regular'}
                    style={{
                      marginLeft: 6,
                      color: isSelected ? colors.primary : colors.textPrimary,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </Section>

      {/* Storage & Database Diagnostics */}
      <Section title="Database & Storage">
        <Card variant="default">
          <View style={styles.diagnosticRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Database size={18} color={colors.primary} />
              <Text variant="body" style={{ marginLeft: spacing.sm }}>
                SQLite Local Engine
              </Text>
            </View>
            <Badge
              label={
                isInitialized ? `Active (v${currentVersion})` : 'Initializing'
              }
              variant={isInitialized ? 'success' : 'warning'}
            />
          </View>

          <View
            style={[
              styles.diagnosticRow,
              {
                borderTopColor: colors.borderSubtle,
                borderTopWidth: 1,
                paddingTop: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldCheck size={18} color={colors.primary} />
              <Text variant="body" style={{ marginLeft: spacing.sm }}>
                Credential Vault
              </Text>
            </View>
            <Badge label="Expo SecureStore" variant="info" />
          </View>
        </Card>
      </Section>

      {/* About Application */}
      <Section title="Application">
        <Card variant="subtle">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Info size={18} color={colors.textSecondary} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text variant="bodySm" weight="medium">
                LifePilot Mobile
              </Text>
              <Text variant="caption" color="secondary">
                Version 0.1.0 • React Native & Expo Architecture Foundation
              </Text>
            </View>
          </View>

          {user && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => logout()}
              style={[
                styles.logoutButton,
                {
                  borderTopColor: colors.borderSubtle,
                  borderTopWidth: 1,
                  marginTop: spacing.md,
                  paddingTop: spacing.md,
                },
              ]}
            >
              <LogOut size={16} color={colors.danger} />
              <Text
                variant="bodySm"
                color="danger"
                weight="medium"
                style={{ marginLeft: spacing.xs }}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  diagnosticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
