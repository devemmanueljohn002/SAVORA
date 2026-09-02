import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/constants/theme";

export default function Index() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === "idle" || status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (status === "authenticated") {
    // Role-aware navigation (spec section 37) — backend remains the source of
    // truth for what a role can actually do; this only decides which app
    // shell to land the person in after login/hydration.
    if (user?.role === "VENDOR") {
      return <Redirect href="/(vendor)/dashboard" />;
    }
    // RIDER and ADMIN app shells aren't built yet (Phases 8/backend admin
    // dashboard) — fall back to the customer app rather than a dead route.
    return <Redirect href="/(customer)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
