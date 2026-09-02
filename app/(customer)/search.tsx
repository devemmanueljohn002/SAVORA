import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearch } from "@/hooks/useSearch";
import { useRecentSearchesStore } from "@/stores/recentSearchesStore";
import { SearchBar } from "@/components/SearchBar";
import { VendorCard } from "@/components/VendorCard";
import { FoodCard } from "@/components/FoodCard";
import { colors, spacing, typography } from "@/constants/theme";

const POPULAR_SEARCHES = ["Jollof Rice", "Suya", "Shawarma", "Pounded Yam", "Pizza", "Amala"];

export default function Search() {
  // A category tile on Home can deep-link in with a pre-filled query, e.g. "Rice".
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState(params.category ?? "");
  const debouncedQuery = useDebouncedValue(query, 350);

  const recentTerms = useRecentSearchesStore((s) => s.terms);
  const addRecentTerm = useRecentSearchesStore((s) => s.add);
  const removeRecentTerm = useRecentSearchesStore((s) => s.remove);

  const { data, isLoading, isFetching, isError, refetch } = useSearch({ query: debouncedQuery });

  const hasQuery = debouncedQuery.trim().length >= 2;
  const showSuggestions = !hasQuery;

  const handleSubmit = () => {
    if (query.trim().length >= 2) addRecentTerm(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar value={query} onChangeText={setQuery} onSubmit={handleSubmit} autoFocus />
      </View>

      {showSuggestions ? (
        <View style={styles.suggestionsContainer}>
          {recentTerms.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
              </View>
              <View style={styles.chipRow}>
                {recentTerms.map((term) => (
                  <Pressable key={term} style={styles.chip} onPress={() => setQuery(term)}>
                    <Text style={styles.chipText}>{term}</Text>
                    <Pressable onPress={() => removeRecentTerm(term)} hitSlop={8}>
                      <Text style={styles.chipRemove}>✕</Text>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.chipRow}>
              {POPULAR_SEARCHES.map((term) => (
                <Pressable key={term} style={styles.chipStatic} onPress={() => setQuery(term)}>
                  <Text style={styles.chipText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle} onPress={() => refetch()}>
            Tap to retry
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(data?.vendors.length ? [{ type: "vendors-header" as const }] : []),
            ...(data?.vendors.map((v) => ({ type: "vendor" as const, vendor: v })) ?? []),
            ...(data?.products.length ? [{ type: "products-header" as const }] : []),
            ...(data?.products.map((p) => ({ type: "product" as const, product: p })) ?? []),
          ]}
          keyExtractor={(item, index) =>
            item.type === "vendor" ? `v-${item.vendor.id}` : item.type === "product" ? `p-${item.product.id}` : `${item.type}-${index}`
          }
          contentContainerStyle={styles.resultsContent}
          onRefresh={refetch}
          refreshing={isFetching}
          renderItem={({ item }) => {
            if (item.type === "vendors-header") return <Text style={styles.resultsSectionTitle}>Vendors</Text>;
            if (item.type === "products-header") return <Text style={styles.resultsSectionTitle}>Meals</Text>;
            if (item.type === "vendor") return <VendorCard vendor={item.vendor} />;
            return <FoodCard product={item.product} />;
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No results for "{debouncedQuery}"</Text>
              <Text style={styles.emptySubtitle}>Try a different search term or browse categories instead.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
  suggestionsContainer: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipStatic: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: typography.size.sm, color: colors.textPrimary },
  chipRemove: { fontSize: typography.size.xs, color: colors.textSecondary },
  resultsContent: { padding: spacing.xl, gap: spacing.md },
  resultsSectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginTop: spacing.sm,
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxxl },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  emptyTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary, textAlign: "center" },
  emptySubtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center" },
});
