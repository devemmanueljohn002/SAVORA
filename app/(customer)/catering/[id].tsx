import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCateringProvider } from "@/hooks/useCatering";
import { RatingStars } from "@/components/RatingStars";
import { colors, spacing, radii, typography } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

export default function CateringProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: provider, isLoading, isError, refetch } = useCateringProvider(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Catering" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !provider) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Catering" }} />
        <Text style={styles.errorTitle}>Couldn't load this provider</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: provider.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.coverWrapper}>
          <Image
            source={provider.coverImageUrl ? { uri: provider.coverImageUrl } : undefined}
            style={styles.cover}
            contentFit="cover"
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.name}>{provider.name}</Text>
          <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} size="md" />
          <Text style={styles.services}>{provider.serviceTypes.join(" • ")}</Text>
          <Text style={styles.location}>{provider.location}</Text>
          {provider.description ? <Text style={styles.description}>{provider.description}</Text> : null}
        </View>

        {provider.packages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Packages</Text>
            {provider.packages.map((pkg) => (
              <View key={pkg.id} style={styles.packageCard}>
                <View style={styles.packageHeaderRow}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>
                    {pkg.pricePerHead ? `${formatCurrency(pkg.pricePerHead)}/head` : pkg.flatPrice ? formatCurrency(pkg.flatPrice) : "Custom"}
                  </Text>
                </View>
                {pkg.description ? <Text style={styles.packageDescription}>{pkg.description}</Text> : null}
                {pkg.minGuests ? <Text style={styles.packageMeta}>Minimum {pkg.minGuests} guests</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {provider.galleryUrls && provider.galleryUrls.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
              {provider.galleryUrls.map((url, index) => (
                <Image key={`${url}-${index}`} source={{ uri: url }} style={styles.galleryImage} contentFit="cover" />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.requestButton}
          onPress={() => router.push({ pathname: "/(customer)/catering/booking", params: { providerId: provider.id, providerName: provider.name } })}
        >
          <Text style={styles.requestButtonText}>Request Catering Quote</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.xs },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  content: { paddingBottom: spacing.xxxl * 2 },
  coverWrapper: { height: 200, backgroundColor: colors.surface },
  cover: { width: "100%", height: "100%" },
  infoSection: { padding: spacing.xl, gap: spacing.xs },
  name: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  services: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs },
  location: { fontSize: typography.size.sm, color: colors.textSecondary },
  description: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.lg, gap: spacing.sm },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  packageCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, gap: 4 },
  packageHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  packageName: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  packagePrice: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.primary },
  packageDescription: { fontSize: typography.size.sm, color: colors.textSecondary },
  packageMeta: { fontSize: typography.size.xs, color: colors.textSecondary },
  galleryRow: { gap: spacing.sm },
  galleryImage: { width: 140, height: 100, borderRadius: radii.md, backgroundColor: colors.surface },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requestButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center" },
  requestButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
