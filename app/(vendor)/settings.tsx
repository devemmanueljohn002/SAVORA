import { useEffect, useState } from "react";
import { View, Text, TextInput, Switch, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Stack } from "expo-router";
import { useVendorStoreSettings, useUpdateVendorStoreSettings } from "@/hooks/useVendorStore";
import { colors, spacing, radii, typography } from "@/constants/theme";

export default function VendorSettings() {
  const { data: settings, isLoading, isError, refetch } = useVendorStoreSettings();
  const updateSettings = useUpdateVendorStoreSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [openingHours, setOpeningHours] = useState("");
  const [prepTime, setPrepTime] = useState("");

  useEffect(() => {
    if (settings) {
      setIsOpen(settings.isOpen);
      setOpeningHours(settings.openingHours);
      setPrepTime(String(settings.preparationTimeMinutes));
    }
  }, [settings]);

  const handleSave = () => {
    const minutes = Number(prepTime);
    if (!minutes || minutes <= 0) {
      Alert.alert("Enter a valid prep time", "Preparation time must be greater than zero minutes.");
      return;
    }
    updateSettings.mutate(
      { isOpen, openingHours, preparationTimeMinutes: minutes },
      { onError: () => Alert.alert("Couldn't save", "Please try again.") }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Store Settings" }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Store Settings" }} />
        <Text style={styles.errorTitle}>Couldn't load settings</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.errorSubtitle}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Store Settings" }} />

      <View style={styles.row}>
        <Text style={styles.label}>Store is open</Text>
        <Switch value={isOpen} onValueChange={setIsOpen} trackColor={{ true: colors.primary, false: colors.border }} />
      </View>

      <Text style={styles.label}>Opening hours</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 9:00 AM - 9:00 PM"
        placeholderTextColor={colors.textSecondary}
        value={openingHours}
        onChangeText={setOpeningHours}
      />

      <Text style={styles.label}>Default preparation time (minutes)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 25"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        value={prepTime}
        onChangeText={setPrepTime}
      />

      <Pressable style={styles.saveButton} onPress={handleSave} disabled={updateSettings.isPending}>
        {updateSettings.isPending ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: colors.background },
  errorTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  errorSubtitle: { fontSize: typography.size.sm, color: colors.primary, marginTop: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
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
  saveButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.lg, alignItems: "center", marginTop: spacing.xl },
  saveButtonText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
