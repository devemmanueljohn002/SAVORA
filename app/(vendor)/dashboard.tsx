import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Switch, Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useVendorDashboard } from "@/hooks/useVendorDashboard";
import { useVendorStoreSettings, useUpdateVendorStoreSettings } from "@/hooks/useVendorStore";
import { StatCard } from "@/components/StatCard";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

export default function VendorDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: summary, isLoading, isError, refetch, isRefetching } = useVendorDashboard();
  const { data: storeSettings } = useVendorStoreSettings();
  const updateStoreSettings = useUpdateVendorStoreSettings();

  const handleToggleOpen = (value: boolean) => {
    updateStoreSettings.mutate(
      { isOpen: value },
      {
        onError: () => Alert.alert("Couldn't update", "Please try again."),
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !summary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn't load your dashboard</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>Welcome back, {user?.fullName?.split(" ")[0] ?? "there"} 👋</Text>
      </View>

      <View style={styles.storeStatusCard}>
        <View>
          <Text style={styles.storeStatusLabel}>Store status</Text>
          <Text style={styles.storeStatusValue}>{storeSettings?.isOpen ? "Open for orders" : "Closed"}</Text>
        </View>
        <Switch
          value={storeSettings?.isOpen ?? false}
          onValueChange={handleToggleOpen}
          trackColor={{ true: colors.primary, false: colors.border }}
          disabled={!storeSettings || updateStoreSettings.isPending}
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Today's Orders" value={String(summary.todayOrders)} accent />
        <StatCard label="Today's Revenue" value={formatCurrency(summary.todayRevenue)} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard label="Pending Orders" value={String(summary.pendingOrders)} />
        <StatCard label="Menu Items" value={String(summary.totalProducts)} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard label="Rating" value={`⭐ ${summary.averageRating.toFixed(1)} (${summary.reviewCount})`} />
        <StatCard label="Catering Requests" value={String(summary.pendingCateringRequests)} />
      </View>

      <View style={styles.quickLinks}>
        <Pressable style={styles.quickLink} onPress={() => router.push("/(vendor)/orders")}>
          <Text style={styles.quickLinkText}>View incoming orders →</Text>
        </Pressable>
        <Pressable style={styles.quickLink} onPress={() => router.push("/(vendor)/menu")}>
          <Text style={styles.quickLinkText}>Manage your menu →</Text>
        </Pressable>
        {summary.pendingCateringRequests > 0 ? (
          <Pressable style={styles.quickLink} onPress={() => router.push("/(vendor)/catering-requests")}>
            <Text style={styles.quickLinkText}>Review catering requests →</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.md },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: colors.background },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  headerRow: { marginBottom: spacing.xs },
  greeting: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  storeStatusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  storeStatusLabel: { fontSize: typography.size.xs, color: colors.textSecondary },
  storeStatusValue: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary, marginTop: 2 },
  statsGrid: { flexDirection: "row", gap: spacing.md },
  quickLinks: { gap: spacing.sm, marginTop: spacing.md },
  quickLink: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  quickLinkText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.primary },
});
