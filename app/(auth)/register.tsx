import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Link } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { registerSchema, type RegisterFormValues } from "@/validation/authSchemas";
import { colors, spacing, radii, typography } from "@/constants/theme";

export default function Register() {
  const register = useAuthStore((s) => s.register);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null);
    try {
      await register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        referralCode: values.referralCode || undefined,
      });
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: values.email, purpose: "register" },
      });
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Registration failed. Please try again.";
      setApiError(message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Join Savora Food and start ordering in minutes.</Text>

      {apiError ? <Text style={styles.errorBanner}>{apiError}</Text> : null}

      <Field label="Full name" name="fullName" control={control} error={errors.fullName?.message} placeholder="Emmanuel Okafor" />
      <Field
        label="Email"
        name="email"
        control={control}
        error={errors.email?.message}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Phone number"
        name="phone"
        control={control}
        error={errors.phone?.message}
        placeholder="08012345678"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordRow}>
        <Controller
          control={control}
          name="password"
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
      {errors.password ? <Text style={styles.fieldError}>{errors.password.message}</Text> : null}

      <Text style={styles.label}>Confirm password</Text>
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

      <Field
        label="Referral code (optional)"
        name="referralCode"
        control={control}
        error={errors.referralCode?.message}
        placeholder="Have a code? Enter it here"
        autoCapitalize="characters"
      />

      <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.submitButtonText}>Create Account</Text>
        )}
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login" style={styles.footerLink}>
          Log in
        </Link>
      </View>
    </ScrollView>
  );
}

/** Small local field component to avoid repeating label/input/error markup. */
function Field({
  label,
  name,
  control,
  error,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  name: keyof RegisterFormValues;
  control: ReturnType<typeof useForm<RegisterFormValues>>["control"];
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "words" | "characters";
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize ?? "none"}
            value={typeof value === "string" ? value : ""}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
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
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  footerText: { color: colors.textSecondary, fontSize: typography.size.sm },
  footerLink: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
});
