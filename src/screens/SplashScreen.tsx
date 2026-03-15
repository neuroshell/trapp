import React from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme";

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Text style={styles.title}>FitTrack Pro</Text>
        <Text style={styles.subtitle}>Loading your data...</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
  },
  spinner: {
    marginTop: 24,
  },
});
