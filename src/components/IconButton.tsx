import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  style?: object;
};

export function IconButton({ icon, label, onPress, active, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        active && styles.active,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={active ? "#fff" : colors.primary}
        />
      </View>
      <Text
        style={[styles.label, active && styles.labelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(30,30,30,0.08)",
  },
  iconWrapper: {
    marginRight: 10,
  },
  label: {
    fontSize: typography.body,
    color: colors.text,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  labelActive: {
    color: "#fff",
  },
  pressed: {
    opacity: 0.8,
  },
});
