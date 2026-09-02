import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Link } from "expo-router";
import { authService } from "@/services/authService";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/validation/authSchemas";
import { colors, spacing, radii, typography } from "@/constants/theme";

export default function ForgotPassword() {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setApiError(null);
    try {
      await authService.forgotPassword(values.email);
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: values.email, purpose: "reset" },
      });
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Couldn't send the code. Please try again.";
      setApiError(message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send you a verification code.</Text>

      {apiError ? <Text style={styles.errorBanner}>{apiError}</Text> : null}

      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.email ? <Text style={styles.fieldError}>{errors.email.message}</Text> : null}

      <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.submitButtonText}>Send Code</Text>
        )}
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Remembered your password? </Text>
        <Link href="/(auth)/login" style={styles.footerLink}>
          Log in
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, justifyContent: "center" },
  title: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { fontSize: typography.size.sm, color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  fieldError: { color: colors.danger, fontSize: typography.size.xs, marginTop: spacing.xs },
  errorBanner: {
    backgroundColor: "#FDECEA",
    color: colors.danger,
    padding: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  submitButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  footerText: { color: colors.textSecondary, fontSize: typography.size.sm },
  footerLink: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
});
