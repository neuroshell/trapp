import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { WorkoutEntry } from "../models";
import { colors, spacing, typography } from "../theme";

export interface DayDetailModalProps {
  visible: boolean;
  selectedDate: Date | null;
  workouts: WorkoutEntry[];
  onClose: () => void;
  onAddWorkout: () => void;
}

/**
 * Modal component showing workout details for a selected day
 * Includes list of workouts and "Add Workout" button
 */
export function DayDetailModal({
  visible,
  selectedDate,
  workouts,
  onClose,
  onAddWorkout,
}: DayDetailModalProps) {
  if (!selectedDate) {
    return null;
  }

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    const colors: Record<string, string> = {
      running: "#FF6B35",
      squats: "#9C27B0",
      pushups: "#2196F3",
      pullups: "#4CAF50",
      other: "#757575",
    };
    return colors[type] || "#757575";
  };

  const hasWorkouts = workouts.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent} role="dialog">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={styles.dateHeader} testID="modal-date-header">
                {formatDateHeader(selectedDate)}
              </Text>
              <Text style={styles.workoutCount}>
                {hasWorkouts
                  ? `${workouts.length} workout${workouts.length > 1 ? "s" : ""}`
                  : "No workouts"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              accessibilityHint="Dismiss the day detail view"
              testID="close-modal-button"
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Workout List or Empty State */}
          {hasWorkouts ? (
            <ScrollView
              style={styles.workoutList}
              contentContainerStyle={styles.workoutListContent}
              accessibilityRole="list"
            >
              {workouts.map((workout, index) => {
                const icon = getWorkoutIcon(workout.type);
                const color = getWorkoutColor(workout.type);

                return (
                  <View key={workout.id} style={styles.workoutItem}>
                    <View
                      style={[
                        styles.workoutIconContainer,
                        { backgroundColor: `${color}20` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={icon as any}
                        size={20}
                        color={color}
                      />
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text
                        style={styles.workoutType}
                        testID={`workout-type-${index}`}
                      >
                        {workout.type.charAt(0).toUpperCase() +
                          workout.type.slice(1)}
                      </Text>
                      <Text
                        style={styles.workoutSummary}
                        testID={`workout-summary-${index}`}
                      >
                        {getWorkoutSummary(workout)}
                      </Text>
                      {workout.data.notes ? (
                        <Text
                          style={styles.workoutNotes}
                          numberOfLines={1}
                          testID={`workout-notes-${index}`}
                        >
                          {workout.data.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.workoutTime}>
                      {formatWorkoutTime(workout.timestamp)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyState} accessibilityRole="summary">
              <MaterialCommunityIcons
                name="calendar-blank"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>No workouts logged</Text>
              <Text style={styles.emptySubtitle}>
                Start building your fitness journey by logging a workout for
                this day.
              </Text>
            </View>
          )}

          {/* Add Workout Button */}
          <TouchableOpacity
            style={[
              styles.addWorkoutButton,
              !hasWorkouts && styles.addWorkoutButtonPrimary,
            ]}
            onPress={onAddWorkout}
            accessibilityRole="button"
            accessibilityLabel="Add workout"
            accessibilityHint={`Log a new workout for ${formatDateHeader(selectedDate)}`}
            testID="add-workout-button"
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={hasWorkouts ? colors.primary : "#FFFFFF"}
            />
            <Text
              style={[
                styles.addWorkoutButtonText,
                !hasWorkouts && styles.addWorkoutButtonTextPrimary,
              ]}
            >
              Add Workout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
  },
  dateHeader: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  workoutCount: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: spacing.sm,
    marginTop: -spacing.sm,
    marginRight: -spacing.sm,
  },
  workoutList: {
    padding: spacing.lg,
  },
  workoutListContent: {
    gap: spacing.md,
  },
  workoutItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  workoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
    textTransform: "capitalize",
  },
  workoutSummary: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  workoutNotes: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: "italic",
  },
  workoutTime: {
    fontSize: typography.small,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  addWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
    minHeight: 48, // Minimum touch target
  },
  addWorkoutButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  addWorkoutButtonText: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.primary,
  },
  addWorkoutButtonTextPrimary: {
    color: "#FFFFFF",
  },
});
