import { Tabs } from "expo-router";
import { colors, typography } from "@/constants/theme";

/**
 * Vendor app shell (spec section 34). The full vendor feature list —
 * Dashboard, Orders, Menu, Products, Inventory, Customers, Reviews,
 * Promotions, Catering requests, Earnings, Analytics, Store settings —
 * doesn't fit a 5-item tab bar. Dashboard/Orders/Menu/Earnings get their
 * own tab; everything else (catering requests, store settings) is reachable
 * from the "More" tab rather than cluttering the bar.
 */
export default function VendorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="menu/index" options={{ title: "Menu" }} />
      <Tabs.Screen name="earnings" options={{ title: "Earnings" }} />
      <Tabs.Screen name="more" options={{ title: "More" }} />
      {/* Reachable via navigation, deliberately hidden from the tab bar */}
      <Tabs.Screen name="menu/[id]" options={{ href: null }} />
      <Tabs.Screen name="catering-requests" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
