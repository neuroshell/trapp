import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { colors, spacing, typography } from "../theme";

type Props = {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
};

function formatDateTime(value: Date) {
  const date = value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = value.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

export function DateTimeField({ label, value, onChange }: Props) {
  const [show, setShow] = useState(false);

  const handleConfirm = (date: Date) => {
    setShow(false);
    onChange(date);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);
    }
    setShow(false);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.button} onPress={() => setShow(true)}>
        <Text style={styles.value}>{formatDateTime(value)}</Text>
        <MaterialCommunityIcons
          name="calendar"
          size={18}
          color={colors.primary}
        />
      </Pressable>

      {Platform.OS === "web" ? (
        show && (
          <DateTimePicker
            value={value}
            mode="datetime"
            display="default"
            onChange={handleChange}
          />
        )
      ) : (
        <DateTimePickerModal
          isVisible={show}
          mode="datetime"
          date={value}
          onConfirm={handleConfirm}
          onCancel={() => setShow(false)}
          confirmTextIOS="Confirm"
          cancelTextIOS="Cancel"
        />
      )}
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {
    fontSize: typography.body,
    color: colors.text,
  },
});
