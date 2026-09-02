import { View, Text, Pressable, StyleSheet } from "react-native";
import type { PaymentMethodType } from "@/types";
import { colors, spacing, radii, typography } from "@/constants/theme";

interface PaymentMethodCardProps {
  method: PaymentMethodType;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: (method: PaymentMethodType) => void;
}

export function PaymentMethodCard({ method, label, description, selected, onSelect }: PaymentMethodCardProps) {
  return (
    <Pressable
      style={[styles.container, selected && styles.containerSelected]}
      onPress={() => onSelect(method)}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  containerSelected: { borderColor: colors.primary, backgroundColor: "#FCEBEC" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: radii.full, backgroundColor: colors.primary },
  textBlock: { flex: 1 },
  label: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  description: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
});
