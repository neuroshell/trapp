import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing, typography } from "../theme";

type Props = {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
};

function toLocalDateTimeString(value: Date) {
  const iso = value.toISOString();
  // Convert ISO to datetime-local format: YYYY-MM-DDTHH:MM
  return iso.slice(0, 16);
}

function fromLocalDateTimeString(value: string) {
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function DateTimeField({ label, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={styles.input}
        value={toLocalDateTimeString(value)}
        onChangeText={(text) => onChange(fromLocalDateTimeString(text))}
        placeholder="YYYY-MM-DDTHH:MM"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <Text style={styles.hint}>Enter date/time in local format (YYYY-MM-DDTHH:MM)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    fontSize: typography.body,
    backgroundColor: colors.surface,
  },
  hint: {
    marginTop: spacing.xs,
    fontSize: typography.small,
    color: colors.textSecondary,
  },
});
