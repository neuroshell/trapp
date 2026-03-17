import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { ActivityType } from "../models";
import { colors, spacing, typography } from "../theme";

interface LogStrengthFormProps {
  exerciseType: ActivityType;
  reps: string;
  sets: string;
  weight: string;
  onRepsChange: (value: string) => void;
  onSetsChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  errors?: Record<string, string>;
}

export function LogStrengthForm({
  exerciseType,
  reps,
  sets,
  weight,
  onRepsChange,
  onSetsChange,
  onWeightChange,
  errors = {},
}: LogStrengthFormProps) {
  // Get exercise label based on type
  const exerciseLabel = React.useMemo(() => {
    switch (exerciseType) {
      case "squats":
        return "Squats";
      case "pushups":
        return "Push-ups";
      case "pullups":
        return "Pull-ups";
      default:
        return "Exercise";
    }
  }, [exerciseType]);

  return (
    <View style={styles.container} accessibilityRole="none">
      {/* Reps Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Reps</Text>
        <TextInput
          style={[styles.input, errors.reps && styles.inputError]}
          value={reps}
          onChangeText={onRepsChange}
          placeholder="e.g., 20"
          keyboardType="number-pad"
          accessibilityLabel="Repetitions"
          accessibilityHint={`Enter number of ${exerciseLabel.toLowerCase()} repetitions`}
          aria-invalid={!!errors.reps}
          testID="reps-input"
        />
        {errors.reps ? (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            testID="reps-error"
          >
            {errors.reps}
          </Text>
        ) : null}
      </View>

      {/* Sets Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Sets</Text>
        <TextInput
          style={[styles.input, errors.sets && styles.inputError]}
          value={sets}
          onChangeText={onSetsChange}
          placeholder="e.g., 3"
          keyboardType="number-pad"
          accessibilityLabel="Sets"
          accessibilityHint={`Enter number of ${exerciseLabel.toLowerCase()} sets`}
          aria-invalid={!!errors.sets}
          testID="sets-input"
        />
        {errors.sets ? (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            testID="sets-error"
          >
            {errors.sets}
          </Text>
        ) : null}
      </View>

      {/* Weight Input (Optional) */}
      <View style={styles.field}>
        <Text style={styles.label}>Weight (kg) - Optional</Text>
        <TextInput
          style={[styles.input, errors.weight && styles.inputError]}
          value={weight}
          onChangeText={onWeightChange}
          placeholder="e.g., 50 (optional)"
          keyboardType="decimal-pad"
          accessibilityLabel="Weight"
          accessibilityHint="Enter weight in kilograms (optional)"
          aria-invalid={!!errors.weight}
          testID="weight-input"
        />
        {errors.weight ? (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            testID="weight-error"
          >
            {errors.weight}
          </Text>
        ) : (
          <Text style={styles.helperText}>
            Leave empty for bodyweight exercises
          </Text>
        )}
      </View>

      {/* Total Volume Display */}
      {reps && sets && !errors.reps && !errors.sets && (
        <View style={styles.volumeContainer} accessibilityRole="summary">
          <Text style={styles.volumeLabel}>Total Volume</Text>
          <Text style={styles.volumeValue} testID="volume-display">
            {parseInt(reps, 10) * parseInt(sets, 10)} reps
            {weight ? ` × ${weight} kg` : ""}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.body,
    backgroundColor: colors.surface,
    minHeight: 48, // Touch target
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary + "10", // 10% opacity
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  volumeLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  volumeValue: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: "700",
  },
});
