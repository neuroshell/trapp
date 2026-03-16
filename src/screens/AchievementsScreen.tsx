import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ActivityEntry } from "../models";
import { loadAppState } from "../storage";
import { colors, spacing, typography } from "../theme";

const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function AchievementsScreen() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    (async () => {
      const state = await loadAppState();
      setEntries(state.entries || []);
    })();
  }, []);

  const daysWithEntries = useMemo(() => {
    const days = new Set<string>();
    entries.forEach((entry) => {
      const d = normalizeDay(new Date(entry.date));
      days.add(d.toISOString());
    });
    return days;
  }, [entries]);

  const firstLogUnlocked = entries.length > 0;

  const streakDays = useMemo(() => {
    const today = normalizeDay(new Date());
    let streak = 0;
    for (let i = 0; i < 30; i += 1) {
      const check = new Date(today.getTime() - i * MILLIS_PER_DAY);
      if (daysWithEntries.has(normalizeDay(check).toISOString())) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [daysWithEntries]);

  const weeklyGoalMet = useMemo(() => {
    const today = normalizeDay(new Date());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // start Monday

    let dayCount = 0;
    for (let i = 0; i < 7; i += 1) {
      const check = new Date(thisWeekStart.getTime() + i * MILLIS_PER_DAY);
      if (daysWithEntries.has(normalizeDay(check).toISOString())) {
        dayCount += 1;
      }
    }
    return dayCount >= 3;
  }, [daysWithEntries]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Achievements</Text>

        <View
          style={[styles.card, firstLogUnlocked ? styles.cardActive : null]}
        >
          <Text style={styles.cardTitle}>First Log</Text>
          <Text style={styles.cardSubtitle}>
            {firstLogUnlocked
              ? "Nice work!"
              : "Log your first activity to unlock this badge."}
          </Text>
        </View>

        <View style={[styles.card, streakDays >= 7 ? styles.cardActive : null]}>
          <Text style={styles.cardTitle}>Weekly Streak</Text>
          <Text style={styles.cardSubtitle}>
            {streakDays >= 7
              ? `🔥 ${streakDays}-day streak! Keep it up!`
              : `Log activities ${7 - streakDays} more day(s) to earn this.`}
          </Text>
        </View>

        <View style={[styles.card, weeklyGoalMet ? styles.cardActive : null]}>
          <Text style={styles.cardTitle}>Consistency</Text>
          <Text style={styles.cardSubtitle}>
            {weeklyGoalMet
              ? "Great consistency — you hit the 3-day goal this week."
              : "Log activity on 3 different days this week to earn this."}
          </Text>
        </View>
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
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
