import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import {
  useVendorOrders,
  useAcceptVendorOrder,
  useRejectVendorOrder,
  useMarkOrderReady,
} from "@/hooks/useVendorOrders";
import type { VendorOrderTab } from "@/services/vendorOrderService";
import { VendorOrderCard } from "@/components/VendorOrderCard";
import { colors, spacing, radii, typography } from "@/constants/theme";
import type { Order } from "@/types";

const TABS: { key: VendorOrderTab; label: string }[] = [
  { key: "new", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const DEFAULT_PREP_MINUTES = 25;

export default function VendorOrders() {
  const [activeTab, setActiveTab] = useState<VendorOrderTab>("new");
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: orders, isLoading, isError, refetch, isRefetching } = useVendorOrders(activeTab);
  const acceptOrder = useAcceptVendorOrder();
  const rejectOrder = useRejectVendorOrder();
  const markReady = useMarkOrderReady();

  const handleAccept = (order: Order) => {
    acceptOrder.mutate(
      { orderId: order.id, estimatedPrepMinutes: DEFAULT_PREP_MINUTES },
      {
        onError: () => Alert.alert("Couldn't accept order", "Please try again."),
      }
    );
  };

  const handleConfirmReject = () => {
    if (!rejectingOrder) return;
    if (!rejectReason.trim()) {
      Alert.alert("Add a reason", "Let the customer know why this order can't be fulfilled.");
      return;
    }
    rejectOrder.mutate(
      { orderId: rejectingOrder.id, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectingOrder(null);
          setRejectReason("");
        },
        onError: () => Alert.alert("Couldn't reject order", "Please try again."),
      }
    );
  };

  const handleMarkReady = (order: Order) => {
    markReady.mutate(order.id, {
      onError: () => Alert.alert("Couldn't update order", "Please try again."),
    });
  };

  const isBusy = acceptOrder.isPending || rejectOrder.isPending || markReady.isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TABS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.tabRow}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tab, activeTab === item.key && styles.tabActive]}
            onPress={() => setActiveTab(item.key)}
          >
            <Text style={[styles.tabText, activeTab === item.key && styles.tabTextActive]}>{item.label}</Text>
          </Pressable>
        )}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Couldn't load orders</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.errorSubtitle}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <VendorOrderCard
              order={item}
              tab={activeTab}
              onAccept={handleAccept}
              onReject={setRejectingOrder}
              onMarkReady={handleMarkReady}
              isBusy={isBusy}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No {activeTab} orders</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!rejectingOrder} transparent animationType="fade" onRequestClose={() => setRejectingOrder(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject order #{rejectingOrder?.orderNumber}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Reason (e.g. out of stock, closing early)"
              placeholderTextColor={colors.textSecondary}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setRejectingOrder(null);
                  setRejectReason("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirmButton} onPress={handleConfirmReject} disabled={rejectOrder.isPending}>
                {rejectOrder.isPending ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalConfirmText}>Reject Order</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  tabRow: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.medium },
  tabTextActive: { color: colors.textInverse },
  listContent: { padding: spacing.xl, paddingTop: 0, flexGrow: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxxl },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  emptyTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: spacing.xl },
  modalCard: { backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.xl, gap: spacing.md },
  modalTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: "top",
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  modalActions: { flexDirection: "row", gap: spacing.sm },
  modalCancelButton: { flex: 1, borderRadius: radii.md, paddingVertical: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.textPrimary, fontWeight: typography.weight.semibold },
  modalConfirmButton: { flex: 1, borderRadius: radii.md, paddingVertical: spacing.md, alignItems: "center", backgroundColor: colors.danger },
  modalConfirmText: { color: colors.textInverse, fontWeight: typography.weight.semibold },
});
