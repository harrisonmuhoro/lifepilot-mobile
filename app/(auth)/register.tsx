import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Compass } from 'lucide-react-native';
import { ScreenLayout } from '../../src/components/layout/ScreenLayout';
import { Text } from '../../src/components/common/Text';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { FormInput } from '../../src/components/forms/FormInput';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuthStore } from '../../src/stores/authStore';
import {
  registerSchema,
  RegisterFormData,
} from '../../src/schemas/authSchemas';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const login = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg(null);
    try {
      await login('mock-jwt-token-' + Date.now(), {
        id: 'user-new',
        name: data.name,
        email: data.email,
        currency: 'USD',
        timezone: 'UTC',
        createdAt: new Date().toISOString(),
      });
      router.replace('/(tabs)');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <ScreenLayout scrollable contentContainerStyle={styles.container}>
      <View style={[styles.header, { marginVertical: spacing.xl }]}>
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: colors.primary, marginBottom: spacing.md },
          ]}
        >
          <Compass size={32} color={colors.primaryContent} />
        </View>
        <Text variant="h1" weight="bold" align="center">
          Create Account
        </Text>
        <Text
          variant="bodySm"
          color="secondary"
          align="center"
          style={{ marginTop: 4 }}
        >
          Start operating with clarity and control
        </Text>
      </View>

      <Card variant="elevated" style={{ width: '100%', maxWidth: 420 }}>
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
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="Full Name"
              placeholder="Harrison Muhoro"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.name?.message}
              leftIcon={<User size={18} color={colors.textMuted} />}
            />
          )}
        />

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
              placeholder="At least 8 characters"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
              leftIcon={<Lock size={18} color={colors.textMuted} />}
            />
          )}
        />

        <Controller
          control={control}
          name="passwordConfirmation"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              label="Confirm Password"
              placeholder="Repeat password"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.passwordConfirmation?.message}
              leftIcon={<Lock size={18} color={colors.textMuted} />}
            />
          )}
        />

        <Button
          title="Create Account"
          onPress={() => handleSubmit(onSubmit)()}
          loading={isSubmitting}
          style={{ marginTop: spacing.sm }}
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: spacing.lg, alignItems: 'center' }}
        >
          <Text variant="bodySm" color="secondary">
            Already have an account?{' '}
            <Text variant="bodySm" color="primary" weight="semiBold">
              Sign in
            </Text>
          </Text>
        </TouchableOpacity>
      </Card>
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
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
  },
});
