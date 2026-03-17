/**
 * Sync Status Indicator Component
 *
 * Displays the current sync status in the UI.
 * Shows different states: online, offline, syncing, error, pending.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { useSync } from "../hooks/useSync";
import { colors, spacing, typography, shadows } from "../theme";

export interface SyncStatusProps {
  /** Show detailed status text (default: false) */
  showDetails?: boolean;
  /** Allow manual sync trigger (default: true) */
  allowManualSync?: boolean;
  /** Compact mode for limited space (default: false) */
  compact?: boolean;
  /** Custom onPress handler (default: triggers sync) */
  onPress?: () => void;
  /** Hide the component when fully synced (default: false) */
  hideWhenSynced?: boolean;
}

/**
 * Format last sync time for display
 */
function formatLastSyncAt(timestamp?: string): string {
  if (!timestamp) return "Never";

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Get status icon based on current sync state
 */
function getStatusIcon(
  isOnline: boolean,
  isSyncing: boolean,
  hasError: boolean,
  hasPending: boolean,
): {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
} {
  if (isSyncing) {
    return { name: "cloud-sync-outline", color: colors.primary };
  }

  if (hasError) {
    return { name: "cloud-off-outline", color: colors.error };
  }

  if (!isOnline) {
    return { name: "wifi-off", color: colors.textSecondary };
  }

  if (hasPending) {
    return { name: "cloud-upload-outline", color: colors.accent };
  }

  return { name: "cloud-check-outline", color: colors.success };
}

/**
 * Get status text based on current sync state
 */
function getStatusText(
  isOnline: boolean,
  isSyncing: boolean,
  hasError: boolean,
  hasPending: boolean,
  lastSyncAt?: string,
): string {
  if (isSyncing) {
    return "Syncing...";
  }

  if (hasError) {
    return "Sync error";
  }

  if (!isOnline) {
    return "Offline";
  }

  if (hasPending) {
    return "Pending sync";
  }

  return `Synced ${formatLastSyncAt(lastSyncAt)}`;
}

/**
 * Sync Status Component
 */
export function SyncStatus({
  showDetails = false,
  allowManualSync = true,
  compact = false,
  hideWhenSynced = false,
}: SyncStatusProps) {
  const { isOnline, isSyncing, lastSyncAt, error, pendingOperations, syncNow } =
    useSync();

  const hasError = !!error;
  const hasPending = pendingOperations > 0;

  // Hide when synced and hideWhenSynced is true
  if (hideWhenSynced && !isSyncing && !hasError && !hasPending && isOnline) {
    return null;
  }

  const icon = getStatusIcon(isOnline, isSyncing, hasError, hasPending);
  const statusText = getStatusText(
    isOnline,
    isSyncing,
    hasError,
    hasPending,
    lastSyncAt,
  );

  const handlePress = () => {
    if (allowManualSync && !isSyncing) {
      syncNow();
    }
  };

  if (compact) {
    // Compact mode: just the icon
    return (
      <View style={styles.compactContainer}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={icon.color} />
        ) : (
          <MaterialCommunityIcons
            name={icon.name}
            size={20}
            color={icon.color}
          />
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        allowManualSync && !isSyncing && styles.pressable,
      ]}
      onPress={handlePress}
      disabled={!allowManualSync || isSyncing}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Sync status: ${statusText}`}
      accessibilityHint={
        allowManualSync && !isSyncing ? "Double tap to sync now" : undefined
      }
    >
      <View style={styles.iconContainer}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={icon.color} />
        ) : (
          <MaterialCommunityIcons
            name={icon.name}
            size={24}
            color={icon.color}
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.statusText} numberOfLines={1}>
          {statusText}
        </Text>

        {showDetails && (
          <>
            {hasPending && (
              <Text style={styles.detailText}>
                {pendingOperations} operation{pendingOperations > 1 ? "s" : ""}{" "}
                pending
              </Text>
            )}

            {error && (
              <Text
                style={[styles.detailText, styles.errorText]}
                numberOfLines={2}
              >
                {error}
              </Text>
            )}

            {lastSyncAt && !hasPending && !error && (
              <Text style={styles.detailText}>
                Last sync: {new Date(lastSyncAt).toLocaleString()}
              </Text>
            )}
          </>
        )}
      </View>

      {allowManualSync && !isSyncing && isOnline && (
        <MaterialCommunityIcons
          name="refresh"
          size={18}
          color={colors.primary}
          style={styles.refreshIcon}
        />
      )}
    </TouchableOpacity>
  );
}

/**
 * Sync Status Badge Component
 *
 * Small badge for showing sync status in headers or tabs
 */
export function SyncBadge() {
  const { isSyncing, pendingOperations, isOnline, error } = useSync();

  if (!isOnline || error) {
    return (
      <View style={[styles.badge, styles.badgeError]}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={12}
          color={colors.surface}
        />
      </View>
    );
  }

  if (isSyncing) {
    return (
      <View style={[styles.badge, styles.badgeSyncing]}>
        <ActivityIndicator size="small" color={colors.surface} />
      </View>
    );
  }

  if (pendingOperations > 0) {
    return (
      <View style={[styles.badge, styles.badgePending]}>
        <Text style={styles.badgeText}>{pendingOperations}</Text>
      </View>
    );
  }

  // Fully synced - don't show badge
  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    ...shadows.card,
  },
  pressable: {
    opacity: 0.9,
  },
  compactContainer: {
    padding: spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  statusText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.text,
  },
  detailText: {
    fontSize: typography.small - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
  },
  refreshIcon: {
    marginLeft: spacing.sm,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeError: {
    backgroundColor: colors.error,
  },
  badgeSyncing: {
    backgroundColor: colors.primary,
  },
  badgePending: {
    backgroundColor: colors.accent,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.surface,
  },
});

export default SyncStatus;
