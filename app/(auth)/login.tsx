import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Compass, PlayCircle } from 'lucide-react-native';
import { ScreenLayout } from '../../src/components/layout/ScreenLayout';
import { Text } from '../../src/components/common/Text';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { FormInput } from '../../src/components/forms/FormInput';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuthStore } from '../../src/stores/authStore';
import { loginSchema, LoginFormData } from '../../src/schemas/authSchemas';
import { apiClient } from '../../src/services/api/apiClient';
import { ApiEndpoints } from '../../src/services/api/apiEndpoints';
import { LoginResponse } from '../../src/services/api/apiTypes';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const login = useAuthStore((state) => state.login);
  const enterDemoMode = useAuthStore((state) => state.enterDemoMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      // Attempt real backend authentication via API client
      const response = await apiClient.post<LoginResponse>(
        ApiEndpoints.auth.login,
        {
          email: data.email,
          password: data.password,
        }
      );

      const { user, tokens } = response.data;
      await login(tokens.accessToken, user, tokens.refreshToken);
      router.replace('/(tabs)');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Authentication server unreachable';
      setErrorMsg(
        `${msg}. Real login requires a connected Laravel API backend. Use Development / Demo Mode below for offline access.`
      );
    }
  };

  const handleDemoAccess = async () => {
    setErrorMsg(null);
    try {
      await enterDemoMode();
      router.replace('/(tabs)');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to enter demo mode'
      );
    }
  };

  return (
    <ScreenLayout scrollable contentContainerStyle={styles.container}>
      <View style={[styles.header, { marginVertical: spacing.xxl }]}>
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: colors.primary, marginBottom: spacing.md },
          ]}
        >
          <Compass size={36} color={colors.primaryContent} />
        </View>
        <Text variant="h1" weight="bold" align="center">
          LifePilot
        </Text>
        <Text
          variant="bodySm"
          color="secondary"
          align="center"
          style={{ marginTop: 4 }}
        >
          Your Personal Daily Operating System
        </Text>
      </View>

      <Card variant="elevated" style={{ width: '100%', maxWidth: 420 }}>
        <Text variant="h2" weight="bold" style={{ marginBottom: spacing.xs }}>
          Production Sign In
        </Text>
        <Text
          variant="caption"
          color="muted"
          style={{ marginBottom: spacing.lg }}
        >
          Requires connected Laravel API backend
        </Text>

        {errorMsg && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: colors.dangerSubtle,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Text variant="bodySm" color="danger">
              {errorMsg}
            </Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
              leftIcon={<Mail size={18} color={colors.textMuted} />}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
              leftIcon={<Lock size={18} color={colors.textMuted} />}
            />
          )}
        />

        <Button
          title="Sign In (Production API)"
          onPress={() => handleSubmit(onSubmit)()}
          loading={isSubmitting}
          style={{ marginTop: spacing.sm }}
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/register')}
          style={{ marginTop: spacing.lg, alignItems: 'center' }}
        >
          <Text variant="bodySm" color="secondary">
            {"Don't have an account? "}
            <Text variant="bodySm" color="primary" weight="semiBold">
              Sign up
            </Text>
          </Text>
        </TouchableOpacity>
      </Card>

      <View
        style={[
          styles.demoContainer,
          {
            borderColor: colors.borderSubtle,
            marginTop: spacing.xl,
            backgroundColor: colors.surfaceSubtle,
          },
        ]}
      >
        <View style={styles.demoTitleRow}>
          <PlayCircle size={18} color={colors.primary} />
          <Text
            variant="bodySm"
            weight="semiBold"
            color="primary"
            style={{ marginLeft: spacing.xs }}
          >
            Development / Demo Access
          </Text>
        </View>
        <Text
          variant="caption"
          color="secondary"
          align="center"
          style={{ marginTop: 4, marginBottom: spacing.md }}
        >
          Explore the application in isolated offline preview mode without an
          authentication server.
        </Text>
        <Button
          title="Enter Development / Demo Mode"
          variant="outline"
          onPress={handleDemoAccess}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
  },
  demoContainer: {
    width: '100%',
    maxWidth: 420,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
