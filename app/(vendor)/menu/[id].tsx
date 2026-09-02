import { useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Switch, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useVendorProducts, useCreateVendorProduct, useUpdateVendorProduct, useDeleteVendorProduct } from "@/hooks/useVendorProducts";
import { menuItemSchema, type MenuItemFormValues } from "@/validation/menuItemSchema";
import { colors, spacing, radii, typography } from "@/constants/theme";

export default function MenuItemEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";

  const { data: products } = useVendorProducts();
  const existing = !isNew ? products?.find((p) => p.id === id) : undefined;

  const createProduct = useCreateVendorProduct();
  const updateProduct = useUpdateVendorProduct();
  const deleteProduct = useDeleteVendorProduct();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { name: "", description: "", price: "", category: "", imageUrl: "", isAvailable: true },
  });

  // Populate the form once the existing product loads (list may still be fetching on deep-link).
  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? "",
        price: String(existing.price),
        category: existing.category,
        imageUrl: existing.imageUrl ?? "",
        isAvailable: existing.isAvailable,
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values: MenuItemFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      price: Number(values.price),
      category: values.category,
      imageUrl: values.imageUrl || undefined,
      isAvailable: values.isAvailable,
    };

    try {
      if (isNew) {
        await createProduct.mutateAsync(payload);
      } else {
        await updateProduct.mutateAsync({ id: id as string, payload });
      }
      router.back();
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Couldn't save this item. Please try again.";
      Alert.alert("Something went wrong", message);
    }
  };

  const handleDelete = () => {
    if (isNew) return;
    Alert.alert("Delete this item?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct.mutateAsync(id as string);
            router.back();
          } catch {
            Alert.alert("Couldn't delete", "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: isNew ? "Add Menu Item" : "Edit Menu Item" }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Name" name="name" control={control} error={errors.name?.message} placeholder="e.g. Jollof Rice & Chicken" />
        <Field
          label="Description (optional)"
          name="description"
          control={control}
          error={errors.description?.message}
          placeholder="Short description customers will see"
        />
        <Field label="Price (₦)" name="price" control={control} error={errors.price?.message} placeholder="e.g. 3500" keyboardType="number-pad" />
        <Field label="Category" name="category" control={control} error={errors.category?.message} placeholder="e.g. Rice, Soups, Drinks" />
        <Field
          label="Image URL (optional)"
          name="imageUrl"
          control={control}
          error={errors.imageUrl?.message}
          placeholder="https://…"
          autoCapitalize="none"
        />

        <View style={styles.availabilityRow}>
          <Text style={styles.label}>Available for order</Text>
          <Controller
            control={control}
            name="isAvailable"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} />
            )}
          />
        </View>

        <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitButtonText}>{isNew ? "Add Item" : "Save Changes"}</Text>
          )}
        </Pressable>

        {!isNew ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={deleteProduct.isPending}>
            <Text style={styles.deleteButtonText}>Delete Item</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  name,
  control,
  error,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  name: keyof MenuItemFormValues;
  control: ReturnType<typeof useForm<MenuItemFormValues>>["control"];
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  autoCapitalize?: "none" | "words";
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize ?? "sentences"}
            value={typeof value === "string" ? value : ""}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: 0 },
  label: { fontSize: typography.size.sm, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
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
  fieldError: { color: colors.danger, fontSize: typography.size.xs, marginTop: spacing.xs },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  submitButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center", marginTop: spacing.xl },
  submitButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  deleteButton: { borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center", marginTop: spacing.md },
  deleteButtonText: { color: colors.danger, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
