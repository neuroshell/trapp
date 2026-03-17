/**
 * WeeklySummaryCard Component
 *
 * Displays weekly workout statistics including:
 * - Total workouts this week
 * - Total duration (running)
 * - Total distance (running)
 * - Total reps (strength)
 * - Breakdown by activity type
 *
 * Accessibility: WCAG 2.1 AA compliant
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { colors, spacing, typography } from "../theme";
import { WeeklyStats } from "../utils/statistics";

interface Props {
  stats: WeeklyStats;
  testID?: string;
}

export function WeeklySummaryCard({ stats, testID }: Props) {
  // Format week date range
  const weekRange = `${stats.weekStart.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} - ${stats.weekEnd.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;

  // Activity type icons and colors
  const activityInfo: Record<
    string,
    { icon: string; color: string; label: string }
  > = {
    running: { icon: "run", color: "#FF6B35", label: "Runs" },
    squats: { icon: "dumbbell", color: "#9C27B0", label: "Squats" },
    pushups: { icon: "arm-flex", color: "#2196F3", label: "Pushups" },
    pullups: { icon: "weight-lifter", color: "#4CAF50", label: "Pullups" },
    other: { icon: "shoe-sneaker", color: "#757575", label: "Other" },
  };

  // Calculate total from all types
  const totalFromTypes = Object.values(stats.byType).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <Card style={styles.container} testID={testID}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="calendar-week"
          size={24}
          color={colors.primary}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>This Week</Text>
          <Text style={styles.dateRange}>{weekRange}</Text>
        </View>
      </View>

      {/* Main Stats */}
      <View style={styles.mainStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue} testID="weekly-total-workouts">
            {stats.totalWorkouts}
          </Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>

        {stats.totalDistance > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statValue} testID="weekly-distance">
              {stats.totalDistance.toFixed(1)} km
            </Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        )}

        {stats.totalDuration > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statValue} testID="weekly-duration">
              {Math.round(stats.totalDuration)} min
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        )}

        {stats.totalReps > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statValue} testID="weekly-reps">
              {stats.totalReps.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Reps</Text>
          </View>
        )}
      </View>

      {/* Breakdown by Type */}
      {totalFromTypes > 0 && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Breakdown</Text>
          <View style={styles.breakdownList}>
            {Object.entries(stats.byType).map(([type, count]) => {
              if (count === 0) return null;
              const info = activityInfo[type];
              return (
                <View key={type} style={styles.breakdownItem}>
                  <View style={styles.breakdownIcon}>
                    <MaterialCommunityIcons
                      name={info.icon as any}
                      size={16}
                      color={info.color}
                    />
                  </View>
                  <Text style={styles.breakdownCount}>{count}</Text>
                  <Text style={styles.breakdownLabel}>{info.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Empty State */}
      {stats.totalWorkouts === 0 && (
        <View style={styles.emptyState} accessibilityRole="text">
          <MaterialCommunityIcons
            name="dumbbell"
            size={32}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>No workouts this week</Text>
          <Text style={styles.emptySubtext}>
            Start logging to track your progress
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
  },
  dateRange: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
  breakdown: {
    marginTop: spacing.md,
  },
  breakdownTitle: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  breakdownList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  breakdownIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownCount: {
    fontSize: typography.small,
    fontWeight: "700",
    color: colors.text,
  },
  breakdownLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
