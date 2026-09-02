import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/constants/theme";

/** Phase 1 placeholder — built out in later phases per the spec. */
export default function Favorites() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>favorites</Text>
      <Text style={styles.subtitle}>Coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary, textTransform: "capitalize" },
  subtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs },
});
