import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radii, typography } from "@/constants/theme";

interface BadgeProps {
  label: string;
  tone?: "neutral" | "success" | "danger" | "warning" | "primary";
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, { bg: string; text: string }> = {
  neutral: { bg: colors.surface, text: colors.textSecondary },
  success: { bg: "#E8F5E9", text: colors.success },
  danger: { bg: "#FDECEA", text: colors.danger },
  warning: { bg: "#FFF8E1", text: "#8A6D00" },
  primary: { bg: "#FCEBEC", text: colors.primary },
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const { bg, text } = toneStyles[tone];
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
});
