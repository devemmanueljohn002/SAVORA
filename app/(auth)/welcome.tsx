import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";
import { colors, spacing, radii, typography } from "@/constants/theme";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <View style={styles.brandBlock}>
        <Text style={styles.logo}>SAVORA FOOD</Text>
        <Text style={styles.tagline}>Good Food. Great Moments.</Text>
      </View>

      <View style={styles.actions}>
        <Link href="/(auth)/login" asChild>
          <Pressable style={[styles.button, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Log In</Text>
          </Pressable>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Pressable style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  brandBlock: {
    marginTop: spacing.xxxl,
    alignItems: "center",
  },
  logo: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.md,
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
