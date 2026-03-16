import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityEntry } from "../models";
import { loadAppState } from "../storage";
import { colors, spacing, typography } from "../theme";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthMatrix(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = [];

  // Fill leading blanks
  for (let i = 0; i < start.getDay(); i++) {
    week.push(null);
  }

  for (let d = 1; d <= end.getDate(); d++) {
    week.push(d);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  while (week.length < 7) {
    week.push(null);
  }

  matrix.push(week);
  return matrix;
}

export function CalendarScreen() {
  const [month, setMonth] = useState(new Date());
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    (async () => {
      const state = await loadAppState();
      setEntries(state.entries || []);
    })();
  }, []);

  const monthMatrix = useMemo(() => getMonthMatrix(month), [month]);

  const activeDays = useMemo(() => {
    const set = new Set<number>();
    const monthIndex = month.getMonth();
    const year = month.getFullYear();

    entries.forEach((entry) => {
      const date = new Date(entry.date);
      if (date.getFullYear() === year && date.getMonth() === monthIndex) {
        set.add(date.getDate());
      }
    });

    return set;
  }, [entries, month]);

  const monthLabel = month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const onDayPress = (day: number) => {
    const selected = entries.filter((entry) => {
      const date = new Date(entry.date);
      return (
        date.getFullYear() === month.getFullYear() &&
        date.getMonth() === month.getMonth() &&
        date.getDate() === day
      );
    });

    if (selected.length === 0) return;

    const body = selected
      .map(
        (entry) =>
          `${entry.type} — ${entry.quantity}${entry.notes ? ` (${entry.notes})` : ""}`,
      )
      .join("\n");

    Alert.alert(`${monthLabel} ${day}`, body);
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>
        {monthMatrix.map((week, index) => (
          <View key={index} style={styles.weekRow}>
            {week.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  day && activeDays.has(day) ? styles.dayCellActive : null,
                ]}
                onPress={() => day && onDayPress(day)}
                disabled={!day}
                activeOpacity={0.7}
              >
                {day ? <Text style={styles.dayText}>{day}</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  navButton: {
    padding: spacing.sm,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  monthLabel: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
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
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginHorizontal: 2,
  },
  dayCellActive: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.text,
    fontWeight: "700",
  },
});
