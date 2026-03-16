import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "../components/Card";
import { DateTimeField } from "../components/DateTimeField";
import { PrimaryButton } from "../components/PrimaryButton";
import { ActivityEntry, ActivityType } from "../models";
import { loadAppState, saveAppState } from "../storage";
import { colors, spacing, typography } from "../theme";

const activityTypes: { label: string; value: ActivityType }[] = [
  { label: "Running", value: "running" },
  { label: "Squats", value: "squats" },
  { label: "Push-ups", value: "pushups" },
  { label: "Pull-ups", value: "pullups" },
  { label: "Other", value: "other" },
];

function uuid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function LogScreen() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [type, setType] = useState<ActivityType>("running");
  const [quantity, setQuantity] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    (async () => {
      const state = await loadAppState();
      setEntries(state.entries || []);
    })();
  }, []);

  useEffect(() => {
    saveAppState({ entries });
  }, [entries]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries]);

  const addEntry = () => {
    const numeric = Number(quantity);
    if (!quantity || Number.isNaN(numeric) || numeric <= 0) {
      Alert.alert("Invalid quantity", "Please enter a positive number.");
      return;
    }

    const newEntry: ActivityEntry = {
      id: uuid(),
      type,
      date: date.toISOString(),
      quantity: numeric,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEntries((current) => [newEntry, ...current]);
    setQuantity("");
    setNotes("");
  };

  const formatEntryDate = (iso: string) => {
    const dt = new Date(iso);
    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: ActivityEntry }) => {
    return (
      <Card style={styles.entry}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryType}>{item.type}</Text>
          <Text style={styles.entryDate}>{formatEntryDate(item.date)}</Text>
        </View>
        <Text style={styles.entryQuantity}>{item.quantity}</Text>
        {item.notes ? (
          <Text style={styles.entryNotes}>{item.notes}</Text>
        ) : null}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Log a workout</Text>
      <Card style={styles.formCard}>
        <View style={styles.formRow}>
          <Text style={styles.label}>Activity</Text>
          <View style={styles.selectRow}>
            {activityTypes.map((option) => (
              <PrimaryButton
                key={option.value}
                onPress={() => setType(option.value)}
                active={option.value === type}
                style={styles.typeButton}
              >
                {option.label}
              </PrimaryButton>
            ))}
          </View>
        </View>

        <View style={styles.formRow}>
          <DateTimeField label="Date & time" value={date} onChange={setDate} />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Number of reps / minutes"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Extra detail (sets, distance, etc.)"
            multiline
          />
        </View>

        <PrimaryButton onPress={addEntry} style={styles.saveButton}>
          Save entry
        </PrimaryButton>
      </Card>

      <Text style={styles.sectionTitle}>Recent entries</Text>
      <FlatList
        data={sortedEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.entriesList}
        ListEmptyComponent={<Text style={styles.empty}>No entries yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: spacing.lg,
    color: colors.text,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formRow: {
    marginBottom: spacing.md,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    fontSize: typography.body,
    backgroundColor: colors.surface,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    marginBottom: spacing.sm,
    color: colors.text,
  },
  entriesList: {
    paddingBottom: 80,
  },
  entry: {
    marginBottom: spacing.sm,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  entryType: {
    fontWeight: "700",
    color: colors.text,
  },
  entryDate: {
    color: colors.textSecondary,
  },
  entryQuantity: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: colors.text,
  },
  entryNotes: {
    color: colors.textSecondary,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 24,
  },
  selectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeButton: {
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
