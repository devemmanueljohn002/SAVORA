import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router, Link } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { colors, spacing, radii, typography } from "@/constants/theme";

const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your email or phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    setApiError(null);
    try {
      await login(values.identifier, values.password);
      // Role-aware redirect (spec section 37) — mirrors app/index.tsx's logic.
      const role = useAuthStore.getState().user?.role;
      if (role === "VENDOR") {
        router.replace("/(vendor)/dashboard");
      } else {
        router.replace("/(customer)/home");
      }
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Login failed. Please try again.";
      setApiError(message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to continue ordering great food.</Text>

      {apiError ? <Text style={styles.errorBanner}>{apiError}</Text> : null}

      <Text style={styles.label}>Email or phone</Text>
      <Controller
        control={control}
        name="identifier"
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
      {errors.identifier ? <Text style={styles.fieldError}>{errors.identifier.message}</Text> : null}

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordRow}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
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

      <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
        Forgot password?
      </Link>

      <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.submitButtonText}>Log In</Text>
        )}
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/register" style={styles.footerLink}>
          Create one
        </Link>
      </View>
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
  forgotLink: { alignSelf: "flex-end", color: colors.primary, marginTop: spacing.md, fontSize: typography.size.sm },
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
