import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, shadows } from "../theme";

type Props = {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  borderless?: boolean;
};

export function Card({ children, style, borderless }: Props) {
  return (
    <View style={[styles.container, borderless && styles.borderless, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  borderless: {
    borderWidth: 0,
    shadowOpacity: 0,
  },
});
