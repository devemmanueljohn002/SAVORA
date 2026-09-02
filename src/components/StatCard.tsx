import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <View style={[styles.container, accent && styles.containerAccent]}>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
      <Text style={[styles.label, accent && styles.labelAccent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 2,
    ...shadow.card,
  },
  containerAccent: { backgroundColor: colors.primary },
  value: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  valueAccent: { color: colors.textInverse },
  label: { fontSize: typography.size.xs, color: colors.textSecondary },
  labelAccent: { color: colors.textInverse, opacity: 0.85 },
});
