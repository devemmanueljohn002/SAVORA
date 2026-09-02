import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Address } from "@/types";
import { colors, spacing, radii, typography } from "@/constants/theme";
import { Badge } from "@/components/Badge";

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: (address: Address) => void;
  onEdit?: (address: Address) => void;
  onDelete?: (address: Address) => void;
}

export function AddressCard({ address, selected, onSelect, onEdit, onDelete }: AddressCardProps) {
  return (
    <Pressable
      style={[styles.container, selected && styles.containerSelected]}
      onPress={() => onSelect?.(address)}
      accessibilityRole="button"
    >
      <View style={styles.headerRow}>
        <Text style={styles.label}>{address.label}</Text>
        {address.isDefault ? <Badge label="Default" tone="primary" /> : null}
      </View>
      <Text style={styles.address} numberOfLines={2}>
        {address.fullAddress}, {address.city}, {address.state}
      </Text>
      {address.landmark ? <Text style={styles.landmark}>Near {address.landmark}</Text> : null}
      <Text style={styles.phone}>{address.phone}</Text>

      {(onEdit || onDelete) && (
        <View style={styles.actionsRow}>
          {onEdit ? (
            <Pressable onPress={() => onEdit(address)} hitSlop={8}>
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable onPress={() => onDelete(address)} hitSlop={8}>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
    backgroundColor: colors.background,
  },
  containerSelected: { borderColor: colors.primary, backgroundColor: "#FCEBEC" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  address: { fontSize: typography.size.sm, color: colors.textSecondary },
  landmark: { fontSize: typography.size.xs, color: colors.textSecondary },
  phone: { fontSize: typography.size.xs, color: colors.textSecondary },
  actionsRow: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm },
  actionText: { fontSize: typography.size.xs, color: colors.primary, fontWeight: typography.weight.medium },
  deleteText: { color: colors.danger },
});
