import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { Stack } from "expo-router";
import { useVendorCateringRequests, useQuoteCateringRequest, useDeclineCateringRequest } from "@/hooks/useVendorCatering";
import { Badge } from "@/components/Badge";
import { colors, spacing, radii, typography, shadow } from "@/constants/theme";
import type { VendorCateringRequest } from "@/types";

export default function VendorCateringRequests() {
  const { data: requests, isLoading, isError, refetch, isRefetching } = useVendorCateringRequests();
  const quoteRequest = useQuoteCateringRequest();
  const declineRequest = useDeclineCateringRequest();

  const [quotingRequest, setQuotingRequest] = useState<VendorCateringRequest | null>(null);
  const [quotePrice, setQuotePrice] = useState("");

  const handleConfirmQuote = () => {
    if (!quotingRequest) return;
    const price = Number(quotePrice);
    if (!price || price <= 0) {
      Alert.alert("Enter a valid price", "The quoted price must be greater than zero.");
      return;
    }
    quoteRequest.mutate(
      { id: quotingRequest.id, price },
      {
        onSuccess: () => {
          setQuotingRequest(null);
          setQuotePrice("");
        },
        onError: () => Alert.alert("Couldn't send quote", "Please try again."),
      }
    );
  };

  const handleDecline = (request: VendorCateringRequest) => {
    Alert.alert("Decline this request?", `${request.customerName}'s event on ${request.eventDate}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: () => declineRequest.mutate({ id: request.id }, { onError: () => Alert.alert("Couldn't decline", "Please try again.") }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Catering Requests" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Catering Requests" }} />
        <Text style={styles.errorTitle}>Couldn't load requests</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Catering Requests" }} />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isRefetching}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.customerName}>{item.customerName}</Text>
              <Badge label={item.status} tone={item.status === "REQUESTED" ? "warning" : item.status === "QUOTED" ? "primary" : "neutral"} />
            </View>
            <Text style={styles.eventType}>{item.eventType}</Text>
            <Text style={styles.detail}>{item.eventDate} at {item.eventTime}</Text>
            <Text style={styles.detail}>{item.guestCount} guests • {item.eventLocation}</Text>
            {item.foodPreferences ? <Text style={styles.detail}>Preferences: {item.foodPreferences}</Text> : null}
            {item.additionalRequirements ? <Text style={styles.detail}>{item.additionalRequirements}</Text> : null}

            {item.status === "REQUESTED" ? (
              <View style={styles.actionsRow}>
                <Pressable style={styles.declineButton} onPress={() => handleDecline(item)}>
                  <Text style={styles.declineButtonText}>Decline</Text>
                </Pressable>
                <Pressable style={styles.quoteButton} onPress={() => setQuotingRequest(item)}>
                  <Text style={styles.quoteButtonText}>Send Quote</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No catering requests</Text>
          </View>
        }
      />

      <Modal visible={!!quotingRequest} transparent animationType="fade" onRequestClose={() => setQuotingRequest(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quote for {quotingRequest?.customerName}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Quoted price (₦)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={quotePrice}
              onChangeText={setQuotePrice}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setQuotingRequest(null);
                  setQuotePrice("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirmButton} onPress={handleConfirmQuote} disabled={quoteRequest.isPending}>
                {quoteRequest.isPending ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalConfirmText}>Send Quote</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: colors.background },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  listContent: { padding: spacing.xl, flexGrow: 1 },
  emptyTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  card: { backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.lg, gap: 4, ...shadow.card },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  customerName: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  eventType: { fontSize: typography.size.sm, color: colors.primary, fontWeight: typography.weight.medium },
  detail: { fontSize: typography.size.sm, color: colors.textSecondary },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  declineButton: { flex: 1, borderRadius: radii.md, paddingVertical: spacing.sm, alignItems: "center", borderWidth: 1, borderColor: colors.danger },
  declineButtonText: { color: colors.danger, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  quoteButton: { flex: 1, borderRadius: radii.md, paddingVertical: spacing.sm, alignItems: "center", backgroundColor: colors.primary },
  quoteButtonText: { color: colors.textInverse, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: spacing.xl },
  modalCard: { backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.xl, gap: spacing.md },
  modalTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  modalActions: { flexDirection: "row", gap: spacing.sm },
  modalCancelButton: { flex: 1, borderRadius: radii.md, paddingVertical: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.textPrimary, fontWeight: typography.weight.semibold },
  modalConfirmButton: { flex: 1, borderRadius: radii.md, paddingVertical: spacing.md, alignItems: "center", backgroundColor: colors.primary },
  modalConfirmText: { color: colors.textInverse, fontWeight: typography.weight.semibold },
});
