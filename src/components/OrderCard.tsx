import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { Order } from "@/types";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/Badge";

interface OrderCardProps {
  order: Order;
  onReorder?: (order: Order) => void;
}

function statusLabel(status: Order["status"]): string {
  return status
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

function statusTone(status: Order["status"]): "success" | "danger" | "warning" | "primary" {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
  return "primary";
}

export function OrderCard({ order, onReorder }: OrderCardProps) {
  const itemsSummary = order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ");
  const date = new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/(customer)/order/${order.id}`)}
      accessibilityRole="button"
    >
      <View style={styles.headerRow}>
        <Text style={styles.vendorName} numberOfLines={1}>
          {order.vendorName}
        </Text>
        <Badge label={statusLabel(order.status)} tone={statusTone(order.status)} />
      </View>

      <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
      <Text style={styles.items} numberOfLines={2}>
        {itemsSummary}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.meta}>{date}</Text>
        <Text style={styles.total}>{formatCurrency(order.total)}</Text>
      </View>

      {onReorder && (order.status === "DELIVERED" || order.status === "CANCELLED") ? (
        <Pressable
          style={styles.reorderButton}
          onPress={(e) => {
            e.stopPropagation();
            onReorder(order);
          }}
        >
          <Text style={styles.reorderButtonText}>Reorder</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 4,
    ...shadow.card,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  vendorName: { flex: 1, fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  orderNumber: { fontSize: typography.size.xs, color: colors.textSecondary },
  items: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 2 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  meta: { fontSize: typography.size.xs, color: colors.textSecondary },
  total: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  reorderButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  reorderButtonText: { fontSize: typography.size.xs, color: colors.primary, fontWeight: typography.weight.semibold },
});
