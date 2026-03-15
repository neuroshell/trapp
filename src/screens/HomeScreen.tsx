import React from "react";
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../navigation/types";
import { Card } from "../components/Card";
import { IconButton } from "../components/IconButton";
import { colors, spacing, typography } from "../theme";

type Props = BottomTabScreenProps<RootTabParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>FitTrack Pro</Text>
        <Text style={styles.subtitle}>Quickly log activity and track progress.</Text>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Streak</Text>
              <Text style={styles.statValue}>🔥 4 days</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Weekly Goal</Text>
              <Text style={styles.statValue}>3 / 5</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <IconButton
            icon="run"
            label="Run"
            onPress={() => navigation.navigate("Log")}
          />
          <IconButton
            icon="arm-flex"
            label="Push-up"
            onPress={() => navigation.navigate("Log")}
          />
        </View>
        <View style={styles.quickRow}>
          <IconButton
            icon="weight-lifter"
            label="Squats"
            onPress={() => navigation.navigate("Log")}
          />
          <IconButton
            icon="hand-back-left"
            label="Pull-up"
            onPress={() => navigation.navigate("Log")}
          />
        </View>

        <Text style={styles.sectionTitle}>Latest Activity</Text>
        <Card style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Your latest workouts will appear here once you start logging activities.
          </Text>
        </Card>
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
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  sectionTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    marginBottom: spacing.sm,
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
  },
});
