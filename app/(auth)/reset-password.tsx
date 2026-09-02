import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { authService } from "@/services/authService";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/validation/authSchemas";
import { colors, spacing, radii, typography } from "@/constants/theme";

/**
 * Final step of the forgot-password flow (spec section 10).
 * Expects a `resetToken` param handed off by verify-email.tsx after a
 * successful OTP check, plus `email` for context in the success message.
 */
export default function ResetPassword() {
  const params = useLocalSearchParams<{ email?: string; resetToken?: string }>();
  const resetToken = params.resetToken ?? "";

  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setApiError(null);
    if (!resetToken) {
      setApiError("This reset link has expired. Please request a new code.");
      return;
    }
    try {
      await authService.resetPassword({ resetToken, newPassword: values.newPassword });
      router.replace("/(auth)/login");
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Couldn't reset your password. Please try again.";
      setApiError(message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a new password</Text>
      <Text style={styles.subtitle}>Choose a strong password you haven't used before.</Text>

      {apiError ? <Text style={styles.errorBanner}>{apiError}</Text> : null}

      <Text style={styles.label}>New password</Text>
      <View style={styles.passwordRow}>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.showToggle}>
          <Text style={styles.showToggleText}>{showPassword ? "Hide" : "Show"}</Text>
        </Pressable>
      </View>
      {errors.newPassword ? <Text style={styles.fieldError}>{errors.newPassword.message}</Text> : null}

      <Text style={styles.label}>Confirm new password</Text>
      <View style={styles.passwordRow}>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Re-enter password"
              secureTextEntry={!showConfirm}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <Pressable onPress={() => setShowConfirm((v) => !v)} style={styles.showToggle}>
          <Text style={styles.showToggleText}>{showConfirm ? "Hide" : "Show"}</Text>
        </Pressable>
      </View>
      {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text> : null}

      <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.submitButtonText}>Reset Password</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, justifyContent: "center" },
  title: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { fontSize: typography.size.sm, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
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
  passwordRow: { flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1 },
  showToggle: { position: "absolute", right: spacing.md },
  showToggleText: { color: colors.primary, fontWeight: typography.weight.medium },
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
});
