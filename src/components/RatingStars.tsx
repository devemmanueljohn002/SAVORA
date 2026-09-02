import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/constants/theme";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

export function RatingStars({ rating, reviewCount, size = "sm" }: RatingStarsProps) {
  const fontSize = size === "sm" ? typography.size.xs : typography.size.sm;

  return (
    <View style={styles.row}>
      <Text style={[styles.star, { fontSize }]}>★</Text>
      <Text style={[styles.rating, { fontSize }]}>{rating.toFixed(1)}</Text>
      {reviewCount != null ? (
        <Text style={[styles.reviewCount, { fontSize }]}>({reviewCount})</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  star: { color: colors.secondary },
  rating: { color: colors.textPrimary, fontWeight: typography.weight.semibold },
  reviewCount: { color: colors.textSecondary },
});
