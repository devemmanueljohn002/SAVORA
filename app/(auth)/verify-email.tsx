import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { authService } from "@/services/authService";
import { verifyOtpSchema, type VerifyOtpFormValues } from "@/validation/authSchemas";
import { colors, spacing, radii, typography } from "@/constants/theme";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Shared OTP screen for two flows, distinguished by the `purpose` param:
 *  - purpose=register: verifies a brand-new account's email (spec section 8)
 *  - purpose=reset:    verifies identity before allowing a password reset (spec section 10)
 *
 * Expects `email` and `purpose` route params, e.g.:
 *   router.push({ pathname: "/(auth)/verify-email", params: { email, purpose: "reset" } })
 */
export default function VerifyEmail() {
  const params = useLocalSearchParams<{ email?: string; purpose?: "register" | "reset" }>();
  const email = params.email ?? "";
  const purpose = params.purpose === "reset" ? "reset" : "register";

  const [apiError, setApiError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const onSubmit = async (values: VerifyOtpFormValues) => {
    setApiError(null);
    try {
      const result = await authService.verifyOtp({ email, code: values.code, purpose });

      if (purpose === "register") {
        // Email confirmed — user already has a session from registration.
        router.replace("/(customer)/home");
      } else {
        // Password-reset flow: carry the reset token forward to set a new password.
        router.replace({
          pathname: "/(auth)/reset-password",
          params: { email, resetToken: result.resetToken ?? "" },
        });
      }
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "That code didn't work. Please try again.";
      setApiError(message);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setApiError(null);
    try {
      await authService.resendVerificationCode({ email, purpose });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Couldn't resend the code. Please try again.";
      setApiError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{" "}
        <Text style={styles.emailHighlight}>{email || "your email"}</Text>. Enter it below to
        {purpose === "register" ? " verify your account." : " continue resetting your password."}
      </Text>

      {apiError ? <Text style={styles.errorBanner}>{apiError}</Text> : null}

      <Text style={styles.label}>Verification code</Text>
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.code ? <Text style={styles.fieldError}>{errors.code.message}</Text> : null}

      <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.submitButtonText}>Verify</Text>
        )}
      </Pressable>

      <Pressable onPress={handleResend} disabled={cooldown > 0 || resending} style={styles.resendRow}>
        <Text style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}>
          {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Resending…" : "Resend code"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, justifyContent: "center" },
  title: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 20 },
  emailHighlight: { color: colors.textPrimary, fontWeight: typography.weight.semibold },
  label: { fontSize: typography.size.sm, color: colors.textPrimary, marginBottom: spacing.xs },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.size.xl,
    letterSpacing: 8,
    textAlign: "center",
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
  resendRow: { alignItems: "center", marginTop: spacing.lg },
  resendText: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  resendTextDisabled: { color: colors.textSecondary },
});
