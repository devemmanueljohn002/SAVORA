import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { useVendorEarnings } from "@/hooks/useVendorEarnings";
import { Badge } from "@/components/Badge";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

export default function VendorEarnings() {
  const { data: earnings, isLoading, isError, refetch, isRefetching } = useVendorEarnings();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !earnings) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn't load earnings</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total earnings</Text>
          <Text style={styles.summaryValue}>{formatCurrency(earnings.totalEarnings)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pending payout</Text>
          <Text style={styles.summaryValue}>{formatCurrency(earnings.pendingPayout)}</Text>
        </View>
        {earnings.lastPayoutAt ? (
          <Text style={styles.lastPayout}>Last payout: {earnings.lastPayoutAt}</Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Transactions</Text>
      <FlatList
        data={earnings.transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isRefetching}
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
            <View>
              <Text style={styles.transactionOrder}>#{item.orderNumber}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
            <View style={styles.transactionRight}>
              <Text style={styles.transactionAmount}>{formatCurrency(item.amount)}</Text>
              <Badge label={item.status} tone={item.status === "PAID" ? "success" : "warning"} />
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No transactions yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: colors.background },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  summaryCard: {
    margin: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: typography.size.sm, color: colors.textSecondary },
  summaryValue: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  lastPayout: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: spacing.xs },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary, paddingHorizontal: spacing.xl },
  listContent: { padding: spacing.xl, flexGrow: 1 },
  transactionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm },
  transactionOrder: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  transactionDate: { fontSize: typography.size.xs, color: colors.textSecondary },
  transactionRight: { alignItems: "flex-end", gap: 4 },
  transactionAmount: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border },
  emptyText: { fontSize: typography.size.sm, color: colors.textSecondary },
});
