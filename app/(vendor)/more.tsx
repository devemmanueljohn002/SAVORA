import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { colors, spacing, radii, typography } from "@/constants/theme";

export default function VendorMore() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    Alert.alert("Log out?", "You'll need to log in again to access your vendor dashboard.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>{user?.fullName}</Text>

      <View style={styles.menu}>
        <MenuLink label="Store Settings" onPress={() => router.push("/(vendor)/settings")} />
        <MenuLink label="Catering Requests" onPress={() => router.push("/(vendor)/catering-requests")} />
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

function MenuLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.menuLink} onPress={onPress}>
      <Text style={styles.menuLinkText}>{label}</Text>
      <Text style={styles.menuLinkArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  menu: { borderRadius: radii.lg, backgroundColor: colors.surface, overflow: "hidden" },
  menuLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLinkText: { fontSize: typography.size.md, color: colors.textPrimary },
  menuLinkArrow: { fontSize: typography.size.lg, color: colors.textSecondary },
  logoutButton: { marginTop: spacing.xxl, alignItems: "center", padding: spacing.md },
  logoutText: { color: colors.danger, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
