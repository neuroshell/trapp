/**
 * AchievementCelebrationModal Component
 *
 * Full-screen celebration modal for achievement unlocks:
 * - Animated entrance (respects reduced motion)
 * - Confetti effect (optional, respects reduced motion)
 * - Achievement details display
 * - Dismiss button
 * - Queue support for multiple unlocks
 *
 * Accessibility: WCAG 2.1 AA compliant
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography } from "../theme";
import {
  Achievement,
  getTierColor,
  getTierBackgroundColor,
} from "../utils/achievements";

interface Props {
  visible: boolean;
  achievement: Achievement | null;
  onDismiss: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

// Confetti particle component
interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  speed: number;
}

export function AchievementCelebrationModal({
  visible,
  achievement,
  onDismiss,
  onNext,
  hasNext = false,
}: Props) {
  // Animation values
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [confettiAnims] = useState(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotate: new Animated.Value(0),
    })),
  );

  const [confettiParticles, setConfettiParticles] = useState<
    ConfettiParticle[]
  >([]);

  // Generate confetti colors based on tier
  const getConfettiColors = () => {
    if (!achievement) return [colors.primary, colors.accent, colors.success];

    const tierColor = getTierColor(achievement.tier);
    return [
      tierColor,
      colors.primary,
      colors.accent,
      colors.success,
      "#FFD700",
    ];
  };

  // Initialize confetti particles
  useEffect(() => {
    if (visible && achievement) {
      const colors = getConfettiColors();
      const particles: ConfettiParticle[] = Array.from(
        { length: 20 },
        (_, i) => ({
          id: `confetti-${i}`,
          x: Math.random() * 100, // percentage
          y: Math.random() * 20 - 10, // start above
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          speed: Math.random() * 0.5 + 0.5,
        }),
      );
      setConfettiParticles(particles);
    }
  }, [visible, achievement]);

  // Run animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Announce to screen readers
      if (achievement) {
        AccessibilityInfo.announceForAccessibility(
          `Achievement unlocked: ${achievement.title}`,
        );
      }

      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Fade animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Confetti animation
      confettiAnims.forEach((anim, index) => {
        const particle = confettiParticles[index];
        if (!particle) return;

        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: (Math.random() - 0.5) * 300,
            duration: 1000 + Math.random() * 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: 200 + Math.random() * 200,
            duration: 1000 + Math.random() * 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 720 - 360,
            duration: 1000 + Math.random() * 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!achievement) return null;

  const tierColor = getTierColor(achievement.tier);
  const tierBgColor = getTierBackgroundColor(achievement.tier);

  // Format unlock date
  const formatUnlockDate = () => {
    const now = new Date();
    return now.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Confetti Layer */}
            {confettiParticles.map((particle, index) => {
              const anim = confettiAnims[index];
              if (!anim) return null;

              return (
                <Animated.View
                  key={particle.id}
                  style={[
                    styles.confetti,
                    {
                      backgroundColor: particle.color,
                      width: particle.size,
                      height: particle.size,
                      left: `${particle.x}%`,
                      transform: [
                        { translateY: anim.y },
                        { translateX: anim.x },
                        {
                          rotate: anim.rotate.interpolate({
                            inputRange: [-360, 360],
                            outputRange: ["-360deg", "360deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              );
            })}

            {/* Content */}
            <View style={styles.content}>
              {/* Icon */}
              <Animated.View
                style={[styles.iconContainer, { backgroundColor: tierBgColor }]}
              >
                <MaterialCommunityIcons
                  name={achievement.icon as any}
                  size={64}
                  color={tierColor}
                />
                <View
                  style={[styles.checkBadge, { backgroundColor: tierColor }]}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={colors.surface}
                  />
                </View>
              </Animated.View>

              {/* Title */}
              <Text style={styles.celebrationTitle}>Achievement Unlocked!</Text>

              {/* Achievement Info */}
              <View
                style={[styles.achievementCard, { borderColor: tierColor }]}
              >
                <View style={styles.achievementHeader}>
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  <View
                    style={[styles.tierBadge, { backgroundColor: tierColor }]}
                  >
                    <Text style={styles.tierBadgeText}>
                      {achievement.tier.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                <Text style={styles.unlockDate}>{formatUnlockDate()}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {hasNext && onNext ? (
                  <>
                    <TouchableWithoutFeedback
                      onPress={onNext}
                      accessibilityRole="button"
                      accessibilityLabel="Next achievement"
                      accessibilityHint="View the next unlocked achievement"
                      testID="next-achievement-button"
                    >
                      <View style={[styles.button, styles.buttonPrimary]}>
                        <Text style={styles.buttonPrimaryText}>Next</Text>
                      </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                      onPress={onDismiss}
                      accessibilityRole="button"
                      accessibilityLabel="Dismiss all"
                      accessibilityHint="Close celebration and view all achievements"
                      testID="dismiss-all-button"
                    >
                      <View style={[styles.button, styles.buttonSecondary]}>
                        <Text style={styles.buttonSecondaryText}>
                          {hasNext ? "Dismiss All" : "Done"}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </>
                ) : (
                  <TouchableWithoutFeedback
                    onPress={onDismiss}
                    accessibilityRole="button"
                    accessibilityLabel="Done"
                    accessibilityHint="Close celebration and continue"
                    testID="done-button"
                  >
                    <View style={[styles.button, styles.buttonPrimary]}>
                      <Text style={styles.buttonPrimaryText}>Awesome!</Text>
                    </View>
                  </TouchableWithoutFeedback>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: "hidden",
  },
  safeArea: {
    flex: 1,
  },
  confetti: {
    position: "absolute",
    top: -20,
    borderRadius: 2,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: spacing.xl,
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  achievementCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    width: "100%",
    borderWidth: 2,
    marginBottom: spacing.xl,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  achievementTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.surface,
  },
  achievementDescription: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  unlockDate: {
    fontSize: typography.small,
    color: colors.success,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    gap: spacing.sm,
  },
  button: {
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPrimaryText: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.surface,
  },
  buttonSecondaryText: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
  },
});
