import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

interface PriceTextProps {
  amount: number;
  originalAmount?: number;
  size?: "sm" | "md" | "lg";
  color?: string;
}

const sizeMap = {
  sm: typography.size.sm,
  md: typography.size.md,
  lg: typography.size.xl,
};

export function PriceText({ amount, originalAmount, size = "md", color = colors.textPrimary }: PriceTextProps) {
  const fontSize = sizeMap[size];
  return (
    <View style={styles.row}>
      <Text style={[styles.amount, { fontSize, color }]}>{formatCurrency(amount)}</Text>
      {originalAmount != null && originalAmount > amount ? (
        <Text style={[styles.original, { fontSize: fontSize - 2 }]}>{formatCurrency(originalAmount)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", gap: spacing.xs },
  amount: { fontWeight: typography.weight.bold },
  original: { color: colors.textSecondary, textDecorationLine: "line-through" },
});
