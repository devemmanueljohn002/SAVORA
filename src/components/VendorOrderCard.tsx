import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Order } from "@/types";
import type { VendorOrderTab } from "@/services/vendorOrderService";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/Badge";

interface VendorOrderCardProps {
  order: Order;
  tab: VendorOrderTab;
  onAccept?: (order: Order) => void;
  onReject?: (order: Order) => void;
  onMarkReady?: (order: Order) => void;
  isBusy?: boolean;
}

export function VendorOrderCard({ order, tab, onAccept, onReject, onMarkReady, isBusy }: VendorOrderCardProps) {
  const itemsSummary = order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <Badge label={order.paymentStatus} tone={order.paymentStatus === "PAID" ? "success" : "warning"} />
      </View>
      <Text style={styles.items} numberOfLines={2}>
        {itemsSummary}
      </Text>
      <View style={styles.footerRow}>
        <Text style={styles.address} numberOfLines={1}>
          {order.deliveryAddress.city}, {order.deliveryAddress.state}
        </Text>
        <Text style={styles.total}>{formatCurrency(order.total)}</Text>
      </View>

      {tab === "new" ? (
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => onReject?.(order)}
            disabled={isBusy}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => onAccept?.(order)}
            disabled={isBusy}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </Pressable>
        </View>
      ) : null}

      {tab === "preparing" ? (
        <Pressable style={[styles.actionButton, styles.readyButton]} onPress={() => onMarkReady?.(order)} disabled={isBusy}>
          <Text style={styles.acceptButtonText}>Mark Ready for Pickup</Text>
        </Pressable>
      ) : null}
    </View>
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderNumber: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  items: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 2 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  address: { fontSize: typography.size.xs, color: colors.textSecondary, flexShrink: 1 },
  total: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  actionButton: { flex: 1, borderRadius: radii.md, paddingVertical: spacing.sm, alignItems: "center" },
  rejectButton: { borderWidth: 1, borderColor: colors.danger },
  rejectButtonText: { color: colors.danger, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  acceptButton: { backgroundColor: colors.primary },
  acceptButtonText: { color: colors.textInverse, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  readyButton: { backgroundColor: colors.primary, marginTop: spacing.md },
});
