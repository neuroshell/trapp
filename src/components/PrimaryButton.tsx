import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, spacing, typography } from "../theme";

type Props = {
  children: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  active?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  children,
  onPress,
  style,
  active,
  disabled,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        active && styles.buttonActive,
        disabled && styles.buttonDisabled,
        style,
      ]}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonActive: {
    backgroundColor: colors.primaryAlt,
  },
  buttonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  text: {
    color: "#fff",
    fontSize: typography.body,
    fontWeight: "700",
  },
  textDisabled: {
    color: "#F1F5F9",
  },
});
