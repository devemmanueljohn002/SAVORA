import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { useVendorProducts, useSetProductAvailability } from "@/hooks/useVendorProducts";
import { MenuItemRow } from "@/components/MenuItemRow";
import { colors, spacing, radii, typography } from "@/constants/theme";
import type { Product } from "@/types";

export default function VendorMenu() {
  const { data: products, isLoading, isError, refetch, isRefetching } = useVendorProducts();
  const setAvailability = useSetProductAvailability();

  const handleToggleAvailability = (product: Product, isAvailable: boolean) => {
    setAvailability.mutate(
      { id: product.id, isAvailable },
      { onError: () => Alert.alert("Couldn't update", "Please try again.") }
    );
  };

  // Group by category so the vendor sees the same structure customers do.
  const grouped = (products ?? []).reduce<Record<string, Product[]>>((acc, product) => {
    (acc[product.category] ??= []).push(product);
    return acc;
  }, {});
  const sections = Object.entries(grouped);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Menu</Text>
        <Pressable style={styles.addButton} onPress={() => router.push({ pathname: "/(vendor)/menu/[id]", params: { id: "new" } })}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Couldn't load your menu</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.errorSubtitle}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={([category]) => category}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item: [category, items] }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{category}</Text>
              {items.map((product) => (
                <MenuItemRow
                  key={product.id}
                  product={product}
                  onPress={(p) => router.push({ pathname: "/(vendor)/menu/[id]", params: { id: p.id } })}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No menu items yet</Text>
              <Text style={styles.emptySubtitle}>Add your first item to start receiving orders.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  addButton: { backgroundColor: colors.primary, borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  addButtonText: { color: colors.textInverse, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  listContent: { padding: spacing.xl, paddingTop: 0, flexGrow: 1 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textSecondary, textTransform: "uppercase", marginBottom: spacing.xs },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxxl },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  emptyTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  emptySubtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center" },
});
