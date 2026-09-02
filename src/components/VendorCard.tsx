import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import type { Vendor } from "@/types";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency, formatDeliveryTime, formatDistance } from "@/utils/format";
import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/Badge";

interface VendorCardProps {
  vendor: Vendor;
  onToggleFavorite?: (vendor: Vendor) => void;
}

export function VendorCard({ vendor, onToggleFavorite }: VendorCardProps) {
  const distanceLabel = formatDistance(vendor.distanceKm);

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/(customer)/vendor/${vendor.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`View ${vendor.name}`}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={vendor.coverImageUrl ? { uri: vendor.coverImageUrl } : undefined}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: "L5H2EC=PM+yV0g-mq.wG9c010J}I" }}
          transition={150}
        />
        {!vendor.isOpen ? (
          <View style={styles.closedOverlay}>
            <Badge label="Closed" tone="danger" />
          </View>
        ) : null}
        {onToggleFavorite ? (
          <Pressable
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(vendor);
            }}
            hitSlop={8}
            accessibilityLabel={vendor.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Text style={styles.favoriteIcon}>{vendor.isFavorite ? "♥" : "♡"}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {vendor.name}
        </Text>
        <RatingStars rating={vendor.rating} reviewCount={vendor.reviewCount} />
        <Text style={styles.cuisine} numberOfLines={1}>
          {vendor.cuisine.join(" • ")}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatDeliveryTime(vendor.deliveryTimeMinutes)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{formatCurrency(vendor.deliveryFee)} delivery</Text>
          {distanceLabel ? (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{distanceLabel}</Text>
            </>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadow.card,
  },
  imageWrapper: { height: 140, backgroundColor: colors.surface },
  image: { width: "100%", height: "100%" },
  closedOverlay: { position: "absolute", top: spacing.sm, left: spacing.sm },
  favoriteButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radii.full,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteIcon: { color: colors.primary, fontSize: typography.size.lg },
  body: { padding: spacing.md, gap: 4 },
  name: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  cuisine: { fontSize: typography.size.sm, color: colors.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 2 },
  metaText: { fontSize: typography.size.xs, color: colors.textSecondary },
  metaDot: { fontSize: typography.size.xs, color: colors.textSecondary },
});
