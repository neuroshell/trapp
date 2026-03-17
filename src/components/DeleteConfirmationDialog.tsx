import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  AccessibilityInfo,
} from "react-native";

import { colors, spacing, typography } from "../theme";

interface DeleteConfirmationDialogProps {
  visible: boolean;
  workoutType: string;
  workoutDate: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({
  visible,
  workoutType,
  workoutDate,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  // Announce dialog to screen readers when it opens
  React.useEffect(() => {
    if (visible) {
      AccessibilityInfo.announceForAccessibility(
        "Delete workout confirmation dialog. This action cannot be undone.",
      );
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
      testID="delete-confirmation-dialog"
    >
      <View style={styles.overlay} accessibilityRole="none">
        <View
          style={styles.dialog}
          accessibilityRole="alert"
          accessibilityLabel="Delete workout confirmation"
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon} accessibilityRole="none">
              ⚠️
            </Text>
          </View>

          {/* Title */}
          <Text
            style={styles.title}
            accessibilityRole="header"
            testID="dialog-title"
          >
            Delete Workout?
          </Text>

          {/* Message */}
          <Text style={styles.message} testID="dialog-message">
            Are you sure you want to delete this{" "}
            <Text style={styles.workoutType}>{workoutType}</Text> workout from{" "}
            {workoutDate}? This action cannot be undone.
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityHint="Keep the workout"
              testID="cancel-button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={[styles.button, styles.deleteButton]}
              accessibilityRole="button"
              accessibilityLabel="Delete workout"
              accessibilityHint="Permanently remove this workout"
              testID="delete-button"
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.error + "20", // 20% opacity
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  workoutType: {
    fontWeight: "600",
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minHeight: 44, // Touch target
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: typography.body,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
