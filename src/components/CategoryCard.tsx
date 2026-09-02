import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import type { Category } from "@/types";
import { colors, spacing, radii, typography } from "@/constants/theme";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push({ pathname: "/(customer)/search", params: { category: category.name } })}
      accessibilityRole="button"
      accessibilityLabel={category.name}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={category.imageUrl ? { uri: category.imageUrl } : undefined}
          style={styles.image}
          contentFit="cover"
          transition={150}
        />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: 76, alignItems: "center", gap: spacing.xs },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  name: { fontSize: typography.size.xs, color: colors.textPrimary, textAlign: "center" },
});
