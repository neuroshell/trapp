import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../auth/AuthContext";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { AuthStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Register"
>;

type RegisterScreenProps = {
  onNavigateToLogin?: () => void;
};

export function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  const supportText = useMemo(
    () =>
      "Create your account to start tracking your fitness journey. Your data is stored securely on your device.",
    [],
  );

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/\d/.test(password)) {
      errors.password = "Password should contain at least one number";
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Terms acceptance
    if (!acceptsTerms) {
      errors.terms = "You must accept the terms to continue";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(email, password);
      // Navigation will be handled by App.tsx when user state changes
    } catch {
      setFieldErrors({
        general: authError || "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (
    pwd: string,
  ): {
    label: string;
    color: string;
    width: number;
  } => {
    if (pwd.length === 0) {
      return { label: "", color: colors.border, width: 0 };
    }
    if (pwd.length < 6) {
      return { label: "Weak", color: colors.error, width: 33 };
    }
    if (pwd.length < 8 || !/\d/.test(pwd)) {
      return { label: "Fair", color: colors.accent, width: 66 };
    }
    return { label: "Strong", color: colors.success, width: 100 };
  };

  const passwordStrength = getPasswordStrength(password);

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
            <Text style={styles.title} testID="register-title">
              Create Account
            </Text>
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
                  placeholder="Create a password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password, minimum 8 characters"
                />
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${passwordStrength.width}%`,
                            backgroundColor: passwordStrength.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.strengthText}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
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

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text
                  style={styles.label}
                  accessibilityLabel="Confirm password"
                >
                  Confirm Password
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.confirmPassword && styles.inputError,
                  ]}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors({
                        ...fieldErrors,
                        confirmPassword: undefined,
                      });
                    }
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  accessibilityLabel="Confirm password input"
                  accessibilityHint="Re-enter your password to confirm"
                />
                {fieldErrors.confirmPassword && (
                  <Text
                    style={styles.errorText}
                    accessibilityRole="alert"
                    accessibilityLabel={fieldErrors.confirmPassword}
                  >
                    {fieldErrors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Terms Acceptance */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => {
                  setAcceptsTerms(!acceptsTerms);
                  if (fieldErrors.terms) {
                    setFieldErrors({ ...fieldErrors, terms: undefined });
                  }
                }}
                accessibilityRole="checkbox"
                accessibilityLabel="Accept terms and conditions"
                accessibilityHint="Double-tap to accept the terms and conditions"
                accessibilityState={{ checked: acceptsTerms }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptsTerms && styles.checkboxChecked,
                    fieldErrors.terms && styles.checkboxError,
                  ]}
                >
                  {acceptsTerms && (
                    <Text style={styles.checkmark} accessibilityRole="none">
                      ✓
                    </Text>
                  )}
                </View>
                <Text style={styles.termsText}>
                  I accept the{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {fieldErrors.terms && (
                <Text
                  style={styles.errorText}
                  accessibilityRole="alert"
                  accessibilityLabel={fieldErrors.terms}
                >
                  {fieldErrors.terms}
                </Text>
              )}

              {/* General Error */}
              {(fieldErrors.general || authError) && (
                <Text
                  style={styles.errorText}
                  accessibilityRole="alert"
                  accessibilityLabel={
                    fieldErrors.general || authError || undefined
                  }
                >
                  {fieldErrors.general || authError}
                </Text>
              )}

              {/* Register Button */}
              <PrimaryButton
                onPress={handleRegister}
                disabled={isSubmitting}
                style={styles.button}
                testID="register-button"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  "Create Account"
                )}
              </PrimaryButton>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (onNavigateToLogin) {
                      onNavigateToLogin();
                      return;
                    }
                    navigation.navigate("Login");
                  }}
                  accessibilityRole="link"
                  accessibilityLabel="Go to login screen"
                  accessibilityHint="Navigates to the login screen"
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
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
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: typography.small,
    color: colors.textSecondary,
    width: 50,
    textAlign: "right",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.error,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  termsText: {
    flex: 1,
    fontSize: typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    minHeight: 44,
  },
  loginText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});
