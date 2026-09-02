import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { useCateringProviders } from "@/hooks/useCatering";
import { CateringProviderCard } from "@/components/CateringProviderCard";
import { colors, spacing, radii, typography } from "@/constants/theme";
import type { CateringServiceType } from "@/types";

const SERVICE_TYPES: CateringServiceType[] = [
  "Weddings",
  "Birthdays",
  "Corporate Events",
  "Parties",
  "Meetings",
  "Religious Events",
  "School Events",
  "Outdoor Events",
];

export default function CateringIndex() {
  const [serviceType, setServiceType] = useState<CateringServiceType | null>(null);
  const { data, isLoading, isError, refetch, isRefetching } = useCateringProviders(
    serviceType ? { serviceType } : {}
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Catering" }} />
      <Text style={styles.title}>Catering</Text>
      <Text style={styles.subtitle}>Find caterers for weddings, parties, corporate events, and more.</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={SERVICE_TYPES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.filterChip, serviceType === item && styles.filterChipActive]}
            onPress={() => setServiceType((current) => (current === item ? null : item))}
          >
            <Text style={[styles.filterChipText, serviceType === item && styles.filterChipTextActive]}>{item}</Text>
          </Pressable>
        )}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Couldn't load caterers</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.errorSubtitle}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data?.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => <CateringProviderCard provider={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No caterers found</Text>
              <Text style={styles.emptySubtitle}>Try a different service type.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  subtitle: { fontSize: typography.size.sm, color: colors.textSecondary, paddingHorizontal: spacing.xl, marginTop: spacing.xs },
  filterRow: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.medium },
  filterChipTextActive: { color: colors.textInverse },
  listContent: { padding: spacing.xl, paddingTop: 0 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxxl },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  emptyTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  emptySubtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs },
});
