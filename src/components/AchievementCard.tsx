/**
 * AchievementCard Component
 *
 * Displays individual achievement with:
 * - Icon and tier indicator
 * - Title and description
 * - Progress bar for locked achievements
 * - Unlock date for unlocked achievements
 * - Tier-based styling (bronze, silver, gold, platinum, diamond)
 *
 * Accessibility: WCAG 2.1 AA compliant
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";

import { Card } from "./Card";
import { colors, spacing, typography } from "../theme";
import {
  Achievement,
  getTierColor,
  getTierBackgroundColor,
} from "../utils/achievements";

interface Props {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
  showProgress?: boolean;
  testID?: string;
}

export function AchievementCard({
  achievement,
  onPress,
  showProgress = true,
  testID,
}: Props) {
  const tierColor = getTierColor(achievement.tier);
  const tierBgColor = getTierBackgroundColor(achievement.tier);

  // Calculate progress percentage
  const progressPercent = Math.min(
    100,
    Math.round((achievement.progress / achievement.requirement) * 100),
  );

  // Format unlock date
  const formatUnlockDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get accessibility label
  const accessibilityLabel = achievement.unlocked
    ? `${achievement.title}. ${achievement.description}. Unlocked ${achievement.unlockedAt ? formatUnlockDate(achievement.unlockedAt) : ""}`
    : `${achievement.title}. ${achievement.description}. Progress: ${achievement.progress} out of ${achievement.requirement}`;

  const cardContent = (
    <>
      {/* Header with icon and tier badge */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            achievement.unlocked
              ? { backgroundColor: tierBgColor }
              : styles.iconContainerLocked,
          ]}
        >
          <MaterialCommunityIcons
            name={achievement.icon as any}
            size={28}
            color={achievement.unlocked ? tierColor : colors.textSecondary}
            testID="achievement-icon"
          />
          {achievement.unlocked && (
            <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
              <MaterialCommunityIcons
                name="check"
                size={12}
                color={colors.surface}
              />
            </View>
          )}
        </View>

        {/* Title and description */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                !achievement.unlocked && styles.titleLocked,
              ]}
              testID="achievement-title"
            >
              {achievement.title}
            </Text>
            {achievement.unlocked && (
              <View
                style={[styles.tierIndicator, { backgroundColor: tierColor }]}
              >
                <Text style={styles.tierIndicatorText}>
                  {achievement.tier.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.description,
              !achievement.unlocked && styles.descriptionLocked,
            ]}
            testID="achievement-description"
          >
            {achievement.description}
          </Text>
        </View>
      </View>

      {/* Progress or unlock info */}
      {showProgress && (
        <View style={styles.footer}>
          {achievement.unlocked ? (
            <View style={styles.unlockInfo}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.unlockDate} testID="achievement-unlock-date">
                Unlocked {formatUnlockDate(achievement.unlockedAt!)}
              </Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text
                  style={styles.progressText}
                  testID="achievement-progress-text"
                >
                  {achievement.progress} / {achievement.requirement}
                </Text>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
              </View>
              <View
                style={styles.progressBar}
                testID="achievement-progress-bar"
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: tierColor,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </>
  );

  const cardStyle: ViewStyle = [
    styles.container,
    !achievement.unlocked && styles.containerLocked,
  ];

  if (onPress) {
    return (
      <TouchableWithoutFeedback
        onPress={() => onPress(achievement)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        <Card style={cardStyle}>{cardContent}</Card>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <Card style={cardStyle} testID={testID} borderless={!achievement.unlocked}>
      {cardContent}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  containerLocked: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    position: "relative",
  },
  iconContainerLocked: {
    backgroundColor: colors.background,
  },
  tierBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  titleLocked: {
    color: colors.textSecondary,
  },
  tierIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  tierIndicatorText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.surface,
  },
  description: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  descriptionLocked: {
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  unlockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  unlockDate: {
    fontSize: typography.small,
    color: colors.success,
    fontWeight: "600",
  },
  progressContainer: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  progressPercent: {
    fontSize: typography.small,
    fontWeight: "700",
    color: colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});
