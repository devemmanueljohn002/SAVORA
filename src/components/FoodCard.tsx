import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import type { Product } from "@/types";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

interface FoodCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onAdd?: (product: Product) => void;
}

export function FoodCard({ product, onPress, onAdd }: FoodCardProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress?.(product)}
      accessibilityRole="button"
      accessibilityLabel={product.name}
    >
      <Image
        source={product.imageUrl ? { uri: product.imageUrl } : undefined}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        {product.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {onAdd ? (
            <Pressable
              style={[styles.addButton, !product.isAvailable && styles.addButtonDisabled]}
              onPress={(e) => {
                e.stopPropagation();
                if (product.isAvailable) onAdd(product);
              }}
              disabled={!product.isAvailable}
              hitSlop={8}
            >
              <Text style={styles.addButtonText}>{product.isAvailable ? "Add" : "Unavailable"}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadow.card,
  },
  image: { width: 96, height: 96, backgroundColor: colors.surface },
  body: { flex: 1, padding: spacing.md, gap: 4, justifyContent: "center" },
  name: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  description: { fontSize: typography.size.xs, color: colors.textSecondary },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xs },
  price: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  addButtonDisabled: { backgroundColor: colors.border },
  addButtonText: { color: colors.textInverse, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
});
