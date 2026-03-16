import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarDay } from "../components/CalendarDay";
import { DayDetailModal } from "../components/DayDetailModal";
import { WorkoutHistoryList } from "../components/WorkoutHistoryList";
import { WorkoutEntry } from "../models";
import { RootTabParamList } from "../navigation/types";
import { getWorkouts, getWorkoutsByDateRange } from "../storage";
import { colors, spacing, typography } from "../theme";

type Props = BottomTabScreenProps<RootTabParamList, "Calendar">;

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Generate calendar matrix for a given month
 * Returns array of weeks, each week is array of day numbers (null for empty cells)
 */
function getMonthMatrix(date: Date): (number | null)[][] {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = [];

  // Fill leading blanks (Sunday start)
  for (let i = 0; i < start.getDay(); i++) {
    week.push(null);
  }

  // Fill days of month
  for (let d = 1; d <= end.getDate(); d++) {
    week.push(d);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  // Fill trailing blanks to complete grid
  while (week.length < 7) {
    week.push(null);
  }

  if (week.length > 0) {
    matrix.push(week);
  }

  return matrix;
}

/**
 * Check if a date is in the future
 */
function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getTime() > today.getTime();
}

/**
 * Calendar & History View Screen
 * Displays monthly calendar with workout indicators and workout history list
 */
export function CalendarScreen({ navigation }: Props) {
  // Calendar state
  const [month, setMonth] = useState(new Date());
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<
    WorkoutEntry[]
  >([]);

  // Load workouts on mount and when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, []),
  );

  const loadWorkouts = async () => {
    try {
      const loadedWorkouts = await getWorkouts();
      setWorkouts(loadedWorkouts);
    } catch (error) {
      console.warn("Failed to load workouts", error);
      AccessibilityInfo.announceForAccessibility(
        "Failed to load calendar data",
      );
    }
  };

  const handleRefresh = async () => {
    await loadWorkouts();
  };

  // Generate calendar matrix for current month
  const monthMatrix = useMemo(() => getMonthMatrix(month), [month]);

  // Build map of workouts by day for quick lookup
  const workoutsByDay = useMemo(() => {
    const map = new Map<number, WorkoutEntry[]>();
    const monthIndex = month.getMonth();
    const year = month.getFullYear();

    workouts.forEach((entry) => {
      const date = new Date(entry.timestamp);
      if (date.getFullYear() === year && date.getMonth() === monthIndex) {
        const day = date.getDate();
        if (!map.has(day)) {
          map.set(day, []);
        }
        map.get(day)!.push(entry);
      }
    });

    return map;
  }, [workouts, month]);

  // Month label for display
  const monthLabel = month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  // Navigation handlers
  const prevMonth = () => {
    setMonth((current) => {
      const newDate = new Date(
        current.getFullYear(),
        current.getMonth() - 1,
        1,
      );
      AccessibilityInfo.announceForAccessibility(
        `Showing ${newDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`,
      );
      return newDate;
    });
  };

  const nextMonth = () => {
    setMonth((current) => {
      const newDate = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        1,
      );
      AccessibilityInfo.announceForAccessibility(
        `Showing ${newDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`,
      );
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setMonth(today);
    AccessibilityInfo.announceForAccessibility("Jumped to current month");
  };

  // Day press handler
  const onDayPress = async (day: number) => {
    const selected = new Date(month.getFullYear(), month.getMonth(), day);

    // Check if future date
    if (isFutureDate(selected)) {
      AccessibilityInfo.announceForAccessibility("Cannot view future dates");
      return;
    }

    // Get workouts for selected day
    const startOfDay = new Date(selected);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selected);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const dayWorkouts = await getWorkoutsByDateRange(
        startOfDay.toISOString(),
        endOfDay.toISOString(),
      );

      setSelectedDate(selected);
      setSelectedDayWorkouts(dayWorkouts);
      setModalVisible(true);

      const announcement =
        dayWorkouts.length > 0
          ? `${dayWorkouts.length} workout${dayWorkouts.length > 1 ? "s" : ""} on ${selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}`
          : `No workouts on ${selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}`;
      AccessibilityInfo.announceForAccessibility(announcement);
    } catch (error) {
      console.warn("Failed to get workouts for day", error);
    }
  };

  // Modal handlers
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
    setSelectedDayWorkouts([]);
  };

  const handleAddWorkout = () => {
    // Navigate to Log screen with selected date if available
    if (selectedDate) {
      navigation.navigate("Log", { selectedDate: selectedDate.toISOString() });
    } else {
      navigation.navigate("Log");
    }
    setModalVisible(false);
    AccessibilityInfo.announceForAccessibility("Opening workout log screen");
  };

  // Render calendar day cell
  const renderDayCell = (
    day: number | null,
    weekIndex: number,
    dayIndex: number,
  ) => {
    if (!day) {
      return (
        <CalendarDay
          key={`${weekIndex}-${dayIndex}`}
          day={null}
          isCurrentMonth={false}
          isToday={false}
          isSelected={false}
          workoutCount={0}
          onPress={() => {}}
        />
      );
    }

    const dayWorkouts = workoutsByDay.get(day) || [];
    const isToday =
      day === new Date().getDate() &&
      month.getMonth() === new Date().getMonth() &&
      month.getFullYear() === new Date().getFullYear();

    return (
      <CalendarDay
        key={`${weekIndex}-${dayIndex}`}
        day={day}
        isCurrentMonth
        isToday={isToday}
        isSelected={false}
        workoutCount={dayWorkouts.length}
        onPress={onDayPress}
        accessibilityLabel={`${monthLabel} ${day}`}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} testID="calendar-title">
          Calendar
        </Text>
        <TouchableOpacity
          onPress={goToToday}
          style={styles.todayButton}
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          accessibilityHint="Navigate to current month"
          testID="today-button"
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity
          onPress={prevMonth}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          accessibilityHint="Navigate to previous month"
          testID="prev-month-button"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.monthLabel} testID="month-label">
          {monthLabel}
        </Text>

        <TouchableOpacity
          onPress={nextMonth}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          accessibilityHint="Navigate to next month"
          testID="next-month-button"
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Weekday Headers */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => (
              <Text key={day} style={styles.weekDay} accessibilityRole="header">
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Days */}
          {monthMatrix.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) =>
                renderDayCell(day, weekIndex, dayIndex),
              )}
            </View>
          ))}
        </View>

        {/* Workout History Section */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Workout History</Text>
          <WorkoutHistoryList
            workouts={workouts}
            onRefresh={handleRefresh}
            onWorkoutPress={(workout) => {
              AccessibilityInfo.announceForAccessibility(
                `${workout.type} workout selected`,
              );
            }}
          />
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={modalVisible}
        selectedDate={selectedDate}
        workouts={selectedDayWorkouts}
        onClose={handleCloseModal}
        onAddWorkout={handleAddWorkout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text,
  },
  todayButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 36,
  },
  todayButtonText: {
    color: "#FFFFFF",
    fontSize: typography.small,
    fontWeight: "700",
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  monthLabel: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  calendarContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  historyTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
});
