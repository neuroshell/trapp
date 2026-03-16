import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components/Card";
import { DateTimeField } from "../components/DateTimeField";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { LogRunningForm } from "../components/LogRunningForm";
import { LogStrengthForm } from "../components/LogStrengthForm";
import { PrimaryButton } from "../components/PrimaryButton";
import { ActivityType, WorkoutEntry } from "../models";
import { RootTabParamList } from "../navigation/types";
import {
  deleteWorkout,
  getDeviceId,
  getLastWorkoutValues,
  getWorkouts,
  saveWorkout,
} from "../storage";
import { colors, spacing, typography } from "../theme";
import {
  isOutlier,
  validateRunningForm,
  validateStrengthForm,
  validateTimestamp,
} from "../validation";

type LogScreenRouteProp = RouteProp<RootTabParamList, "Log">;
type LogScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, "Log">;

const activityTypes: { label: string; value: ActivityType; icon: string }[] = [
  { label: "Running", value: "running", icon: "run" },
  { label: "Squats", value: "squats", icon: "dumbbell" },
  { label: "Push-ups", value: "pushups", icon: "arm-flex" },
  { label: "Pull-ups", value: "pullups", icon: "weight-lifter" },
  { label: "Other", value: "other", icon: "shoe-sneaker" },
];

function uuid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type LogScreenProps = {
  navigation: LogScreenNavigationProp;
};

