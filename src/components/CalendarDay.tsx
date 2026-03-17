import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, typography } from "../theme";

export interface CalendarDayProps {
  day: number | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  workoutCount: number;
  onPress: (day: number) => void;
  accessibilityLabel?: string;
}

/**
 * Individual calendar day cell component
 * Displays date number with workout indicators
 * Touch target: minimum 44x44pt for accessibility
 */
export function CalendarDay({
  day,
  isCurrentMonth,
  isToday,
  isSelected,
  workoutCount,
  onPress,
  accessibilityLabel,
}: CalendarDayProps) {
  if (!day) {
    // Empty cell for padding
    return <View style={styles.dayCell} accessibilityRole="none" />;
  }

  const handlePress = () => {
    onPress(day);
  };

  // Determine indicator style based on workout count
  const renderWorkoutIndicators = () => {
    if (workoutCount === 0) {
      return null;
    }

    if (workoutCount === 1) {
      return <View style={[styles.indicator, styles.indicatorSingle]} />;
    }

    // Multiple workouts - show multiple dots
    return (
      <View style={styles.indicatorsMultiple}>
        <View style={[styles.indicator, styles.indicatorMultiple]} />
        <View style={[styles.indicator, styles.indicatorMultiple]} />
        {workoutCount > 2 && (
          <View style={[styles.indicator, styles.indicatorMultiple]} />
        )}
      </View>
    );
  };

  // Build accessibility label
  const defaultAccessibilityLabel = accessibilityLabel || `Day ${day}`;
  const accessibilityHint =
    workoutCount > 0
      ? `${workoutCount} workout${workoutCount > 1 ? "s" : ""} logged. Tap to view details.`
      : "No workouts logged. Tap to add workout.";

  return (
    <TouchableOpacity
      style={[
        styles.dayCell,
        isToday && styles.dayCellToday,
        isSelected && styles.dayCellSelected,
        !isCurrentMonth && styles.dayCellOtherMonth,
      ]}
      onPress={handlePress}
      disabled={!isCurrentMonth}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={defaultAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        selected: isSelected,
        disabled: !isCurrentMonth,
      }}
      testID={isToday ? "calendar-day-today" : "calendar-day"}
    >
      <Text
        style={[
          styles.dayText,
          !isCurrentMonth && styles.dayTextOtherMonth,
          isToday && styles.dayTextToday,
          isSelected && styles.dayTextSelected,
        ]}
      >
        {day}
      </Text>
      {renderWorkoutIndicators()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginHorizontal: 2,
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
  },
  dayCellToday: {
    backgroundColor: colors.primary,
  },
  dayCellSelected: {
    backgroundColor: colors.primaryAlt,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayCellOtherMonth: {
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  dayText: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
  },
  dayTextOtherMonth: {
    color: colors.textSecondary,
  },
  dayTextToday: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  indicatorSingle: {
    backgroundColor: colors.accent,
  },
  indicatorsMultiple: {
    flexDirection: "row",
    gap: 3,
    marginTop: 4,
  },
  indicatorMultiple: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.success,
  },
});
