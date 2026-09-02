import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import type { CartLineItem } from "@/types";
import { colors, spacing, radii, typography } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

interface CartItemRowProps {
  item: CartLineItem;
  onIncrement: (lineId: string) => void;
  onDecrement: (lineId: string) => void;
  onRemove: (lineId: string) => void;
}

export function CartItemRow({ item, onIncrement, onDecrement, onRemove }: CartItemRowProps) {
  const optionsSummary = item.selectedOptions.map((o) => o.choiceLabel).join(", ");

  return (
    <View style={styles.container}>
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : undefined}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.productName}
          </Text>
          <Pressable onPress={() => onRemove(item.id)} hitSlop={8}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
        {optionsSummary ? (
          <Text style={styles.options} numberOfLines={1}>
            {optionsSummary}
          </Text>
        ) : null}
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={1}>
            Note: {item.notes}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperButton} onPress={() => onDecrement(item.id)} hitSlop={8}>
              <Text style={styles.stepperButtonText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{item.quantity}</Text>
            <Pressable style={styles.stepperButton} onPress={() => onIncrement(item.id)} hitSlop={8}>
              <Text style={styles.stepperButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: spacing.md },
  image: { width: 72, height: 72, borderRadius: radii.md, backgroundColor: colors.surface },
  body: { flex: 1, gap: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { flex: 1, fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  removeText: { fontSize: typography.size.xs, color: colors.danger, marginLeft: spacing.sm },
  options: { fontSize: typography.size.xs, color: colors.textSecondary },
  notes: { fontSize: typography.size.xs, color: colors.textSecondary, fontStyle: "italic" },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.xs },
  price: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  stepperButton: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  stepperButtonText: { fontSize: typography.size.md, color: colors.primary, fontWeight: typography.weight.bold },
  stepperValue: { fontSize: typography.size.sm, color: colors.textPrimary, minWidth: 16, textAlign: "center" },
});
