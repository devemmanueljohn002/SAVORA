import { useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Animated, Pressable } from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useOrderTracking } from "@/hooks/useOrders";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import type { OrderStatus } from "@/types";

const STAGES: { status: OrderStatus; label: string }[] = [
  { status: "PLACED", label: "Order Placed" },
  { status: "PAYMENT_CONFIRMED", label: "Payment Confirmed" },
  { status: "VENDOR_ACCEPTED", label: "Vendor Accepted" },
  { status: "PREPARING", label: "Food Preparing" },
  { status: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { status: "RIDER_ASSIGNED", label: "Rider Assigned" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tracking, isLoading, isError, refetch } = useOrderTracking(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Track Order" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !tracking) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Track Order" }} />
        <Text style={styles.errorTitle}>Couldn't load tracking info</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  if (tracking.status === "CANCELLED") {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Track Order" }} />
        <Text style={styles.errorTitle}>This order was cancelled</Text>
        <Pressable onPress={() => router.replace(`/(customer)/order/${tracking.orderId}`)}>
          <Text style={styles.errorSubtitle}>View order details</Text>
        </Pressable>
      </View>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.status === tracking.status);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Track Order" }} />
      <ScrollView contentContainerStyle={styles.content}>
        {tracking.estimatedDeliveryAt ? (
          <View style={styles.etaCard}>
            <Text style={styles.etaLabel}>Estimated arrival</Text>
            <Text style={styles.etaValue}>{tracking.estimatedDeliveryAt}</Text>
          </View>
        ) : null}

        <View style={styles.stagesList}>
          {STAGES.map((stage, index) => (
            <TrackingStage
              key={stage.status}
              label={stage.label}
              isComplete={index < currentIndex}
              isCurrent={index === currentIndex}
              isLast={index === STAGES.length - 1}
            />
          ))}
        </View>

        {tracking.rider ? (
          <View style={styles.riderCard}>
            <Image
              source={tracking.rider.photoUrl ? { uri: tracking.rider.photoUrl } : undefined}
              style={styles.riderPhoto}
              contentFit="cover"
            />
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>{tracking.rider.name}</Text>
              <Text style={styles.riderMeta}>
                ⭐ {tracking.rider.rating.toFixed(1)} • {tracking.rider.vehicle}
              </Text>
            </View>
            <Pressable style={styles.callButton} accessibilityLabel={`Call ${tracking.rider.name}`}>
              <Text style={styles.callButtonText}>Call</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function TrackingStage({
  label,
  isComplete,
  isCurrent,
  isLast,
}: {
  label: string;
  isComplete: boolean;
  isCurrent: boolean;
  isLast: boolean;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isCurrent) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isCurrent, pulse]);

  const active = isComplete || isCurrent;

  return (
    <View style={styles.stageRow}>
      <View style={styles.stageIndicatorColumn}>
        <Animated.View
          style={[
            styles.stageDot,
            active && styles.stageDotActive,
            isCurrent && { transform: [{ scale: pulse }] },
          ]}
        />
        {!isLast ? <View style={[styles.stageLine, isComplete && styles.stageLineActive]} /> : null}
      </View>
      <Text style={[styles.stageLabel, active && styles.stageLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.xl },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.xs },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  etaCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  etaLabel: { color: colors.textInverse, fontSize: typography.size.xs, opacity: 0.85 },
  etaValue: { color: colors.textInverse, fontSize: typography.size.lg, fontWeight: typography.weight.bold, marginTop: 2 },
  stagesList: { gap: 0 },
  stageRow: { flexDirection: "row", alignItems: "flex-start", minHeight: 48 },
  stageIndicatorColumn: { width: 24, alignItems: "center" },
  stageDot: {
    width: 14,
    height: 14,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  stageDotActive: { backgroundColor: colors.primary },
  stageLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2 },
  stageLineActive: { backgroundColor: colors.primary },
  stageLabel: {
    marginLeft: spacing.md,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stageLabelActive: { color: colors.textPrimary, fontWeight: typography.weight.semibold },
  riderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  riderPhoto: { width: 48, height: 48, borderRadius: radii.full, backgroundColor: colors.border },
  riderInfo: { flex: 1 },
  riderName: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  riderMeta: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
  callButton: { backgroundColor: colors.primary, borderRadius: radii.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  callButtonText: { color: colors.textInverse, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
});
