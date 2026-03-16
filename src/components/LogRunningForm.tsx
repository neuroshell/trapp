import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  AccessibilityInfo,
} from "react-native";

import { colors, spacing, typography } from "../theme";
import { calculatePace, formatPace } from "../validation";

interface LogRunningFormProps {
  distance: string;
  duration: string;
  onDistanceChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  errors?: Record<string, string>;
}

export function LogRunningForm({
  distance,
  duration,
  onDistanceChange,
  onDurationChange,
  errors = {},
}: LogRunningFormProps) {
  // Calculate pace when both values are valid numbers
  const pace = React.useMemo(() => {
    const dist = parseFloat(distance);
    const dur = parseFloat(duration);
    if (!isNaN(dist) && !isNaN(dur) && dist > 0 && dur > 0) {
      return calculatePace(dist, dur);
    }
    return 0;
  }, [distance, duration]);

  // Announce pace changes to screen readers
  React.useEffect(() => {
    if (pace > 0) {
      AccessibilityInfo.announceForAccessibility(`Pace: ${formatPace(pace)}`);
    }
  }, [pace]);

  return (
    <View style={styles.container} accessibilityRole="none">
      {/* Distance Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Distance (km)</Text>
        <TextInput
          style={[styles.input, errors.distance && styles.inputError]}
          value={distance}
          onChangeText={onDistanceChange}
          placeholder="e.g., 5.0"
          keyboardType="decimal-pad"
          accessibilityLabel="Distance"
          accessibilityHint="Enter your running distance in kilometers"
          accessibilityInvalid={!!errors.distance}
          testID="distance-input"
        />
        {errors.distance ? (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            testID="distance-error"
          >
            {errors.distance}
          </Text>
        ) : null}
      </View>

      {/* Duration Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={[styles.input, errors.duration && styles.inputError]}
          value={duration}
          onChangeText={onDurationChange}
          placeholder="e.g., 30"
          keyboardType="number-pad"
          accessibilityLabel="Duration"
          accessibilityHint="Enter your running duration in minutes"
          accessibilityInvalid={!!errors.duration}
          testID="duration-input"
        />
        {errors.duration ? (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            testID="duration-error"
          >
            {errors.duration}
          </Text>
        ) : null}
      </View>

      {/* Pace Display */}
      {pace > 0 && (
        <View style={styles.paceContainer} accessibilityRole="summary">
          <Text style={styles.paceLabel}>Pace</Text>
          <Text style={styles.paceValue} testID="pace-display">
            {formatPace(pace)}
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
  paceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary + "10", // 10% opacity
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  paceLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  paceValue: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: "700",
  },
});
