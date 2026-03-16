import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ListRenderItemInfo,
  RefreshControl,
  SectionList,
  SectionListData,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { WorkoutEntry } from "../models";
import { getWorkoutsForHistory } from "../storage";
import { colors, spacing, typography } from "../theme";
import { WorkoutHistoryItem } from "./WorkoutHistoryItem";

export interface WorkoutHistoryListProps {
  workouts?: WorkoutEntry[];
  onRefresh?: () => Promise<void>;
  onWorkoutPress?: (workout: WorkoutEntry) => void;
  onWorkoutLongPress?: (workout: WorkoutEntry) => void;
  renderEmptyComponent?: () => React.ReactNode;
}

export interface HistorySection {
  title: string;
  date: string; // ISO date for sorting
  data: WorkoutEntry[];
}

/**
 * Chronological workout history list component
 * Groups workouts by date with section headers
 * Supports pull-to-refresh and empty states
 */
export function WorkoutHistoryList({
  workouts: propWorkouts,
  onRefresh,
  onWorkoutPress,
  onWorkoutLongPress,
  renderEmptyComponent,
}: WorkoutHistoryListProps) {
  const [internalWorkouts, setInternalWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load workouts if not provided via props
  const loadWorkouts = useCallback(async () => {
    if (propWorkouts) {
      setInternalWorkouts(propWorkouts);
      setLoading(false);
      return;
    }

    try {
      const loaded = await getWorkoutsForHistory();
      setInternalWorkouts(loaded);
    } catch (error) {
      console.warn("Failed to load workouts for history", error);
    } finally {
      setLoading(false);
    }
  }, [propWorkouts]);

  React.useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  // Update internal workouts when prop changes
  React.useEffect(() => {
    if (propWorkouts) {
      setInternalWorkouts(propWorkouts);
    }
  }, [propWorkouts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await loadWorkouts();
      }
    } catch (error) {
      console.warn("Failed to refresh workouts", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDateSection = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Group workouts by date
  const sections: SectionListData<WorkoutEntry, HistorySection>[] =
    React.useMemo(() => {
      if (internalWorkouts.length === 0) {
        return [];
      }

      const sectionsMap = new Map<string, WorkoutEntry[]>();

      internalWorkouts.forEach((workout) => {
        const dateKey = workout.timestamp.split("T")[0]; // YYYY-MM-DD
        if (!sectionsMap.has(dateKey)) {
          sectionsMap.set(dateKey, []);
        }
        sectionsMap.get(dateKey)!.push(workout);
      });

      const result: SectionListData<WorkoutEntry, HistorySection>[] = [];
      sectionsMap.forEach((data, date) => {
        result.push({
          title: formatDateSection(date),
          date,
          data,
        });
      });

      // Sort by date descending (newest first)
      return result.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }, [internalWorkouts]);

  const renderSectionHeader = ({ section }: { section: HistorySection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText} testID="section-header">
        {section.title}
      </Text>
      <View style={styles.sectionHeaderLine} />
    </View>
  );

  const renderItem = ({ item }: ListRenderItemInfo<WorkoutEntry>) => (
    <WorkoutHistoryItem
      workout={item}
      onPress={onWorkoutPress}
      onLongPress={onWorkoutLongPress}
    />
  );

  const renderEmpty = () => {
    if (renderEmptyComponent) {
      return renderEmptyComponent();
    }

    return (
      <View style={styles.emptyContainer} accessibilityRole="summary">
        <MaterialCommunityIcons
          name="dumbbell"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyTitle}>No workouts yet</Text>
        <Text style={styles.emptySubtitle}>
          Start tracking your fitness journey by logging your first workout.
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        onRefresh !== undefined ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      contentContainerStyle={
        sections.length === 0 ? styles.emptyListContainer : undefined
      }
      showsVerticalScrollIndicator={false}
      accessibilityRole="list"
      testID="workout-history-list"
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sectionHeaderText: {
    fontSize: typography.small,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
