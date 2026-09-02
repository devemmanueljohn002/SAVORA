import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { useNotifications } from "@/hooks/useNotifications";
import { CategoryCard } from "@/components/CategoryCard";
import { VendorCard } from "@/components/VendorCard";
import { SearchBar } from "@/components/SearchBar";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: vendorsPage, isLoading: vendorsLoading, isError: vendorsError, refetch: refetchVendors } = useVendors();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.data.filter((n) => !n.isRead).length ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Good day, {firstName} 👋</Text>
          <Text style={styles.deliveryLabel}>Delivering to</Text>
          <Text style={styles.deliveryLocation}>Set your address</Text>
        </View>
        <Pressable
          style={styles.bellButton}
          onPress={() => router.push("/(customer)/notifications")}
          accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 ? (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Pressable onPress={() => router.push("/(customer)/search")}>
        <View pointerEvents="none">
          <SearchBar value="" onChangeText={() => {}} placeholder="Search meals, vendors, cuisines" />
        </View>
      </Pressable>

      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>20% OFF your first order</Text>
        <Text style={styles.heroSubtitle}>Use code SAVORA20 at checkout</Text>
      </View>

      <Pressable style={styles.cateringBanner} onPress={() => router.push("/(customer)/catering")}>
        <View>
          <Text style={styles.cateringTitle}>Planning an event?</Text>
          <Text style={styles.cateringSubtitle}>Book a caterer for weddings, parties & more</Text>
        </View>
        <Text style={styles.cateringArrow}>›</Text>
      </Pressable>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <Pressable onPress={() => router.push("/(customer)/categories")}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      {categoriesLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => <CategoryCard category={item} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No categories yet.</Text>}
        />
      )}

      <Text style={styles.sectionTitle}>Popular Near You</Text>
      {vendorsLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : vendorsError ? (
        <Pressable onPress={() => refetchVendors()}>
          <Text style={styles.errorText}>Couldn't load vendors. Tap to retry.</Text>
        </Pressable>
      ) : vendorsPage?.data.length ? (
        <View style={styles.vendorList}>
          {vendorsPage.data.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No vendors near you yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.lg },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bellButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  bellIcon: { fontSize: typography.size.xl },
  bellBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: colors.textInverse, fontSize: 9, fontWeight: typography.weight.bold },
  greeting: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  deliveryLabel: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: spacing.sm },
  deliveryLocation: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.textPrimary },
  heroBanner: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadow.card,
  },
  heroTitle: { color: colors.textInverse, fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  heroSubtitle: { color: colors.textInverse, fontSize: typography.size.sm, marginTop: spacing.xs, opacity: 0.9 },
  cateringBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cateringTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  cateringSubtitle: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
  cateringArrow: { fontSize: typography.size.xxl, color: colors.textSecondary },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  seeAll: { fontSize: typography.size.sm, color: colors.primary, fontWeight: typography.weight.medium },
  categoryList: { gap: spacing.md, paddingVertical: spacing.xs },
  vendorList: { gap: spacing.md },
  emptyText: { fontSize: typography.size.sm, color: colors.textSecondary },
  errorText: { fontSize: typography.size.sm, color: colors.primary },
});
