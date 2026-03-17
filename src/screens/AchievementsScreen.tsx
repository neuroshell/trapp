/**
 * AchievementsScreen Component
 *
 * Full achievement gallery with:
 * - Filter by category (all, consistency, streak, exercise)
 * - Filter by status (all, unlocked, locked)
 * - Achievement cards with progress
 * - Completion percentage
 * - Achievement celebration modal
 *
 * Accessibility: WCAG 2.1 AA compliant
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AchievementCard } from "../components/AchievementCard";
import { AchievementCelebrationModal } from "../components/AchievementCelebrationModal";
import { getWorkouts } from "../storage";
import { colors, spacing, typography } from "../theme";
import {
  Achievement,
  AchievementCategory,
  calculateAllAchievementProgress,
  calculateCompletionPercentage,
  getAchievementsByCategory,
  getLockedAchievements,
  getUnlockedAchievements,
  sortAchievementsByTier,
} from "../utils/achievements";
import { calculateStreak } from "../utils/statistics";

type FilterType = "all" | "unlocked" | "locked";

export function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<
    AchievementCategory | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");

  // Celebration modal state
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [achievementsToCelebrate, setAchievementsToCelebrate] = useState<
    Achievement[]
  >([]);
  const [currentCelebrationIndex, setCurrentCelebrationIndex] = useState(0);

  // Load achievements on focus
  useFocusEffect(
    useCallback(() => {
      loadAchievements();
    }, []),
  );

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const workouts = await getWorkouts();
      console.log("AchievementsScreen: Loaded workouts:", workouts.length);

      const newStreak = calculateStreak(workouts);
      console.log(
        "AchievementsScreen: Calculated streak:",
        newStreak.currentStreak,
      );

      // Calculate all achievement progress
      const allAchievements = calculateAllAchievementProgress(
        workouts,
        newStreak,
      );
      console.log(
        "AchievementsScreen: Calculated achievements:",
        allAchievements.length,
      );
      if (allAchievements.length > 0) {
        console.log(
          "AchievementsScreen: First achievement:",
          JSON.stringify(allAchievements[0], null, 2),
        );
      }

      setAchievements(allAchievements);

      // Check for new achievements to celebrate
      const newlyUnlocked = allAchievements.filter(
        (a) => a.unlocked && !a.unlockedAt,
      );

      if (newlyUnlocked.length > 0) {
        setAchievementsToCelebrate(newlyUnlocked);
        setCurrentCelebrationIndex(0);
        setCelebrationVisible(true);
      }
    } catch (error) {
      console.warn("Failed to load achievements", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter achievements
  const filteredAchievements = React.useMemo(() => {
    let result = achievements;

    // Apply category filter
    if (categoryFilter !== "all") {
      result = getAchievementsByCategory(result, categoryFilter);
    }

    // Apply status filter
    if (statusFilter === "unlocked") {
      result = getUnlockedAchievements(result);
    } else if (statusFilter === "locked") {
      result = getLockedAchievements(result);
    }

    // Sort by tier
    result = sortAchievementsByTier(result);

    return result;
  }, [achievements, categoryFilter, statusFilter]);

  // Calculate completion
  const completionPercentage = calculateCompletionPercentage(achievements);
  const unlockedCount = getUnlockedAchievements(achievements).length;
  const totalCount = achievements.length;

  // Handle celebration navigation
  const handleNextCelebration = () => {
    if (currentCelebrationIndex < achievementsToCelebrate.length - 1) {
      setCurrentCelebrationIndex(currentCelebrationIndex + 1);
    } else {
      setCelebrationVisible(false);
      setAchievementsToCelebrate([]);
      setCurrentCelebrationIndex(0);
      // Reload to update achievement states
      loadAchievements();
    }
  };

  const handleDismissCelebration = () => {
    setCelebrationVisible(false);
    setAchievementsToCelebrate([]);
    setCurrentCelebrationIndex(0);
    loadAchievements();
  };

  // Category filter buttons
  const categories: {
    key: AchievementCategory | "all";
    label: string;
    icon: string;
  }[] = [
    { key: "all", label: "All", icon: "trophy" },
    { key: "consistency", label: "Consistency", icon: "calendar-check" },
    { key: "streak", label: "Streak", icon: "fire" },
    { key: "exercise", label: "Exercise", icon: "dumbbell" },
  ];

  // Status filter buttons
  const statusFilters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unlocked", label: "Unlocked" },
    { key: "locked", label: "Locked" },
  ];

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>

          {/* Completion Summary */}
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <MaterialCommunityIcons
                name="trophy-award"
                size={24}
                color={colors.accent}
              />
              <Text style={styles.completionLabel}>Overall Progress</Text>
            </View>
            <View style={styles.completionContent}>
              <Text
                style={styles.completionPercentage}
                testID="completion-percentage"
              >
                {completionPercentage}%
              </Text>
              <Text style={styles.completionCount}>
                {unlockedCount} of {totalCount} unlocked
              </Text>
            </View>
            <View style={styles.completionBar}>
              <View
                style={[
                  styles.completionBarFill,
                  { width: `${completionPercentage}%` },
                ]}
                testID="completion-bar"
              />
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {categories.map((cat) => (
              <TouchableWithoutFeedback
                key={cat.key}
                onPress={() => setCategoryFilter(cat.key)}
                accessibilityRole="tab"
                accessibilityLabel={cat.label}
                accessibilityState={{ selected: categoryFilter === cat.key }}
                testID={`category-filter-${cat.key}`}
              >
                <View
                  style={[
                    styles.filterButton,
                    categoryFilter === cat.key && styles.filterButtonActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={18}
                    color={
                      categoryFilter === cat.key
                        ? colors.surface
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      categoryFilter === cat.key &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </ScrollView>
        </View>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.statusFilterContainer}>
            {statusFilters.map((filter) => (
              <TouchableWithoutFeedback
                key={filter.key}
                onPress={() => setStatusFilter(filter.key)}
                accessibilityRole="tab"
                accessibilityLabel={filter.label}
                accessibilityState={{ selected: statusFilter === filter.key }}
                testID={`status-filter-${filter.key}`}
              >
                <View
                  style={[
                    styles.statusFilterButton,
                    statusFilter === filter.key &&
                      styles.statusFilterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusFilterButtonText,
                      statusFilter === filter.key &&
                        styles.statusFilterButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsSection}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading achievements...</Text>
            </View>
          ) : filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="trophy-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>No achievements found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters
              </Text>
            </View>
          ) : (
            <View style={styles.achievementsList}>
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Celebration Modal */}
      {achievementsToCelebrate.length > 0 && (
        <AchievementCelebrationModal
          visible={celebrationVisible}
          achievement={achievementsToCelebrate[currentCelebrationIndex] || null}
          onDismiss={handleDismissCelebration}
          onNext={handleNextCelebration}
          hasNext={currentCelebrationIndex < achievementsToCelebrate.length - 1}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  completionLabel: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  completionContent: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  completionPercentage: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.accent,
  },
  completionCount: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  completionBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  completionBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  filterSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterContainer: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.surface,
  },
  statusFilterContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statusFilterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  statusFilterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusFilterButtonText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  statusFilterButtonTextActive: {
    color: colors.surface,
  },
  achievementsSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  achievementsList: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
