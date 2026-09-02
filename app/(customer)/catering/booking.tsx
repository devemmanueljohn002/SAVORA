import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCreateCateringBooking } from "@/hooks/useCatering";
import { cateringBookingSchema, type CateringBookingFormValues } from "@/validation/cateringSchemas";
import { colors, spacing, radii, typography } from "@/constants/theme";
import type { CateringServiceType } from "@/types";

const EVENT_TYPES: CateringServiceType[] = [
  "Weddings",
  "Birthdays",
  "Corporate Events",
  "Parties",
  "Meetings",
  "Religious Events",
  "School Events",
  "Outdoor Events",
];

export default function CateringBooking() {
  const params = useLocalSearchParams<{ providerId: string; providerName?: string }>();
  const createBooking = useCreateCateringBooking();
  const [selectedEventType, setSelectedEventType] = useState<CateringServiceType | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CateringBookingFormValues>({
    resolver: zodResolver(cateringBookingSchema),
    defaultValues: {
      eventType: "",
      eventDate: "",
      eventTime: "",
      guestCount: "",
      eventLocation: "",
      budget: "",
      foodPreferences: "",
      additionalRequirements: "",
    },
  });

  const handleSelectEventType = (type: CateringServiceType) => {
    setSelectedEventType(type);
    setValue("eventType", type, { shouldValidate: true });
  };

  const onSubmit = async (values: CateringBookingFormValues) => {
    try {
      await createBooking.mutateAsync({
        providerId: params.providerId,
        eventType: values.eventType,
        eventDate: values.eventDate,
        eventTime: values.eventTime,
        guestCount: Number(values.guestCount),
        eventLocation: values.eventLocation,
        budget: values.budget ? Number(values.budget) : undefined,
        foodPreferences: values.foodPreferences || undefined,
        additionalRequirements: values.additionalRequirements || undefined,
      });
      Alert.alert(
        "Quote requested",
        `${params.providerName ?? "The caterer"} will get back to you with a quote soon.`,
        [{ text: "OK", onPress: () => router.replace("/(customer)/catering") }]
      );
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "Couldn't send your request. Please try again.";
      Alert.alert("Something went wrong", message);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Request Quote" }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Request a Catering Quote</Text>
        {params.providerName ? <Text style={styles.subtitle}>From {params.providerName}</Text> : null}

        <Text style={styles.label}>Event type</Text>
        <View style={styles.chipRow}>
          {EVENT_TYPES.map((type) => (
            <Pressable
              key={type}
              style={[styles.chip, selectedEventType === type && styles.chipActive]}
              onPress={() => handleSelectEventType(type)}
            >
              <Text style={[styles.chipText, selectedEventType === type && styles.chipTextActive]}>{type}</Text>
            </Pressable>
          ))}
        </View>
        {errors.eventType ? <Text style={styles.fieldError}>{errors.eventType.message}</Text> : null}

        <Field label="Event date" name="eventDate" control={control} error={errors.eventDate?.message} placeholder="e.g. 2026-12-20" />
        <Field label="Event time" name="eventTime" control={control} error={errors.eventTime?.message} placeholder="e.g. 4:00 PM" />
        <Field
          label="Number of guests"
          name="guestCount"
          control={control}
          error={errors.guestCount?.message}
          placeholder="e.g. 150"
          keyboardType="number-pad"
        />
        <Field
          label="Event location"
          name="eventLocation"
          control={control}
          error={errors.eventLocation?.message}
          placeholder="Venue or address"
        />
        <Field
          label="Budget (optional)"
          name="budget"
          control={control}
          error={errors.budget?.message}
          placeholder="e.g. 500000"
          keyboardType="number-pad"
        />
        <Field
          label="Food preferences (optional)"
          name="foodPreferences"
          control={control}
          error={errors.foodPreferences?.message}
          placeholder="e.g. Nigerian, Continental, no pork"
        />

        <Text style={styles.label}>Additional requirements (optional)</Text>
        <Controller
          control={control}
          name="additionalRequirements"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Anything else the caterer should know"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitButtonText}>Request Catering Quote</Text>
          )}
        </Pressable>
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
}: {
  label: string;
  name: keyof CateringBookingFormValues;
  control: ReturnType<typeof useForm<CateringBookingFormValues>>["control"];
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
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
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
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
  textArea: { minHeight: 90, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.size.sm, color: colors.textPrimary },
  chipTextActive: { color: colors.textInverse },
  fieldError: { color: colors.danger, fontSize: typography.size.xs, marginTop: spacing.xs },
  submitButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center", marginTop: spacing.xl },
  submitButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
