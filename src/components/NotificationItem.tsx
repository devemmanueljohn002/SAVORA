import { View, Text, Pressable, StyleSheet } from "react-native";
import type { AppNotification, NotificationType } from "@/types";
import { colors, spacing, radii, typography } from "@/constants/theme";

interface NotificationItemProps {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
}

const ICONS: Record<NotificationType, string> = {
  ORDER_UPDATE: "🛵",
  PROMOTION: "🎉",
  DISCOUNT: "🏷️",
  CATERING_UPDATE: "🍽️",
  PAYMENT: "💳",
  ACCOUNT: "👤",
};

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  return (
    <Pressable
      style={[styles.container, !notification.isRead && styles.containerUnread]}
      onPress={() => onPress?.(notification)}
      accessibilityRole="button"
    >
      <Text style={styles.icon}>{ICONS[notification.type]}</Text>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.time}>{timeAgo(notification.createdAt)}</Text>
      </View>
      {!notification.isRead ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  containerUnread: { backgroundColor: colors.surface },
  icon: { fontSize: typography.size.lg },
  body: { flex: 1, gap: 2 },
  title: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  message: { fontSize: typography.size.xs, color: colors.textSecondary },
  time: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: radii.full, backgroundColor: colors.primary, marginTop: 6 },
});
