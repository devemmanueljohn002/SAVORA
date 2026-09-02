import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useCartStore } from "@/stores/cartStore";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

/**
 * Spec section 33: "Cart should have a visible floating/badge indicator."
 * There's no dedicated Cart tab in the bottom nav, so this bar surfaces on
 * screens where adding to cart happens (vendor detail) and links to /cart.
 */
export function CartBar() {
  const itemCount = useCartStore((s) => s.itemCount());
  const subtotal = useCartStore((s) => s.subtotal());
  const vendorName = useCartStore((s) => s.vendorName);

  if (itemCount === 0) return null;

  return (
    <Pressable style={styles.container} onPress={() => router.push("/(customer)/cart")}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{itemCount}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.vendorName} numberOfLines={1}>
          {vendorName ?? "Your cart"}
        </Text>
        <Text style={styles.subtotal}>{formatCurrency(subtotal)}</Text>
      </View>
      <Text style={styles.viewCartText}>View Cart</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.card,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.textInverse, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  textBlock: { flex: 1 },
  vendorName: { color: colors.textInverse, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  subtotal: { color: colors.textInverse, fontSize: typography.size.xs, opacity: 0.9 },
  viewCartText: { color: colors.textInverse, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
});