export function LogScreen({ navigation }: LogScreenProps) {
  const route = useRoute<LogScreenRouteProp>();

  // Extract selectedDate from route params
  const selectedDateParam = route.params?.selectedDate;

  // Initialize date state with selected date from params or current date
  const initialDate = selectedDateParam
    ? new Date(selectedDateParam)
    : new Date();

  // State
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [type, setType] = useState<ActivityType>("running");
  const [date, setDate] = useState<Date>(initialDate);
  const [notes, setNotes] = useState<string>("");

  // Running form state
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");

  // Strength form state
  const [reps, setReps] = useState<string>("");
  const [sets, setSets] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Delete confirmation
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutEntry | null>(
    null,
  );

  // Load workouts on mount and when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, []),
  );

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const loadedWorkouts = await getWorkouts();
      setWorkouts(loadedWorkouts);
    } catch (error) {
      console.warn("Failed to load workouts", error);
    } finally {
      setLoading(false);
    }
  };

  // Load last values when type changes
  useEffect(() => {
    loadLastValues();
  }, [type]);

  const loadLastValues = async () => {
    try {
      const lastValues = await getLastWorkoutValues(type);
      if (lastValues) {
        if (type === "running") {
          setDistance(lastValues.distance?.toString() || "");
          setDuration(lastValues.duration?.toString() || "");
        } else if (["squats", "pushups", "pullups"].includes(type)) {
          setReps(lastValues.reps?.toString() || "");
          setSets(lastValues.sets?.toString() || "");
          setWeight(lastValues.weight?.toString() || "");
        }
      }
    } catch (error) {
      console.warn("Failed to load last values", error);
    }
  };

  // Clear errors when type changes
  useEffect(() => {
    setErrors({});
  }, [type]);

  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [workouts]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate timestamp
    const timestampValidation = validateTimestamp(date.toISOString());
    if (!timestampValidation.valid) {
      newErrors.timestamp = timestampValidation.errors.timestamp;
    }

    // Validate based on workout type
    if (type === "running") {
      const runningValidation = validateRunningForm({ distance, duration });
      if (!runningValidation.valid) {
        Object.assign(newErrors, runningValidation.errors);
      }
    } else if (["squats", "pushups", "pullups", "other"].includes(type)) {
      const strengthValidation = validateStrengthForm({
        reps,
        sets,
        weight: weight || undefined,
      });
      if (!strengthValidation.valid) {
        Object.assign(newErrors, strengthValidation.errors);
      }
    }

    setErrors(newErrors);

    // Announce errors to screen readers
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(". ");
      AccessibilityInfo.announceForAccessibility(
        `Form has errors: ${errorMessages}`,
      );
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Check for outliers
    if (type === "running") {
      const dist = parseFloat(distance);
      const dur = parseFloat(duration);
      if (isOutlier("distance", dist) || isOutlier("duration", dur)) {
        Alert.alert(
          "Unusual Values",
          "This workout seems unusually intense. Are you sure you want to save it?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Save Anyway",
              onPress: () => submitWorkout(),
            },
          ],
        );
        return;
      }
    }

    await submitWorkout();
  };

  const submitWorkout = async () => {
    setSaving(true);
    try {
      const deviceId = await getDeviceId();
      const workoutData: Omit<WorkoutEntry, "id" | "createdAt" | "updatedAt"> =
        {
          userId: deviceId,
          type,
          timestamp: date.toISOString(),
          data: {
            notes: notes.trim() || undefined,
            ...(type === "running"
              ? {
                  distance: parseFloat(distance),
                  duration: parseFloat(duration),
                }
              : {
                  reps: parseInt(reps, 10),
                  sets: parseInt(sets, 10),
                  weight: weight ? parseFloat(weight) : undefined,
                }),
          },
        };

      const newWorkout: WorkoutEntry = {
        ...workoutData,
        id: uuid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setWorkouts((prev) => [newWorkout, ...prev]);

      // Save to storage
      await saveWorkout(newWorkout);

      // Reset form
      resetForm();

      // Success feedback
      AccessibilityInfo.announceForAccessibility("Workout saved successfully!");
      setErrors({});
    } catch (error) {
      console.error("Failed to save workout", error);
      Alert.alert("Save Failed", "Failed to save workout. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setDistance("");
    setDuration("");
    setReps("");
    setSets("");
    setWeight("");
    setNotes("");
    setDate(new Date());
  };

  const handleDelete = (workout: WorkoutEntry) => {
    setWorkoutToDelete(workout);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!workoutToDelete) return;

    try {
      await deleteWorkout(workoutToDelete.id);
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutToDelete.id));
      AccessibilityInfo.announceForAccessibility("Workout deleted");
    } catch (error) {
      console.error("Failed to delete workout", error);
      Alert.alert("Delete Failed", "Failed to delete workout.");
    } finally {
      setDeleteDialogVisible(false);
      setWorkoutToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setWorkoutToDelete(null);
  };

  const formatWorkoutDate = (iso: string) => {
    const dt = new Date(iso);
    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const getWorkoutIcon = (type: ActivityType): string => {
    const icons: Record<ActivityType, string> = {
      running: "run",
      squats: "dumbbell",
      pushups: "arm-flex",
      pullups: "weight-lifter",
      other: "shoe-sneaker",
    };
    return icons[type] || "dumbbell";
  };

  const getWorkoutColor = (type: ActivityType): string => {
    const colors: Record<ActivityType, string> = {
      running: "#FF6B35",
      squats: "#9C27B0",
      pushups: "#2196F3",
      pullups: "#4CAF50",
      other: "#757575",
    };
    return colors[type] || "#757575";
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutEntry }) => {
    const icon = getWorkoutIcon(item.type);
    const color = getWorkoutColor(item.type);

    return (
      <Card style={styles.workoutCard} testID="workout-item">
        <View style={styles.workoutHeader}>
          <View style={styles.workoutIconContainer}>
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={color}
            />
          </View>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutType} testID="workout-type">
              {item.type}
            </Text>
            <Text style={styles.workoutSummary} testID="workout-summary">
              {getWorkoutSummary(item)}
            </Text>
            {item.data.notes ? (
              <Text style={styles.workoutNotes} numberOfLines={1}>
                {item.data.notes}
              </Text>
            ) : null}
          </View>
          <View style={styles.workoutMeta}>
            <Text style={styles.workoutDate}>
              {formatWorkoutDate(item.timestamp)}
            </Text>
            <PrimaryButton
              onPress={() => handleDelete(item)}
              active={false}
              style={styles.deleteButton}
              accessibilityLabel={`Delete ${item.type} workout`}
              accessibilityHint="Remove this workout from your history"
              testID="delete-workout-button"
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color="#FFFFFF"
              />
            </PrimaryButton>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Log Workout</Text>

      <FlatList
        data={sortedWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkoutItem}
        ListHeaderComponent={
          <Card style={styles.formCard}>
            {/* Workout Type Selector */}
            <View style={styles.formRow} testID="workout-type-selector">
              <Text style={styles.label}>Workout Type</Text>
              <View style={styles.typeSelector}>
                {activityTypes.map((option) => (
                  <PrimaryButton
                    key={option.value}
                    onPress={() => setType(option.value)}
                    active={option.value === type}
                    style={styles.typeButton}
                    accessibilityLabel={option.label}
                    accessibilityHint={`Select ${option.label.toLowerCase()} workout`}
                    testID={`type-${option.value}`}
                  >
                    <View style={styles.typeButtonContent}>
                      <MaterialCommunityIcons
                        name={option.icon as any}
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.typeButtonText}>{option.label}</Text>
                    </View>
                  </PrimaryButton>
                ))}
              </View>
            </View>

            {/* Date/Time Picker */}
            <View style={styles.formRow}>
              <DateTimeField
                label="Date & Time"
                value={date}
                onChange={setDate}
              />
              {errors.timestamp ? (
                <Text
                  style={styles.errorText}
                  accessibilityRole="alert"
                  testID="timestamp-error"
                >
                  {errors.timestamp}
                </Text>
              ) : null}
            </View>

            {/* Dynamic Form Fields */}
            <View style={styles.formRow}>
              {type === "running" ? (
                <LogRunningForm
                  distance={distance}
                  duration={duration}
                  onDistanceChange={setDistance}
                  onDurationChange={setDuration}
                  errors={errors}
                />
              ) : (
                <LogStrengthForm
                  exerciseType={type}
                  reps={reps}
                  sets={sets}
                  weight={weight}
                  onRepsChange={setReps}
                  onSetsChange={setSets}
                  onWeightChange={setWeight}
                  errors={errors}
                />
              )}
            </View>

            {/* Notes Field */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional details..."
                multiline
                accessibilityLabel="Notes"
                accessibilityHint="Optional notes about your workout"
                testID="notes-input"
              />
            </View>

            {/* Save Button */}
            <PrimaryButton
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
              accessibilityLabel="Save workout"
              accessibilityHint="Save your workout to history"
              testID="save-workout-button"
            >
              {saving ? "Saving..." : "Save Workout"}
            </PrimaryButton>
          </Card>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySubtext}>
                Log your first workout to get started!
              </Text>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
        testID="workouts-list"
      />

      {/* Delete Confirmation Dialog */}
      {workoutToDelete && (
        <DeleteConfirmationDialog
          visible={deleteDialogVisible}
          workoutType={workoutToDelete.type}
          workoutDate={formatWorkoutDate(workoutToDelete.timestamp)}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: spacing.lg,
    color: colors.text,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formRow: {
    marginBottom: spacing.md,
  },
  label: {
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.body,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeButton: {
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  typeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  typeButtonText: {
    color: "#FFFFFF",
    fontSize: typography.small,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
  },
  workoutCard: {
    marginBottom: spacing.sm,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontWeight: "700",
    color: colors.text,
    fontSize: typography.body,
    textTransform: "capitalize",
  },
  workoutSummary: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginTop: 2,
  },
  workoutNotes: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginTop: 2,
    fontStyle: "italic",
  },
  workoutMeta: {
    alignItems: "flex-end",
  },
  workoutDate: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginBottom: spacing.xs,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    minHeight: 36,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sectionTitle,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
