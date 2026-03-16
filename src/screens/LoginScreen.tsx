import React, { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, spacing, typography } from "../theme";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supportText = useMemo(
    () =>
      "Enter a username and password to sign in. This is stored locally for the demo app.",
    [],
  );

  const handleSignIn = async () => {
    if (!username.trim() || !password) {
      setError("Please enter both a username and password.");
      return;
    }

    setError(null);
    await signIn(username.trim(), password);
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>FitTrack Pro</Text>
        <Text style={styles.subtitle}>{supportText}</Text>

        <Card style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton onPress={handleSignIn} style={styles.button}>
            Sign in
          </PrimaryButton>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  card: {
    padding: spacing.lg,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    fontSize: typography.body,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
});
