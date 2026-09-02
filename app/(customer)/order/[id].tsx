import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, TextInput, Alert } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useOrder } from "@/hooks/useOrders";
import { useSubmitReview } from "@/hooks/useReviews";
import { useReorderCheck, applyReorderToCart } from "@/hooks/useReorder";
import { Badge } from "@/components/Badge";
import { StarRatingInput } from "@/components/StarRatingInput";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

/**
 * Doubles as both the post-checkout "Order Confirmed!" screen (spec section 21)
 * and the general order-detail view (spec section 23) — same data, and a
 * freshly created order naturally reads as a confirmation on first view.
 */
export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const submitReview = useSubmitReview();
  const reorderCheck = useReorderCheck();

  const [vendorRating, setVendorRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment, setComment] = useState("");

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Order" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Order" }} />
        <Text style={styles.errorTitle}>Couldn't load this order</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  const isFreshlyPlaced = order.status === "PLACED" || order.status === "PAYMENT_CONFIRMED";
  const isDelivered = order.status === "DELIVERED";
  const isCancelled = order.status === "CANCELLED";

  const handleSubmitReview = () => {
    if (vendorRating === 0 || foodRating === 0 || deliveryRating === 0) {
      Alert.alert("Rate every category", "Please rate the vendor, food, and delivery before submitting.");
      return;
    }
    submitReview.mutate(
      { orderId: order.id, vendorRating, foodRating, deliveryRating, comment: comment.trim() || undefined },
      {
        onError: (error) => {
          const message = (error as { message?: string })?.message ?? "Couldn't submit your review. Please try again.";
          Alert.alert("Something went wrong", message);
        },
      }
    );
  };

  const handleReorder = () => {
    reorderCheck.mutate(order.id, {
      onSuccess: (result) => {
        if (!result.vendorIsOpen) {
          Alert.alert("Vendor is closed", `${order.vendorName} isn't accepting orders right now. Please try again later.`);
          return;
        }
        applyReorderToCart(order);
        router.push("/(customer)/cart");
      },
      onError: (error) => {
        const message = (error as { message?: string })?.message ?? "Couldn't check this order right now. Please try again.";
        Alert.alert("Something went wrong", message);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Order #${order.orderNumber}` }} />
      <ScrollView contentContainerStyle={styles.content}>
        {isFreshlyPlaced ? (
          <View style={styles.confirmationBanner}>
            <Text style={styles.confirmationEmoji}>🎉</Text>
            <Text style={styles.confirmationTitle}>Order Confirmed!</Text>
            <Text style={styles.confirmationSubtitle}>
              {order.paymentStatus === "PAID" ? "Payment received. " : ""}
              {order.vendorName} is getting your order ready.
            </Text>
          </View>
        ) : (
          <Badge label={statusLabel(order.status)} tone={statusTone(order.status)} />
        )}

        <View style={styles.card}>
          <Row label="Order number" value={order.orderNumber} />
          <Row label="Vendor" value={order.vendorName} />
          <Row label="Payment" value={`${paymentLabel(order.paymentMethod)} • ${order.paymentStatus}`} />
          <Row label="Delivery address" value={`${order.deliveryAddress.fullAddress}, ${order.deliveryAddress.city}`} />
          {order.estimatedDeliveryAt ? <Row label="Estimated delivery" value={order.estimatedDeliveryAt} /> : null}
        </View>

        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.card}>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{item.quantity}×</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.productName}
              </Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
          <Row label="Delivery fee" value={formatCurrency(order.deliveryFee)} />
          <Row label="Service fee" value={formatCurrency(order.serviceFee)} />
          {order.discount > 0 ? <Row label="Discount" value={`-${formatCurrency(order.discount)}`} /> : null}
          <Row label="Total" value={formatCurrency(order.total)} bold />
        </View>

        {isDelivered ? (
          order.hasReview || submitReview.isSuccess ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitleInline}>Thanks for your review!</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Rate Your Order</Text>
              <StarRatingInput label="Vendor" value={vendorRating} onChange={setVendorRating} />
              <StarRatingInput label="Food" value={foodRating} onChange={setFoodRating} />
              <StarRatingInput label="Delivery" value={deliveryRating} onChange={setDeliveryRating} />
              <TextInput
                style={styles.commentInput}
                placeholder="Tell us more (optional)"
                placeholderTextColor={colors.textSecondary}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <Pressable style={styles.reviewSubmitButton} onPress={handleSubmitReview} disabled={submitReview.isPending}>
                {submitReview.isPending ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.reviewSubmitButtonText}>Submit Review</Text>
                )}
              </Pressable>
            </View>
          )
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {isDelivered || isCancelled ? (
          <Pressable style={styles.primaryButton} onPress={handleReorder} disabled={reorderCheck.isPending}>
            {reorderCheck.isPending ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.primaryButtonText}>Reorder</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push({ pathname: "/(customer)/order/tracking", params: { id: order.id } })}
          >
            <Text style={styles.primaryButtonText}>Track Order</Text>
          </Pressable>
        )}
        <Pressable style={styles.secondaryButton} onPress={() => router.replace("/(customer)/home")}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

function statusTone(status: string): "success" | "danger" | "warning" | "primary" {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
  return "primary";
}

function paymentLabel(method: string): string {
  return method
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl * 3 },
  confirmationBanner: { alignItems: "center", gap: spacing.xs, paddingVertical: spacing.lg },
  confirmationEmoji: { fontSize: 40 },
  confirmationTitle: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  confirmationSubtitle: { fontSize: typography.size.sm, color: colors.textSecondary, textAlign: "center" },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  sectionTitleInline: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.success, textAlign: "center" },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: "top",
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  reviewSubmitButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.md, alignItems: "center" },
  reviewSubmitButtonText: { color: colors.textInverse, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  rowLabel: { fontSize: typography.size.sm, color: colors.textSecondary },
  rowLabelBold: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  rowValue: { fontSize: typography.size.sm, color: colors.textPrimary, flexShrink: 1, textAlign: "right" },
  rowValueBold: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  itemQuantity: { fontSize: typography.size.sm, color: colors.textSecondary, width: 28 },
  itemName: { flex: 1, fontSize: typography.size.sm, color: colors.textPrimary },
  itemPrice: { fontSize: typography.size.sm, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadow.card,
  },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center" },
  primaryButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  secondaryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center" },
  secondaryButtonText: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
