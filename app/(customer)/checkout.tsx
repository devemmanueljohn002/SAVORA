import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, Linking } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useAddresses } from "@/hooks/useAddresses";
import { useCreateOrder } from "@/hooks/useOrders";
import { paymentService } from "@/services/paymentService";
import { useCartStore } from "@/stores/cartStore";
import { AddressCard } from "@/components/AddressCard";
import { PaymentMethodCard } from "@/components/PaymentMethodCard";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";
import type { PaymentMethodType } from "@/types";

const PAYMENT_METHODS: { method: PaymentMethodType; label: string; description: string }[] = [
  { method: "paystack", label: "Paystack", description: "Pay by card via Paystack" },
  { method: "flutterwave", label: "Flutterwave", description: "Pay by card via Flutterwave" },
  { method: "bank_transfer", label: "Bank Transfer", description: "Transfer directly to Savora Food" },
  { method: "cash_on_delivery", label: "Cash on Delivery", description: "Pay the rider when your order arrives" },
];

const DELIVERY_FEE = 800; // placeholder — see note in cart.tsx
const SERVICE_FEE = 200;

export default function Checkout() {
  const params = useLocalSearchParams<{ addressId?: string }>();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(params.addressId ?? null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("paystack");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingReference, setPendingReference] = useState<string | null>(null);

  const items = useCartStore((s) => s.items);
  const vendorId = useCartStore((s) => s.vendorId);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clear);

  const createOrder = useCreateOrder();

  // Pick the default address once addresses load, unless one was already chosen.
  useEffect(() => {
    if (!selectedAddressId && addresses?.length) {
      const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (params.addressId) setSelectedAddressId(params.addressId);
  }, [params.addressId]);

  const selectedAddress = addresses?.find((a) => a.id === selectedAddressId) ?? null;
  const total = subtotal + DELIVERY_FEE + SERVICE_FEE;

  const handlePlaceOrder = async () => {
    if (!vendorId || items.length === 0) {
      Alert.alert("Your cart is empty", "Add items to your cart before checking out.");
      return;
    }
    if (!selectedAddress) {
      Alert.alert("Select a delivery address", "Choose or add a delivery address to continue.");
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        vendorId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          notes: item.notes,
        })),
        addressId: selectedAddress.id,
        paymentMethod,
      });

      if (paymentMethod === "cash_on_delivery") {
        clearCart();
        router.replace(`/(customer)/order/${order.id}`);
        return;
      }

      setIsProcessingPayment(true);
      const { reference, authorizationUrl } = await paymentService.initialize({
        orderId: order.id,
        method: paymentMethod,
      });
      setPendingReference(reference);

      if (authorizationUrl) {
        await Linking.openURL(authorizationUrl);
      }
      // User completes payment in the external checkout page/app, then taps
      // "I've completed payment" below, which triggers server-side verification.
    } catch (error) {
      setIsProcessingPayment(false);
      const message = (error as { message?: string })?.message ?? "Couldn't place your order. Please try again.";
      Alert.alert("Something went wrong", message);
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingReference) return;
    try {
      const result = await paymentService.verify(pendingReference);
      if (result.status === "PAID") {
        clearCart();
        router.replace(`/(customer)/order/${result.orderId}`);
      } else if (result.status === "PENDING") {
        Alert.alert("Still processing", "We haven't received confirmation yet. Please wait a moment and try again.");
      } else {
        Alert.alert("Payment failed", "That payment didn't go through. You can try again from your order.");
      }
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Couldn't verify payment. Please try again.";
      Alert.alert("Something went wrong", message);
    }
  };

  if (isProcessingPayment) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Payment" }} />
        <Text style={styles.processingTitle}>Complete your payment</Text>
        <Text style={styles.processingSubtitle}>
          Finish paying in the window that opened. Once done, come back and confirm below.
        </Text>
        <Pressable style={styles.confirmButton} onPress={handleConfirmPayment}>
          <Text style={styles.confirmButtonText}>I've Completed Payment</Text>
        </Pressable>
        <Pressable onPress={() => setIsProcessingPayment(false)}>
          <Text style={styles.cancelLink}>Cancel and go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Checkout" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        {addressesLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : selectedAddress ? (
          <AddressCard address={selectedAddress} selected />
        ) : (
          <Text style={styles.emptyText}>No delivery address selected.</Text>
        )}
        <Pressable onPress={() => router.push({ pathname: "/(customer)/addresses", params: { selectMode: "1" } })}>
          <Text style={styles.changeLink}>{selectedAddress ? "Change address" : "Add an address"}</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentList}>
          {PAYMENT_METHODS.map((option) => (
            <PaymentMethodCard
              key={option.method}
              method={option.method}
              label={option.label}
              description={option.description}
              selected={paymentMethod === option.method}
              onSelect={setPaymentMethod}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryBlock}>
          <SummaryRow label={`Subtotal (${items.length} item${items.length === 1 ? "" : "s"})`} value={subtotal} />
          <SummaryRow label="Delivery fee" value={DELIVERY_FEE} />
          <SummaryRow label="Service fee" value={SERVICE_FEE} />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={total} bold />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={createOrder.isPending}>
          {createOrder.isPending ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order • {formatCurrency(total)}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryLabelBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.sm, paddingBottom: spacing.xxxl * 2 },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary, marginTop: spacing.lg },
  emptyText: { fontSize: typography.size.sm, color: colors.textSecondary },
  changeLink: { fontSize: typography.size.sm, color: colors.primary, fontWeight: typography.weight.medium, marginTop: spacing.xs },
  paymentList: { gap: spacing.sm },
  summaryBlock: { gap: spacing.xs },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: typography.size.sm, color: colors.textSecondary },
  summaryLabelBold: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  summaryValue: { fontSize: typography.size.sm, color: colors.textPrimary },
  summaryValueBold: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    padding: spacing.xl,
    ...shadow.card,
  },
  placeOrderButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center" },
  placeOrderButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: colors.background, gap: spacing.md },
  processingTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  processingSubtitle: { fontSize: typography.size.sm, color: colors.textSecondary, textAlign: "center" },
  confirmButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, marginTop: spacing.md },
  confirmButtonText: { color: colors.textInverse, fontWeight: typography.weight.semibold },
  cancelLink: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: spacing.sm },
});
