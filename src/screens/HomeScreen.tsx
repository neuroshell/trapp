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
import { ActivityType, WorkoutEntry } from "../models";
import { RootTabParamList } from "../navigation/types";
import { getWorkouts } from "../storage";
import { colors, spacing, typography } from "../theme";

type Props = BottomTabScreenProps<RootTabParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate stats
  const stats = React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = workouts.filter(
      (w) => new Date(w.timestamp) >= startOfWeek,
    );

    // Calculate streak (consecutive days)
    const uniqueDates = new Set(
      workouts.map((w) => new Date(w.timestamp).toDateString()),
    );
    let streak = 0;
    const currentDate = new Date();
    while (uniqueDates.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Get last workout
    const sortedWorkouts = [...workouts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const lastWorkout = sortedWorkouts[0];

    // Calculate time since last workout
    let lastWorkoutText = "No workouts yet";
    if (lastWorkout) {
      const diffMs = now.getTime() - new Date(lastWorkout.timestamp).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        lastWorkoutText = `${diffMinutes} min ago`;
      } else if (diffHours < 24) {
        lastWorkoutText = `${diffHours}h ago`;
      } else {
        lastWorkoutText = `${diffDays}d ago`;
      }
    }

    return {
      totalWorkouts: workouts.length,
      weeklyWorkouts: thisWeekWorkouts.length,
      weeklyGoal: 5,
      streak,
      lastWorkoutText,
    };
  }, [workouts]);

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>FitTrack Pro</Text>
        <Text style={styles.subtitle}>
          Quickly log activity and track progress.
        </Text>

        {/* Stats Cards */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Streak</Text>
              <Text style={styles.statValue} testID="streak-stat">
                🔥 {stats.streak} {stats.streak === 1 ? "day" : "days"}
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Weekly Goal</Text>
              <Text style={styles.statValue} testID="weekly-goal-stat">
                {stats.weeklyWorkouts} / {stats.weeklyGoal}
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      (stats.weeklyWorkouts / stats.weeklyGoal) * 100,
                      100,
                    )}%`,
                  },
                ]}
                testID="weekly-progress"
              />
            </View>
            <Text style={styles.progressText}>
              {stats.weeklyWorkouts >= stats.weeklyGoal
                ? "🎉 Goal achieved!"
                : `${stats.weeklyGoal - stats.weeklyWorkouts} more to go`}
            </Text>
          </View>
        </Card>

        {/* Last Workout */}
        <Card style={styles.lastWorkoutCard}>
          <Text style={styles.lastWorkoutLabel}>Last Workout</Text>
          <Text style={styles.lastWorkoutValue} testID="last-workout">
            {stats.lastWorkoutText}
          </Text>
        </Card>

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
  statsCard: {
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "700",
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  lastWorkoutCard: {
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastWorkoutLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  lastWorkoutValue: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
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
