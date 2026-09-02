import { View, Text, Pressable, Switch, StyleSheet } from "react-native";
import { Image } from "expo-image";
import type { Product } from "@/types";
import { colors, spacing, radii, typography } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

interface MenuItemRowProps {
  product: Product;
  onPress: (product: Product) => void;
  onToggleAvailability: (product: Product, isAvailable: boolean) => void;
}

export function MenuItemRow({ product, onPress, onToggleAvailability }: MenuItemRowProps) {
  return (
    <Pressable style={styles.container} onPress={() => onPress(product)} accessibilityRole="button">
      <Image
        source={product.imageUrl ? { uri: product.imageUrl } : undefined}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
      </View>
      <Switch
        value={product.isAvailable}
        onValueChange={(value) => onToggleAvailability(product, value)}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  image: { width: 56, height: 56, borderRadius: radii.md, backgroundColor: colors.surface },
  body: { flex: 1, gap: 2 },
  name: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  category: { fontSize: typography.size.xs, color: colors.textSecondary },
  price: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textPrimary },
});
