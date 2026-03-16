/**
 * StreakTracker Component
 *
 * Displays workout streak information:
 * - Current streak with fire icon
 * - Longest streak ever
 * - Visual indicator of streak status (active/broken)
 * - Encouraging messages based on streak state
 *
 * Accessibility: WCAG 2.1 AA compliant
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { colors, spacing, typography } from "../theme";
import { StreakData } from "../utils/statistics";

interface Props {
  streak: StreakData;
  testID?: string;
}

export function StreakTracker({ streak, testID }: Props) {
  // Determine streak status message
  const getStatusMessage = () => {
    if (!streak.isActive && streak.currentStreak === 0) {
      if (streak.longestStreak > 0) {
        return `Previous best: ${streak.longestStreak} days`;
      }
      return "Start your first streak!";
    }

    if (!streak.isActive) {
      return `Previous streak: ${streak.currentStreak} days`;
    }

    if (streak.currentStreak >= 30) {
      return "🔥 Legendary streak!";
    }
    if (streak.currentStreak >= 14) {
      return "🔥 Unstoppable!";
    }
    if (streak.currentStreak >= 7) {
      return "🔥 Hot streak!";
    }
    if (streak.currentStreak >= 3) {
      return "🔥 On fire!";
    }
    return "Keep it up!";
  };

  // Get fire icon based on streak intensity
  const getFireIcon = () => {
    if (!streak.isActive || streak.currentStreak === 0) {
      return "fire-off";
    }
    if (streak.currentStreak >= 30) {
      return "star-circle";
    }
    if (streak.currentStreak >= 14) {
      return "local-fire-department";
    }
    if (streak.currentStreak >= 7) {
      return "flame";
    }
    return "fire";
  };

  // Get fire color based on streak
  const getFireColor = () => {
    if (!streak.isActive || streak.currentStreak === 0) {
      return colors.textSecondary;
    }
    if (streak.currentStreak >= 30) {
      return "#FFD700"; // Gold
    }
    if (streak.currentStreak >= 14) {
      return "#FF4500"; // Orange-red
    }
    if (streak.currentStreak >= 7) {
      return "#FF6347"; // Tomato
    }
    return "#FF6B35"; // Standard fire
  };

  const statusMessage = getStatusMessage();
  const fireIcon = getFireIcon();
  const fireColor = getFireColor();

  return (
    <Card
      style={[styles.container, !streak.isActive && styles.inactiveContainer]}
      testID={testID}
    >
      <View style={styles.content}>
        {/* Fire Icon */}
        <View
          style={[styles.iconContainer, { backgroundColor: `${fireColor}15` }]}
        >
          <MaterialCommunityIcons
            name={fireIcon as any}
            size={40}
            color={fireColor}
            testID="streak-fire-icon"
          />
        </View>

        {/* Streak Info */}
        <View style={styles.info}>
          <View style={styles.streakRow}>
            <Text style={styles.currentStreak} testID="current-streak">
              {streak.currentStreak}
            </Text>
            <Text style={styles.streakLabel}>
              {streak.currentStreak === 1 ? "day" : "days"}
            </Text>
          </View>
          <Text style={styles.statusMessage} testID="streak-status">
            {statusMessage}
          </Text>
        </View>
      </View>

      {/* Longest Streak */}
      <View style={styles.footer}>
        <View style={styles.longestStreakInfo}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.longestStreakLabel}>Longest streak:</Text>
          <Text style={styles.longestStreakValue} testID="longest-streak">
            {streak.longestStreak} days
          </Text>
        </View>

        {/* Streak status indicator */}
        {streak.isActive && streak.currentStreak > 0 && (
          <View style={styles.activeIndicator}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        )}
      </View>

      {/* Encouragement for broken streak */}
      {!streak.isActive && streak.longestStreak > 0 && (
        <View style={styles.encouragement} accessibilityRole="text">
          <Text style={styles.encouragementText}>
            💪 Ready to start a new streak?
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
  inactiveContainer: {
    opacity: 0.85,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentStreak: {
    fontSize: 42,
    fontWeight: "700",
    color: colors.text,
    includeFontPadding: false,
  },
  streakLabel: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statusMessage: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  longestStreakInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  longestStreakLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  longestStreakValue: {
    fontSize: typography.small,
    fontWeight: "700",
    color: colors.text,
  },
  activeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  activeText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.success,
  },
  encouragement: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  encouragementText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});
