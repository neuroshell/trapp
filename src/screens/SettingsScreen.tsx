import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../auth/AuthContext";
import { useSync } from "../hooks/useSync";
import { AppState } from "../models";
import { loadAppState, useAppStorage, loadWorkouts } from "../storage";
import { colors, spacing, typography } from "../theme";

export function SettingsScreen() {
  const { clearAll } = useAppStorage();
  const { user, signOut, useBackendAuth } = useAuth();
  const [state, setState] = useState<AppState>({ entries: [] });
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const { isSyncing, isOnline, lastSyncAt, error, syncNow, fullSync } =
    useSync();

  useEffect(() => {
    (async () => {
      const loaded = await loadAppState();
      setState(loaded);
    })();
  }, []);

  const handleReset = useCallback(() => {
    Alert.alert(
      "Reset data",
      "This will delete all logged entries and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            clearAll();
            Alert.alert("Reset complete", "All entries have been removed.");
          },
        },
      ],
    );
  }, [clearAll]);

  const handleExport = useCallback(async () => {
    try {
      const workouts = await loadWorkouts();
      await Share.share({
        title: "FitTrack export",
        message: JSON.stringify({ workouts, entries: state }, null, 2),
      });
    } catch {
      Alert.alert("Export failed", "Unable to share data.");
    }
  }, [state]);

  const handleSyncNow = useCallback(async () => {
    if (!useBackendAuth) {
      Alert.alert(
        "Backend not connected",
        "You are currently using local authentication. To enable cloud sync, please ensure the backend server is running and try signing in again.",
      );
      return;
    }

    try {
      setSyncStatus("Syncing...");
      const result = await syncNow();
      setSyncStatus(`Sync complete: ${result.downloaded} downloaded, ${result.uploaded} uploaded`);
      Alert.alert(
        "Sync complete",
        `Downloaded: ${result.downloaded}, Uploaded: ${result.uploaded}`,
      );
    } catch (error) {
      setSyncStatus(
        `Sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      Alert.alert(
        "Sync failed",
        error instanceof Error ? error.message : String(error),
      );
    }
  }, [syncNow, useBackendAuth]);

  const handleFullSync = useCallback(async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in before syncing.");
      return;
    }

    if (!useBackendAuth) {
      Alert.alert(
        "Backend not connected",
        "You are currently using local authentication. To enable cloud sync, please ensure the backend server is running and try signing in again.",
      );
      return;
    }

    try {
      setSyncStatus("Performing full sync...");
      const result = await fullSync();
      setSyncStatus(
        `Sync complete: ${result.downloaded} downloaded, ${result.uploaded} uploaded`,
      );
      Alert.alert(
        "Sync complete",
        `Downloaded: ${result.downloaded}, Uploaded: ${result.uploaded}, Conflicts: ${result.conflicts}`,
      );
    } catch (error) {
      setSyncStatus(null);
      Alert.alert(
        "Sync failed",
        error instanceof Error ? error.message : String(error),
      );
    }
  }, [fullSync, user, useBackendAuth]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Sync Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sync Status</Text>
          <View style={styles.syncStatusRow}>
            <Text
              style={[
                styles.statusIndicator,
                { backgroundColor: isOnline ? colors.success : colors.error },
              ]}
            />
            <Text style={styles.statusLabel}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
          {lastSyncAt && (
            <Text style={styles.cardSubtitle}>
              Last sync: {new Date(lastSyncAt).toLocaleString()}
            </Text>
          )}
          {error && (
            <Text style={[styles.cardSubtitle, styles.errorText]}>
              Error: {error}
            </Text>
          )}
          <View style={styles.syncButtons}>
            <Text style={styles.link} onPress={handleSyncNow}>
              {isSyncing ? "Syncing..." : "Sync Now"}
            </Text>
            <Text style={styles.link} onPress={handleFullSync}>
              Full Sync
            </Text>
          </View>
          {syncStatus && (
            <Text
              style={[
                styles.syncStatus,
                syncStatus.includes("failed") ? styles.errorText : null,
              ]}
            >
              {syncStatus}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          {user ? (
            <>
              <Text style={styles.cardSubtitle}>
                Signed in as {user.username}{" "}
                {useBackendAuth ? "(Backend)" : "(Local)"}
              </Text>
              <Text style={styles.link} onPress={signOut}>
                Sign out
              </Text>
            </>
          ) : (
            <Text style={styles.cardSubtitle}>Not signed in.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data</Text>
          <Text style={styles.cardSubtitle}>
            Reset all logged activities and start fresh.
          </Text>
          <Text style={styles.link} onPress={handleReset}>
            Reset data
          </Text>
          <Text style={styles.link} onPress={handleExport}>
            Export data
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardSubtitle}>
            A simple workout logger built with Expo + React Native.
          </Text>
          <Text
            style={styles.link}
            onPress={() => Alert.alert("Version", "1.0.0")}
          >
            Version 1.0.0
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
  cardTitle: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  link: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.primary,
    textDecorationLine: "underline",
  },
  syncStatus: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  syncStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusLabel: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
  },
  syncButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.error,
  },
});
