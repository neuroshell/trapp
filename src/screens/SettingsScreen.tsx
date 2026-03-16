import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../auth/AuthContext";
import { AppState } from "../models";
import {
  getDeviceId,
  loadAppState,
  saveAppState,
  useAppStorage,
} from "../storage";
import { colors, spacing, typography } from "../theme";

const DEFAULT_SYNC_URL = "http://localhost:4000";

export function SettingsScreen() {
  const { clearAll } = useAppStorage();
  const { user, passwordHash, signOut } = useAuth();
  const [state, setState] = useState<AppState>({ entries: [] });
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

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
      await Share.share({
        title: "FitTrack export",
        message: JSON.stringify(state, null, 2),
      });
    } catch {
      Alert.alert("Export failed", "Unable to share data.");
    }
  }, [state]);

  const handleSync = useCallback(async () => {
    if (!user?.username || !passwordHash) {
      Alert.alert("Sign in required", "Please sign in before syncing.");
      return;
    }

    try {
      setSyncStatus("Syncing...");
      const deviceId = await getDeviceId();
      const res = await fetch(`${DEFAULT_SYNC_URL}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          passwordHash,
          deviceId,
          payload: state,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Sync failed");
      }
      setSyncStatus("Sync complete");
      Alert.alert("Sync complete", "Your data was uploaded to the server.");
    } catch (error) {
      setSyncStatus(null);
      Alert.alert("Sync failed", String(error));
    }
  }, [state, passwordHash, user?.username]);

  const handleFetch = useCallback(async () => {
    if (!user?.username || !passwordHash) {
      Alert.alert(
        "Sign in required",
        "Please sign in before fetching remote data.",
      );
      return;
    }

    try {
      setSyncStatus("Downloading...");
      const deviceId = await getDeviceId();
      const res = await fetch(
        `${DEFAULT_SYNC_URL}/sync?deviceId=${encodeURIComponent(deviceId)}&username=${encodeURIComponent(
          user.username,
        )}&passwordHash=${encodeURIComponent(passwordHash)}`,
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Fetch failed");
      }
      if (json?.device?.payload) {
        await saveAppState(json.device.payload);
        setState(json.device.payload);
        Alert.alert("Sync complete", "Imported data from the server.");
      } else {
        Alert.alert("No data", "No data found for this device.");
      }
      setSyncStatus(null);
    } catch (error) {
      setSyncStatus(null);
      Alert.alert("Sync failed", String(error));
    }
  }, [passwordHash, user?.username]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          {user ? (
            <>
              <Text style={styles.cardSubtitle}>
                Signed in as {user.username}
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
          <Text style={styles.link} onPress={handleSync}>
            Sync to server
          </Text>
          <Text style={styles.link} onPress={handleFetch}>
            Download remote data
          </Text>
          {syncStatus ? (
            <Text style={styles.syncStatus}>{syncStatus}</Text>
          ) : null}
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
});
