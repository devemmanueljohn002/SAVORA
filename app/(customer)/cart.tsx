import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { router, Stack } from "expo-router";
import { useCartStore } from "@/stores/cartStore";
import { CartItemRow } from "@/components/CartItemRow";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

// Flat placeholders until the backend exposes real delivery/service fee
// calculation per order (spec section 58's calculateDeliveryFee()).
const SERVICE_FEE = 200;

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const vendorName = useCartStore((s) => s.vendorName);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  const deliveryFee = items.length > 0 ? 800 : 0;
  const serviceFee = items.length > 0 ? SERVICE_FEE : 0;
  const total = subtotal + deliveryFee + serviceFee;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: "Cart" }} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add something delicious to get started.</Text>
        <Pressable style={styles.exploreButton} onPress={() => router.push("/(customer)/home")}>
          <Text style={styles.exploreButtonText}>Explore Food</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: vendorName ?? "Cart" }} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CartItemRow item={item} onIncrement={incrementItem} onDecrement={decrementItem} onRemove={removeItem} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.summaryCard}>
        <SummaryRow label="Subtotal" value={subtotal} />
        <SummaryRow label="Delivery fee" value={deliveryFee} />
        <SummaryRow label="Service fee" value={serviceFee} />
        <View style={styles.divider} />
        <SummaryRow label="Total" value={total} bold />

        <Pressable style={styles.checkoutButton} onPress={() => router.push("/(customer)/checkout")}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryLabelBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.xl, paddingBottom: spacing.xxxl * 3 },
  separator: { height: spacing.lg },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: colors.background },
  emptyTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  emptySubtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center" },
  exploreButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.xl },
  exploreButtonText: { color: colors.textInverse, fontWeight: typography.weight.semibold },
  summaryCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.xs,
    ...shadow.card,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: typography.size.sm, color: colors.textSecondary },
  summaryLabelBold: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  summaryValue: { fontSize: typography.size.sm, color: colors.textPrimary },
  summaryValueBold: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  checkoutButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center", marginTop: spacing.md },
  checkoutButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
