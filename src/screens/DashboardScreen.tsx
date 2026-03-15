import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>
        This screen will show progress summaries, streaks, and achievements.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming soon</Text>
        <Text style={styles.cardText}>
          Once you have logged workouts, this screen will help you see how you're
          doing over time.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#555",
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    color: "#444",
  },
});
