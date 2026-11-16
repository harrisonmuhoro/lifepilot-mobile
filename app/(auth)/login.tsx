import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Compass } from 'lucide-react-native';
import { ScreenLayout } from '../../src/components/layout/ScreenLayout';
import { Text } from '../../src/components/common/Text';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { FormInput } from '../../src/components/forms/FormInput';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuthStore } from '../../src/stores/authStore';
import { loginSchema, LoginFormData } from '../../src/schemas/authSchemas';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const login = useAuthStore((state) => state.login);
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
      await login('mock-jwt-token-' + Date.now(), {
        id: 'user-1',
        name: data.email.split('@')[0] ?? 'User',
        email: data.email,
        currency: 'USD',
        timezone: 'UTC',
        createdAt: new Date().toISOString(),
      });
      router.replace('/(tabs)');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed');
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
        <Text variant="h2" weight="bold" style={{ marginBottom: spacing.lg }}>
          Welcome back
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
          title="Sign In"
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

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(tabs)')}
        style={{ marginTop: spacing.xl }}
      >
        <Text variant="bodySm" color="muted">
          Skip to Offline Dashboard
        </Text>
      </TouchableOpacity>
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
});
