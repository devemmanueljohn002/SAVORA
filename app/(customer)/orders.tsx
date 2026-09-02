import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { useOrders } from "@/hooks/useOrders";
import { useReorderCheck, applyReorderToCart } from "@/hooks/useReorder";
import { OrderCard } from "@/components/OrderCard";
import { colors, spacing, radii, typography } from "@/constants/theme";
import type { Order } from "@/types";

const TABS: { key: "active" | "completed" | "cancelled"; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function Orders() {
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "cancelled">("active");
  const { data: orders, isLoading, isError, refetch, isRefetching } = useOrders(activeTab);
  const reorderCheck = useReorderCheck();

  const handleReorder = (order: Order) => {
    reorderCheck.mutate(order.id, {
      onSuccess: (result) => {
        if (!result.vendorIsOpen) {
          Alert.alert("Vendor is closed", `${order.vendorName} isn't accepting orders right now. Please try again later.`);
          return;
        }
        if (result.unavailableItems.length > 0) {
          const names = result.unavailableItems.map((i) => i.productName).join(", ");
          Alert.alert(
            "Some items aren't available",
            `${names} ${result.unavailableItems.length === 1 ? "is" : "are"} no longer available. You can still reorder the rest.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Continue anyway",
                onPress: () => {
                  applyReorderToCart(order);
                  router.push("/(customer)/cart");
                },
              },
            ]
          );
          return;
        }
        applyReorderToCart(order);
        router.push("/(customer)/cart");
      },
      onError: (error) => {
        const message = (error as { message?: string })?.message ?? "Couldn't check this order right now. Please try again.";
        Alert.alert("Something went wrong", message);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Couldn't load your orders</Text>
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
          renderItem={({ item }) => <OrderCard order={item} onReorder={handleReorder} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No {activeTab} orders yet</Text>
              <Text style={styles.emptySubtitle}>Your delicious journey starts here.</Text>
              <Pressable style={styles.exploreButton} onPress={() => router.push("/(customer)/home")}>
                <Text style={styles.exploreButtonText}>Explore Food</Text>
              </Pressable>
            </View>
          }
        />
      )}
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
  tabRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
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
  emptyTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  emptySubtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center" },
  exploreButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.xl },
  exploreButtonText: { color: colors.textInverse, fontWeight: typography.weight.semibold },
});
