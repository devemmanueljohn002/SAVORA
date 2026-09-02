import { useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useAddresses, useAddressMutations } from "@/hooks/useAddresses";
import { addressSchema, type AddressFormValues } from "@/validation/addressSchemas";
import { AddressCard } from "@/components/AddressCard";
import { colors, spacing, radii, typography } from "@/constants/theme";
import type { Address } from "@/types";

/**
 * `selectMode=1` is passed when navigating here from checkout — tapping an
 * address then pops back to checkout instead of just viewing the list.
 */
export default function Addresses() {
  const params = useLocalSearchParams<{ selectMode?: string }>();
  const selectMode = params.selectMode === "1";

  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const { create, update, remove } = useAddressMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: "", fullAddress: "", city: "", state: "", landmark: "", phone: "", deliveryInstructions: "" },
  });

  const openAddForm = () => {
    setEditingAddress(null);
    reset({ label: "", fullAddress: "", city: "", state: "", landmark: "", phone: "", deliveryInstructions: "" });
    setFormOpen(true);
  };

  const openEditForm = (address: Address) => {
    setEditingAddress(address);
    reset({
      label: address.label,
      fullAddress: address.fullAddress,
      city: address.city,
      state: address.state,
      landmark: address.landmark ?? "",
      phone: address.phone,
      deliveryInstructions: address.deliveryInstructions ?? "",
    });
    setFormOpen(true);
  };

  const onSubmit = async (values: AddressFormValues) => {
    try {
      if (editingAddress) {
        await update.mutateAsync({ id: editingAddress.id, payload: values });
      } else {
        await create.mutateAsync(values);
      }
      setFormOpen(false);
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Couldn't save this address. Please try again.";
      Alert.alert("Something went wrong", message);
    }
  };

  const handleDelete = (address: Address) => {
    Alert.alert("Delete address", `Remove "${address.label}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(address.id) },
    ]);
  };

  const handleSelect = (address: Address) => {
    if (selectMode) {
      router.replace({ pathname: "/(customer)/checkout", params: { addressId: address.id } });
    }
  };

  if (formOpen) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: editingAddress ? "Edit Address" : "Add Address" }} />
        <View style={styles.form}>
          <Field label="Label (e.g. Home, Office)" name="label" control={control} error={errors.label?.message} />
          <Field label="Full address" name="fullAddress" control={control} error={errors.fullAddress?.message} multiline />
          <Field label="City" name="city" control={control} error={errors.city?.message} />
          <Field label="State" name="state" control={control} error={errors.state?.message} />
          <Field label="Landmark (optional)" name="landmark" control={control} error={errors.landmark?.message} />
          <Field label="Phone" name="phone" control={control} error={errors.phone?.message} keyboardType="phone-pad" />
          <Field
            label="Delivery instructions (optional)"
            name="deliveryInstructions"
            control={control}
            error={errors.deliveryInstructions?.message}
            multiline
          />

          <View style={styles.formActions}>
            <Pressable style={styles.cancelButton} onPress={() => setFormOpen(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.saveButtonText}>Save Address</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Addresses" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Addresses" }} />
        <Text style={styles.errorTitle}>Couldn't load your addresses</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: selectMode ? "Select Address" : "Addresses" }} />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onSelect={selectMode ? handleSelect : undefined}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No saved addresses yet.</Text>
          </View>
        }
      />
      <Pressable style={styles.addButton} onPress={openAddForm}>
        <Text style={styles.addButtonText}>+ Add New Address</Text>
      </Pressable>
    </View>
  );
}

function Field({
  label,
  name,
  control,
  error,
  keyboardType,
  multiline,
}: {
  label: string;
  name: keyof AddressFormValues;
  control: ReturnType<typeof useForm<AddressFormValues>>["control"];
  error?: string;
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={[styles.input, multiline && styles.inputMultiline]}
            value={typeof value === "string" ? value : ""}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={keyboardType}
            multiline={multiline}
          />
        )}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  listContent: { padding: spacing.xl, paddingBottom: spacing.xxxl * 2 },
  emptyText: { fontSize: typography.size.sm, color: colors.textSecondary },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  addButton: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  addButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  form: { padding: spacing.xl, gap: spacing.md },
  label: { fontSize: typography.size.sm, color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: "top" },
  fieldError: { color: colors.danger, fontSize: typography.size.xs, marginTop: spacing.xs },
  formActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center" },
  cancelButtonText: { color: colors.textPrimary, fontWeight: typography.weight.semibold },
  saveButton: { flex: 2, backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center" },
  saveButtonText: { color: colors.textInverse, fontWeight: typography.weight.semibold },
});
