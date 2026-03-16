import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../auth/AuthContext";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, spacing, typography } from "../theme";

export function LoginScreen({
  onNavigateToRegister,
}: {
  onNavigateToRegister?: () => void;
}) {
  const { signIn, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const supportText = useMemo(
    () =>
      "Enter your email and password to sign in. Your data is stored securely on your device.",
    [],
  );

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setFieldErrors({
        general: authError || "Login failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            <Text style={styles.title}>FitTrack Pro</Text>
            <Text style={styles.subtitle}>{supportText}</Text>

            <Card style={styles.card}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label} accessibilityLabel="Email address">
                  Email
                </Text>
                <TextInput
                  style={[styles.input, fieldErrors.email && styles.inputError]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: undefined });
                    }
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email address input"
                  accessibilityHint="Enter your email address"
                  accessibilityInvalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <Text
                    style={styles.errorText}
                    accessibilityRole="alert"
                    accessibilityLabel={fieldErrors.email}
                  >
                    {fieldErrors.email}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label} accessibilityLabel="Password">
                  Password
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.password && styles.inputError,
                  ]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: undefined });
                    }
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password"
                  accessibilityInvalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                  <Text
                    style={styles.errorText}
                    accessibilityRole="alert"
                    accessibilityLabel={fieldErrors.password}
                  >
                    {fieldErrors.password}
                  </Text>
                )}
              </View>

              {/* General Error */}
              {(fieldErrors.general || authError) && (
                <Text
                  style={styles.errorText}
                  accessibilityRole="alert"
                  accessibilityLabel={fieldErrors.general || authError}
                >
                  {fieldErrors.general || authError}
                </Text>
              )}

              {/* Login Button */}
              <PrimaryButton
                onPress={handleSignIn}
                disabled={isSubmitting}
                style={styles.button}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  "Sign In"
                )}
              </PrimaryButton>

              {/* Register Link */}
              {onNavigateToRegister && (
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>
                    Don't have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={onNavigateToRegister}
                    accessibilityRole="link"
                    accessibilityLabel="Go to registration screen"
                    accessibilityHint="Navigates to the account creation screen"
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Text style={styles.registerLink}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
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
    fontSize: typography.body,
  },
  card: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    fontSize: typography.body,
    backgroundColor: colors.surface,
    minHeight: 48,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.small,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    minHeight: 44,
  },
  registerText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});
