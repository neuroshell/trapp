/**
 * PersonalRecordsList Component
 *
 * Displays personal records for each exercise type:
 * - Best distance/time for running
 * - Best volume (reps × sets) for strength exercises
 * - Date achieved
 * - New PR badge for recently achieved records
 *
 * Accessibility: WCAG 2.1 AA compliant
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { colors, spacing, typography } from "../theme";
import { PersonalRecord } from "../utils/statistics";

interface Props {
  records: PersonalRecord[];
  onRecordPress?: (record: PersonalRecord) => void;
  testID?: string;
}

// Activity type configuration
const activityConfig: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  running: { icon: "run", color: "#FF6B35", label: "Running" },
  squats: { icon: "dumbbell", color: "#9C27B0", label: "Squats" },
  pushups: { icon: "arm-flex", color: "#2196F3", label: "Pushups" },
  pullups: { icon: "weight-lifter", color: "#4CAF50", label: "Pullups" },
  other: { icon: "shoe-sneaker", color: "#757575", label: "Other" },
};

export function PersonalRecordsList({ records, onRecordPress, testID }: Props) {
  // Format date for display
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format value based on activity type
  const formatValue = (record: PersonalRecord): string => {
    if (record.type === "running") {
      return `${record.value.toFixed(1)} km`;
    }
    // For strength exercises, show as total reps
    return `${record.value.toLocaleString()} reps`;
  };

  if (records.length === 0) {
    return (
      <Card style={styles.container} testID={testID}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.title}>Personal Records</Text>
        </View>
        <View style={styles.emptyState} accessibilityRole="text">
          <MaterialCommunityIcons
            name="medal"
            size={40}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>No records yet</Text>
          <Text style={styles.emptySubtext}>
            Log workouts to set your personal records
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container} testID={testID}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="trophy" size={24} color={colors.accent} />
        <Text style={styles.title}>Personal Records</Text>
      </View>

      <View style={styles.recordsList}>
        {records.map((record, index) => {
          const config = activityConfig[record.type];
          const isNew = record.isNew === true;

          return (
            <View
              key={record.workoutId}
              style={[
                styles.recordItem,
                index > 0 && styles.recordItemBorder,
                isNew && styles.newRecordItem,
              ]}
              testID={`pr-item-${record.type}`}
            >
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${config.color}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={config.icon as any}
                  size={20}
                  color={config.color}
                />
              </View>

              {/* Info */}
              <View style={styles.recordInfo}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordType}>{config.label}</Text>
                  {isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={styles.recordValue}
                  testID={`pr-value-${record.type}`}
                >
                  {formatValue(record)}
                </Text>
                <Text style={styles.recordDate}>
                  Set on {formatDate(record.date)}
                </Text>
              </View>

              {/* Trophy icon for visual emphasis */}
              <MaterialCommunityIcons
                name={isNew ? "star" : "trophy-outline"}
                size={20}
                color={isNew ? colors.accent : colors.textSecondary}
              />
            </View>
          );
        })}
      </View>
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
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
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
  recordsList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  recordItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  newRecordItem: {
    backgroundColor: `${colors.accent}08`,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  recordInfo: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  recordType: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
    textTransform: "capitalize",
  },
  newBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.surface,
  },
  recordValue: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },
  recordDate: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
