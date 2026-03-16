import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components/Card";
import {
  QuickLogButton,
  QUICK_LOG_BUTTONS,
} from "../components/QuickLogButton";
import { StreakTracker } from "../components/StreakTracker";
import { WeeklySummaryCard } from "../components/WeeklySummaryCard";
import { ActivityType, WorkoutEntry } from "../models";
import { RootTabParamList } from "../navigation/types";
import { getWorkouts } from "../storage";
import { colors, spacing, typography } from "../theme";
import {
  calculateStreak,
  calculateWeeklyStats,
  StreakData,
  WeeklyStats,
} from "../utils/statistics";

type Props = BottomTabScreenProps<RootTabParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    streakDates: [],
    isActive: false,
  });
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);

  // Load workouts when screen gains focus
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

      // Calculate statistics
      const newStreak = calculateStreak(loadedWorkouts);
      setStreak(newStreak);

      const newWeeklyStats = calculateWeeklyStats(loadedWorkouts);
      setWeeklyStats(newWeeklyStats);
    } catch (error) {
      console.warn("Failed to load workouts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = (type: ActivityType) => {
    // Navigate to Log screen with preset type
    navigation.navigate("Log");
    // Note: In a full implementation, we'd pass the type as a param
    // and pre-select it in the LogScreen
  };

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>FitTrack Pro</Text>
        <Text style={styles.subtitle}>
          Track your workouts and crush your goals.
        </Text>

        {/* Streak Tracker */}
        <StreakTracker streak={streak} testID="home-streak-tracker" />

        {/* Weekly Summary */}
        {weeklyStats && (
          <WeeklySummaryCard stats={weeklyStats} testID="home-weekly-summary" />
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {QUICK_LOG_BUTTONS.slice(0, 2).map((button) => (
            <QuickLogButton
              key={button.type}
              workoutType={button.type}
              label={button.label}
              onPress={handleQuickLog}
              icon={button.icon}
              color={button.color}
              backgroundColor={button.backgroundColor}
              testID={`quick-log-${button.type}`}
            />
          ))}
        </View>
        <View style={styles.quickRow}>
          {QUICK_LOG_BUTTONS.slice(2, 4).map((button) => (
            <QuickLogButton
              key={button.type}
              workoutType={button.type}
              label={button.label}
              onPress={handleQuickLog}
              icon={button.icon}
              color={button.color}
              backgroundColor={button.backgroundColor}
              testID={`quick-log-${button.type}`}
            />
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {loading ? (
          <Card style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Loading...</Text>
          </Card>
        ) : workouts.length === 0 ? (
          <Card style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>
              Your latest workouts will appear here once you start logging
              activities.
            </Text>
          </Card>
        ) : (
          <Card style={styles.recentCard}>
            {workouts
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime(),
              )
              .slice(0, 3)
              .map((workout, index) => (
                <View
                  key={workout.id}
                  style={[
                    styles.recentItem,
                    index > 0 && styles.recentItemBorder,
                  ]}
                >
                  <Text style={styles.recentType}>{workout.type}</Text>
                  <Text style={styles.recentSummary}>
                    {workout.type === "running"
                      ? `${workout.data.distance?.toFixed(1)} km • ${workout.data.duration?.toFixed(0)} min`
                      : `${workout.data.sets} × ${workout.data.reps}${workout.data.weight ? ` • ${workout.data.weight} kg` : ""}`}
                  </Text>
                  <Text style={styles.recentTime}>
                    {new Date(workout.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}
            {workouts.length > 3 && (
              <Text style={styles.viewAllText}>
                +{workouts.length - 3} more workouts
              </Text>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  placeholderCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: "center",
  },
  recentCard: {
    padding: 0,
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  recentItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recentType: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
    textTransform: "capitalize",
    width: 80,
  },
  recentSummary: {
    flex: 1,
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  recentTime: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  viewAllText: {
    fontSize: typography.small,
    color: colors.primary,
    textAlign: "center",
    paddingVertical: spacing.md,
    fontWeight: "600",
  },
});
