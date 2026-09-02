import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { router, Stack } from "expo-router";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/NotificationItem";
import { colors, spacing, typography } from "@/constants/theme";
import type { AppNotification } from "@/types";

export default function Notifications() {
  const { data, isLoading, isError, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationRead();

  const handlePress = (notification: AppNotification) => {
    if (!notification.isRead) markRead.mutate(notification.id);
    if (notification.relatedOrderId) {
      router.push({ pathname: "/(customer)/order/[id]", params: { id: notification.relatedOrderId } });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Notifications" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Notifications" }} />
        <Text style={styles.errorTitle}>Couldn't load notifications</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Notifications" }} />
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isRefetching}
        renderItem={({ item }) => <NotificationItem notification={item} onPress={handlePress} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>Order updates and promotions will show up here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.lg, flexGrow: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxxl },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  emptyTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  emptySubtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center" },
});
