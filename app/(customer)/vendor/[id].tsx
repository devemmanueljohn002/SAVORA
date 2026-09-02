import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useVendor } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";
import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/Badge";
import { FoodCard } from "@/components/FoodCard";
import { CartBar } from "@/components/CartBar";
import { colors, spacing, radii, typography } from "@/constants/theme";
import { formatCurrency, formatDeliveryTime } from "@/utils/format";
import type { Product } from "@/types";

export default function VendorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: vendor, isLoading: vendorLoading, isError: vendorError } = useVendor(id);
  const { data: productsPage, isLoading: productsLoading } = useProducts({ vendorId: id });
  const [activeCategory, setActiveCategory] = useState<string>("Popular");
  const addItem = useCartStore((s) => s.addItem);
  const replaceVendorCart = useCartStore((s) => s.replaceVendorCart);

  const productsByCategory = useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const product of productsPage?.data ?? []) {
      const list = groups.get(product.category) ?? [];
      list.push(product);
      groups.set(product.category, list);
    }
    return groups;
  }, [productsPage]);

  const categories = useMemo(() => Array.from(productsByCategory.keys()), [productsByCategory]);
  const visibleProducts = productsByCategory.get(activeCategory) ?? productsPage?.data ?? [];

  const handleAddToCart = (product: Product) => {
    if (!vendor) return;
    const result = addItem({
      productId: product.id,
      vendorId: vendor.id,
      vendorName: vendor.name,
      productName: product.name,
      imageUrl: product.imageUrl,
      basePrice: product.price,
      quantity: 1,
    });

    if (!result.ok && result.reason === "VENDOR_CONFLICT") {
      Alert.alert(
        "Start a new cart?",
        "Your cart has items from another vendor. Adding this item will clear your current cart.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear cart & add",
            style: "destructive",
            onPress: () => {
              replaceVendorCart(vendor.id, vendor.name);
              addItem({
                productId: product.id,
                vendorId: vendor.id,
                vendorName: vendor.name,
                productName: product.name,
                imageUrl: product.imageUrl,
                basePrice: product.price,
                quantity: 1,
              });
            },
          },
        ]
      );
    }
  };

  if (vendorLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (vendorError || !vendor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn't load this vendor</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.errorSubtitle}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        <View style={styles.coverWrapper}>
          <Image
            source={vendor.coverImageUrl ? { uri: vendor.coverImageUrl } : undefined}
            style={styles.cover}
            contentFit="cover"
          />
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{vendor.name}</Text>
            <Badge label={vendor.isOpen ? "Open" : "Closed"} tone={vendor.isOpen ? "success" : "danger"} />
          </View>
          <RatingStars rating={vendor.rating} reviewCount={vendor.reviewCount} size="md" />
          <Text style={styles.cuisine}>{vendor.cuisine.join(" • ")}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formatDeliveryTime(vendor.deliveryTimeMinutes)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{formatCurrency(vendor.deliveryFee)} delivery</Text>
          </View>

          {vendor.openingHours ? <Text style={styles.hours}>Open {vendor.openingHours}</Text> : null}
          {vendor.address ? <Text style={styles.address}>{vendor.address}</Text> : null}
          {vendor.about ? <Text style={styles.about}>{vendor.about}</Text> : null}
        </View>

        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs} contentContainerStyle={styles.categoryTabsContent}>
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[styles.categoryTab, activeCategory === category && styles.categoryTabActive]}
                onPress={() => setActiveCategory(category)}
              >
                <Text style={[styles.categoryTabText, activeCategory === category && styles.categoryTabTextActive]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.menuSection}>
          {productsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : visibleProducts.length === 0 ? (
            <Text style={styles.emptyMenuText}>No items in this category yet.</Text>
          ) : (
            visibleProducts.map((product) => (
              <View key={product.id} style={styles.foodCardWrapper}>
                <FoodCard product={product} onAdd={handleAddToCart} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <CartBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.sm },
  coverWrapper: { height: 200, backgroundColor: colors.surface },
  cover: { width: "100%", height: "100%" },
  backButton: {
    position: "absolute",
    top: spacing.xl,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: { fontSize: typography.size.xl, color: colors.textPrimary, marginTop: -2 },
  infoSection: { padding: spacing.xl, gap: spacing.xs },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.textPrimary, flexShrink: 1 },
  cuisine: { fontSize: typography.size.sm, color: colors.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  metaText: { fontSize: typography.size.sm, color: colors.textSecondary },
  metaDot: { fontSize: typography.size.sm, color: colors.textSecondary },
  hours: { fontSize: typography.size.sm, color: colors.textPrimary, marginTop: spacing.sm },
  address: { fontSize: typography.size.sm, color: colors.textSecondary },
  about: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  categoryTabs: { marginTop: spacing.md },
  categoryTabsContent: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryTabText: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.medium },
  categoryTabTextActive: { color: colors.textInverse },
  menuSection: { padding: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.md },
  foodCardWrapper: {},
  emptyMenuText: { fontSize: typography.size.sm, color: colors.textSecondary, textAlign: "center", marginTop: spacing.xl },
});
