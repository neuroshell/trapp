import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { ActivityType } from "../models";
import { spacing, typography } from "../theme";

interface QuickLogButtonProps {
  workoutType: ActivityType;
  label: string;
  onPress: (type: ActivityType) => void;
  icon: string;
  color: string;
  backgroundColor: string;
  testID?: string;
}

export function QuickLogButton({
  workoutType,
  label,
  onPress,
  icon,
  color,
  backgroundColor,
  testID,
}: QuickLogButtonProps) {
  const handlePress = () => {
    onPress(workoutType);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Quick log ${label}`}
      accessibilityHint={`Tap to quickly log a ${label.toLowerCase()} workout`}
      testID={testID || `quick-log-${workoutType}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon as any} size={28} color={color} />
      </View>
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100, // Touch target
    minWidth: 100,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.small,
    fontWeight: "600",
    textAlign: "center",
  },
});

// Pre-configured quick log buttons for common workout types
export const QUICK_LOG_BUTTONS: {
  type: ActivityType;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
}[] = [
  {
    type: "running",
    label: "Run",
    icon: "run",
    color: "#FF6B35",
    backgroundColor: "#FFF0EB",
  },
  {
    type: "pushups",
    label: "Push-up",
    icon: "arm-flex",
    color: "#2196F3",
    backgroundColor: "#E3F2FD",
  },
  {
    type: "squats",
    label: "Squats",
    icon: "dumbbell",
    color: "#9C27B0",
    backgroundColor: "#F3E5F5",
  },
  {
    type: "pullups",
    label: "Pull-up",
    icon: "weight-lifter",
    color: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
];
