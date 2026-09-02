import { Tabs } from "expo-router";
import { colors, typography } from "@/constants/theme";

/**
 * Bottom navigation per spec section 33. Icons intentionally omitted in
 * Phase 1 — lucide-react-native or a custom icon set gets wired in Phase 3
 * alongside the design system components (spec section 55).
 */
export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Explore" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      {/* Reachable via navigation, deliberately hidden from the tab bar */}
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="vendor/[id]" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="addresses" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
      <Tabs.Screen name="order/tracking" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="catering/index" options={{ href: null }} />
      <Tabs.Screen name="catering/[id]" options={{ href: null }} />
      <Tabs.Screen name="catering/booking" options={{ href: null }} />
    </Tabs>
  );
}
