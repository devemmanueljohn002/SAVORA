import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/constants/theme";

interface StarRatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function StarRatingInput({ label, value, onChange }: StarRatingInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={6} accessibilityLabel={`${star} star${star === 1 ? "" : "s"}`}>
            <Text style={[styles.star, star <= value && styles.starFilled]}>★</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: typography.size.sm, color: colors.textPrimary },
  starsRow: { flexDirection: "row", gap: spacing.xs },
  star: { fontSize: typography.size.xl, color: colors.border },
  starFilled: { color: colors.secondary },
});
