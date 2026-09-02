import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import type { CateringProvider } from "@/types";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";
import { RatingStars } from "@/components/RatingStars";

interface CateringProviderCardProps {
  provider: CateringProvider;
}

export function CateringProviderCard({ provider }: CateringProviderCardProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/(customer)/catering/${provider.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`View ${provider.name}`}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={provider.coverImageUrl ? { uri: provider.coverImageUrl } : undefined}
          style={styles.image}
          contentFit="cover"
          transition={150}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {provider.name}
        </Text>
        <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} />
        <Text style={styles.services} numberOfLines={1}>
          {provider.serviceTypes.join(" • ")}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{provider.location}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>From {formatCurrency(provider.startingPrice)}</Text>
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
  body: { padding: spacing.md, gap: 4 },
  name: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  services: { fontSize: typography.size.sm, color: colors.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 2 },
  metaText: { fontSize: typography.size.xs, color: colors.textSecondary },
  metaDot: { fontSize: typography.size.xs, color: colors.textSecondary },
});
