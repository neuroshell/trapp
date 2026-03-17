import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { WorkoutEntry } from "../models";
import { colors, spacing, typography } from "../theme";

export interface WorkoutHistoryItemProps {
  workout: WorkoutEntry;
  onPress?: (workout: WorkoutEntry) => void;
  onLongPress?: (workout: WorkoutEntry) => void;
  accessibilityLabel?: string;
}

/**
 * Individual workout list item component
 * Displays workout type, summary, date/time, and notes
 * Touch target: minimum 44x44pt for accessibility
 */
export function WorkoutHistoryItem({
  workout,
  onPress,
  onLongPress,
  accessibilityLabel,
}: WorkoutHistoryItemProps) {
  const formatWorkoutDate = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatWorkoutTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWorkoutSummary = (workout: WorkoutEntry): string => {
    const { data } = workout;
    if (workout.type === "running") {
      return `${data.distance?.toFixed(1)} km • ${data.duration?.toFixed(0)} min`;
    } else {
      const volume = `${data.sets} × ${data.reps}`;
      return data.weight ? `${volume} • ${data.weight} kg` : volume;
    }
  };

  const getWorkoutIcon = (type: string): string => {
    const icons: Record<string, string> = {
      running: "run",
      squats: "dumbbell",
      pushups: "arm-flex",
      pullups: "weight-lifter",
      other: "shoe-sneaker",
    };
    return icons[type] || "shoe-sneaker";
  };

  const getWorkoutColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      running: "#FF6B35",
      squats: "#9C27B0",
      pushups: "#2196F3",
      pullups: "#4CAF50",
      other: "#757575",
    };
    return colorMap[type] || "#757575";
  };

  const icon = getWorkoutIcon(workout.type);
  const color = getWorkoutColor(workout.type);

  const defaultAccessibilityLabel =
    accessibilityLabel ||
    `${workout.type} workout on ${formatWorkoutDate(workout.timestamp)} at ${formatWorkoutTime(workout.timestamp)}`;

  const accessibilityHint =
    "Double tap to view details. Long press for more options.";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(workout)}
      onLongPress={() => onLongPress?.(workout)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={defaultAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID="workout-history-item"
    >
      {/* Icon */}
      <View
        style={[styles.iconContainer, { backgroundColor: `${color}15` }]}
        accessibilityRole="image"
        accessibilityLabel={`${workout.type} icon`}
        accessibilityHint={undefined}
      >
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <Text style={styles.workoutType} testID="workout-type">
            {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
          </Text>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.workoutDate}>
              {formatWorkoutDate(workout.timestamp)}
            </Text>
            <Text style={styles.workoutTime}>
              {formatWorkoutTime(workout.timestamp)}
            </Text>
          </View>
        </View>

        <Text style={styles.workoutSummary} testID="workout-summary">
          {getWorkoutSummary(workout)}
        </Text>

        {workout.data.notes ? (
          <Text
            style={styles.workoutNotes}
            numberOfLines={2}
            testID="workout-notes"
          >
            {workout.data.notes}
          </Text>
        ) : null}
      </View>

      {/* Chevron */}
      <View style={styles.chevronContainer} accessibilityRole="none">
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    minHeight: 72, // Ensure adequate touch target
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  workoutType: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
    textTransform: "capitalize",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  workoutDate: {
    fontSize: typography.small,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  workoutTime: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  workoutSummary: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  workoutNotes: {
    fontSize: typography.small,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  chevronContainer: {
    paddingLeft: spacing.sm,
  },
});
