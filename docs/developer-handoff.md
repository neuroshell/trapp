# Trapp Tracker - Developer Handoff Guide

**Version:** 1.0  
**Last Updated:** March 15, 2026  
**Platform:** React Native + Expo (iOS, Android, Web)

---

## Document Overview

This document provides developers with everything needed to implement the Trapp Tracker UI/UX designs. It includes component specifications, code snippets, implementation priorities, and quality assurance checklists.

### For Developers

| Role | Focus Areas |
|------|-------------|
| **Frontend Developers** | Component implementation, state management, navigation |
| **Backend Developers** | API contracts, data models, sync logic |
| **QA Engineers** | Testing checklists, accessibility validation |
| **Tech Leads** | Architecture decisions, code review guidelines |

---

## 1. Implementation Priorities

### 1.1 Phase 1 (MVP) - P0 Components

**Week 1-2: Foundation**

| Priority | Component | File | Estimated Hours |
|----------|-----------|------|-----------------|
| P0 | Button | `src/components/Button.tsx` | 4 |
| P0 | Input | `src/components/Input.tsx` | 4 |
| P0 | Card | `src/components/Card.tsx` | 3 |
| P0 | TabBar | `src/navigation/TabBar.tsx` | 6 |
| P0 | Header | `src/components/Header.tsx` | 3 |

**Week 3-4: Core Screens**

| Priority | Screen | File | Estimated Hours |
|----------|--------|------|-----------------|
| P0 | Login | `src/screens/Auth/LoginScreen.tsx` | 8 |
| P0 | Register | `src/screens/Auth/RegisterScreen.tsx` | 8 |
| P0 | Home | `src/screens/Home/HomeScreen.tsx` | 12 |
| P0 | WorkoutTypeSelect | `src/screens/Workout/WorkoutTypeSelect.tsx` | 6 |
| P0 | RunningForm | `src/screens/Workout/RunningForm.tsx` | 8 |
| P0 | StrengthForm | `src/screens/Workout/StrengthForm.tsx` | 8 |

**Week 5-6: Data & Stats**

| Priority | Screen | File | Estimated Hours |
|----------|--------|------|-----------------|
| P0 | Calendar | `src/screens/Calendar/CalendarScreen.tsx` | 12 |
| P0 | StatsDashboard | `src/screens/Stats/StatsDashboard.tsx` | 10 |
| P0 | AchievementsList | `src/screens/Achievements/AchievementsList.tsx` | 8 |
| P0 | AchievementModal | `src/screens/Achievements/AchievementModal.tsx` | 6 |

### 1.2 Phase 2 - P1 Components

| Priority | Component/Screen | Estimated Hours | Sprint |
|----------|------------------|-----------------|--------|
| P1 | DayDetailView | 6 | Sprint 4 |
| P1 | EditWorkout | 6 | Sprint 4 |
| P1 | DeleteConfirmation | 4 | Sprint 4 |
| P1 | Settings | 8 | Sprint 4 |
| P1 | EmptyStates (all) | 8 | Sprint 4 |
| P1 | ErrorStates (all) | 8 | Sprint 4 |
| P1 | LoadingStates (all) | 8 | Sprint 4 |

### 1.3 Phase 3 - P2 Components

| Priority | Component/Screen | Estimated Hours |
|----------|------------------|-----------------|
| P2 | OnboardingFlow | 16 |
| P2 | ProgressCharts | 12 |
| P2 | AchievementGallery | 10 |
| P2 | WorkoutHistory | 10 |
| P2 | DataExport | 8 |

---

## 2. Component Library

### 2.1 Component Map

```
src/components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── List.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── ProgressBar.tsx
│   └── Skeleton.tsx
├── layout/
│   ├── Screen.tsx
│   ├── Header.tsx
│   ├── TabBar.tsx
│   └── SafeArea.tsx
├── feedback/
│   ├── Spinner.tsx
│   ├── ErrorBoundary.tsx
│   └── EmptyState.tsx
└── workout/
    ├── WorkoutCard.tsx
    ├── WorkoutForm.tsx
    ├── StatCard.tsx
    └── AchievementCard.tsx
```

### 2.2 Button Component

**File:** `src/components/ui/Button.tsx`

```tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  accessibilityHint?: string;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  accessibilityHint,
  style,
  testID,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      style={buttonStyles}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#F57300'} 
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon} </>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#F57300',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#C62828',
  },
  disabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  small: {
    height: 36,
    paddingHorizontal: 16,
  },
  medium: {
    height: 44,
    paddingHorizontal: 24,
  },
  large: {
    height: 52,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#212121',
  },
  tertiaryText: {
    color: '#F57300',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button;
```

**Usage Example:**

```tsx
import { Button } from '@/components/ui/Button';

// Primary button
<Button
  title="Save Workout"
  onPress={handleSave}
  variant="primary"
  fullWidth
/>

// Loading state
<Button
  title="Saving..."
  onPress={handleSave}
  loading={isSaving}
/>

// With icon
<Button
  title="Log Workout"
  onPress={handleLog}
  icon={<Icon name="plus" size={20} />}
/>
```

### 2.3 Input Component

**File:** `src/components/ui/Input.tsx`

```tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  helperText,
  disabled = false,
  required = false,
  accessibilityLabel,
  testID,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const inputStyles = [
    styles.input,
    multiline && styles.multiline,
    error && styles.inputError,
    disabled && styles.inputDisabled,
    isFocused && styles.inputFocused,
    style,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityInvalid={!!error}
          testID={testID}
          style={inputStyles}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#757575"
            />
          </TouchableOpacity>
        )}
        
        {error && (
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color="#C62828"
            style={styles.errorIcon}
          />
        )}
      </View>
      
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    marginBottom: 8,
  },
  required: {
    color: '#C62828',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212121',
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  inputFocused: {
    borderColor: '#F57300',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#C62828',
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#9E9E9E',
  },
  errorIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
});

export default Input;
```

### 2.4 Card Component

**File:** `src/components/ui/Card.tsx`

```tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  style,
  testID,
}) => {
  const cardStyles = [
    styles.card,
    styles[variant],
    styles[`${padding}Padding`],
    style,
  ];

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      onPress={onPress}
      style={cardStyles}
      accessibilityRole={onPress ? 'button' : undefined}
      testID={testID}
    >
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  default: {
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 12,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 24,
  },
});

import { TouchableOpacity } from 'react-native';

export default Card;
```

### 2.5 Workout Card Component

**File:** `src/components/workout/WorkoutCard.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WorkoutCardProps {
  type: 'running' | 'squats' | 'pushups' | 'pullups';
  title: string;
  details: string;
  date: string;
  time?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  isPR?: boolean;
  testID?: string;
}

const workoutConfig = {
  running: {
    icon: 'run',
    color: '#FF6B35',
    bgColor: '#FFF0EB',
  },
  squats: {
    icon: 'dumbbell',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
  },
  pushups: {
    icon: 'arm-flex',
    color: '#2196F3',
    bgColor: '#E3F2FD',
  },
  pullups: {
    icon: 'pull-up',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
};

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  type,
  title,
  details,
  date,
  time,
  onPress,
  onLongPress,
  isPR = false,
  testID,
}) => {
  const config = workoutConfig[type];

  const accessibilityLabel = `${type} workout: ${title}, ${details}, ${date}${time ? ` at ${time}` : ''}${isPR ? ', Personal Record' : ''}`;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Tap to view details, long press for options"
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      testID={testID}
    >
      <View 
        style={[styles.iconContainer, { backgroundColor: config.bgColor }]}
        accessibilityRole="none"
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={config.color}
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {isPR && (
            <View style={styles.prBadge}>
              <Text style={styles.prText}>PR</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.details} numberOfLines={1}>
          {details}
        </Text>
        
        <Text style={styles.date}>
          {date}{time ? ` • ${time}` : ''}
        </Text>
      </View>
      
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color="#BDBDBD"
        style={styles.chevron}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  cardPressed: {
    backgroundColor: '#F5F5F5',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  prBadge: {
    backgroundColor: '#F57300',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  prText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  details: {
    fontSize: 14,
    color: '#757575',
  },
  date: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  chevron: {
    marginLeft: 8,
  },
});

export default WorkoutCard;
```

---

## 3. Screen Implementations

### 3.1 Home Screen

**File:** `src/screens/Home/HomeScreen.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { StatCard } from '@/components/workout/StatCard';
import { Header } from '@/components/layout/Header';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useUser } from '@/hooks/useUser';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useUser();
  const { workouts, loading, refreshWorkouts } = useWorkouts();
  const [refreshing, setRefreshing] = useState(false);

  const weeklyStats = calculateWeeklyStats(workouts);
  const recentWorkouts = workouts.slice(0, 5);
  const currentStreak = calculateStreak(workouts);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWorkouts();
    setRefreshing(false);
  };

  const handleQuickLog = (type: string) => {
    navigation.navigate('WorkoutTypeSelect', { presetType: type });
  };

  if (loading && workouts.length === 0) {
    return <HomeScreenSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={`Good ${getTimeOfDay()}, ${user?.displayName || 'Chris'}!`}
        rightIcon="cog-outline"
        onRightPress={() => navigation.navigate('Settings')}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Streak Card */}
        <Card variant="elevated" style={styles.streakCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakCount}>{currentStreak} days</Text>
            </View>
          </View>
          <Text style={styles.streakMessage}>
            {currentStreak > 0 ? "Keep it up! 🎉" : "Start your first streak!"}
          </Text>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton 
            icon="run" 
            label="Running" 
            color="#FF6B35"
            onPress={() => handleQuickLog('running')}
          />
          <QuickActionButton 
            icon="dumbbell" 
            label="Squats" 
            color="#9C27B0"
            onPress={() => handleQuickLog('squats')}
          />
          <QuickActionButton 
            icon="arm-flex" 
            label="Pushups" 
            color="#2196F3"
            onPress={() => handleQuickLog('pushups')}
          />
          <QuickActionButton 
            icon="pull-up" 
            label="Pullups" 
            color="#4CAF50"
            onPress={() => handleQuickLog('pullups')}
          />
        </View>

        {/* Weekly Stats */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsRow}>
          <StatCard 
            value={weeklyStats.totalWorkouts.toString()}
            label="Workouts"
          />
          <StatCard 
            value={`${weeklyStats.totalDistance}km`}
            label="Total Distance"
          />
        </View>

        {/* Recent Workouts */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <Button
            title="See All"
            variant="tertiary"
            size="small"
            onPress={() => navigation.navigate('Calendar')}
          />
        </View>

        {recentWorkouts.length === 0 ? (
          <EmptyState
            icon="🏃💨"
            title="No workouts yet!"
            message="Start your fitness journey by logging your first workout."
            actionLabel="Log First Workout"
            onAction={() => handleQuickLog('running')}
          />
        ) : (
          recentWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              type={workout.type}
              title={getWorkoutTitle(workout)}
              details={getWorkoutDetails(workout)}
              date={formatDate(workout.timestamp)}
              time={formatTime(workout.timestamp)}
              isPR={workout.isPR}
              onPress={() => navigation.navigate('WorkoutDetail', { id: workout.id })}
              onLongPress={() => showWorkoutOptions(workout)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper components and functions...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  streakCard: {
    marginBottom: 16,
    backgroundColor: 'linear-gradient(135deg, #F57300 0%, #F9AD4E 100%)',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  streakCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  streakMessage: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 8,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default HomeScreen;
```

---

## 4. Navigation Structure

### 4.1 Navigation Map

```tsx
// src/navigation/AppNavigator.tsx

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (Main App)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#F57300',
        tabBarInactiveTintColor: '#9E9E9E',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-month-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Calendar',
        }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-line" size={size} color={color} />
          ),
          tabBarLabel: 'Stats',
        }}
      />
      <Tab.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="trophy-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Achievements',
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator (Auth + Main)
function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="WorkoutTypeSelect" 
            component={WorkoutTypeSelectScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="RunningForm" component={RunningFormScreen} />
          <Stack.Screen name="StrengthForm" component={StrengthFormScreen} />
          <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
```

### 4.2 Screen Options

| Screen | Type | Header | Animation |
|--------|------|--------|-----------|
| Home | Tab | Custom | Default |
| Calendar | Tab | Custom | Default |
| Stats | Tab | Custom | Default |
| Achievements | Tab | Custom | Default |
| WorkoutTypeSelect | Modal | Hidden | Slide up |
| WorkoutForm | Stack | Back button | Slide right |
| Settings | Stack | Back button | Slide right |

---

## 5. State Management

### 5.1 Data Models

```typescript
// src/types/index.ts

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  darkMode: boolean;
  notifications: boolean;
}

export interface Workout {
  id: string;
  userId: string;
  type: WorkoutType;
  timestamp: string;
  data: WorkoutData;
  notes?: string;
  isPR?: boolean;
  createdAt: string;
  updatedAt: string;
  _synced?: boolean;
}

export type WorkoutType = 'running' | 'squats' | 'pushups' | 'pullups';

export interface WorkoutData {
  // Running
  distance?: number; // km
  duration?: number; // minutes
  pace?: number; // min/km
  
  // Strength
  reps?: number;
  sets?: number;
  weight?: number; // kg
}

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  title: string;
  description: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export type AchievementType = 
  | 'consistency'
  | 'streak'
  | 'running'
  | 'squats'
  | 'pushups'
  | 'pullups';
```

### 5.2 Custom Hooks

```typescript
// src/hooks/useWorkouts.ts

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem('@workouts');
      if (data) {
        setWorkouts(JSON.parse(data));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWorkout = useCallback(async (workout: Workout) => {
    try {
      const newWorkouts = [workout, ...workouts];
      await AsyncStorage.setItem('@workouts', JSON.stringify(newWorkouts));
      setWorkouts(newWorkouts);
      
      // Check for achievements
      await checkAchievements(newWorkouts);
      
      return workout;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [workouts]);

  const updateWorkout = useCallback(async (id: string, updates: Partial<Workout>) => {
    try {
      const updatedWorkouts = workouts.map(w => 
        w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
      );
      await AsyncStorage.setItem('@workouts', JSON.stringify(updatedWorkouts));
      setWorkouts(updatedWorkouts);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [workouts]);

  const deleteWorkout = useCallback(async (id: string) => {
    try {
      const filteredWorkouts = workouts.filter(w => w.id !== id);
      await AsyncStorage.setItem('@workouts', JSON.stringify(filteredWorkouts));
      setWorkouts(filteredWorkouts);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [workouts]);

  const refreshWorkouts = useCallback(async () => {
    await loadWorkouts();
  }, [loadWorkouts]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return {
    workouts,
    loading,
    error,
    saveWorkout,
    updateWorkout,
    deleteWorkout,
    refreshWorkouts,
  };
}
```

---

## 6. Asset Export List

### 6.1 Icons (Material Community Icons)

| Icon Name | Usage | Size |
|-----------|-------|------|
| `home-outline` | Tab bar - Home | 24px |
| `calendar-month-outline` | Tab bar - Calendar | 24px |
| `chart-line` | Tab bar - Stats | 24px |
| `trophy-outline` | Tab bar - Achievements | 24px |
| `run` | Running workout | 24px |
| `dumbbell` | Squats workout | 24px |
| `arm-flex` | Pushups workout | 24px |
| `pull-up` | Pullups workout | 24px |
| `plus` | Add button | 24px |
| `pencil-outline` | Edit button | 20px |
| `trash-can-outline` | Delete button | 20px |
| `cog-outline` | Settings | 24px |
| `arrow-left` | Back button | 24px |
| `close` | Close button | 24px |
| `check` | Success indicator | 20px |
| `alert-circle-outline` | Error indicator | 20px |
| `eye` | Show password | 20px |
| `eye-off` | Hide password | 20px |
| `fire` | Streak indicator | 24px |
| `star` | Achievement | 24px |
| `share-variant-outline` | Share button | 20px |

### 6.2 Illustrations (SVG/PNG)

| Asset | Usage | Size | Format |
|-------|-------|------|--------|
| `empty-workouts.svg` | Home empty state | 120×120 | SVG |
| `empty-calendar.svg` | Calendar empty state | 120×120 | SVG |
| `empty-stats.svg` | Stats empty state | 120×120 | SVG |
| `empty-achievements.svg` | Achievements empty | 120×120 | SVG |
| `error-network.svg` | Network error | 120×120 | SVG |
| `error-sync.svg` | Sync error | 120×120 | SVG |
| `logo-full.svg` | Splash screen | 200×200 | SVG |
| `logo-icon.svg` | App icon | 1024×1024 | PNG |

### 6.3 Animation Files (Lottie)

| Animation | Usage | Duration |
|-----------|-------|----------|
| `confetti.json` | Achievement celebration | 2s |
| `success-check.json` | Success confirmation | 1s |
| `loading-spinner.json` | Loading state | Loop |
| `streak-fire.json` | Streak display | Loop |

---

## 7. Quality Assurance Checklist

### 7.1 Pre-Commit Checklist

- [ ] Code follows TypeScript strict mode
- [ ] All components have PropTypes/TypeScript types
- [ ] No console.log statements in production code
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] Unit tests written for new components
- [ ] Accessibility labels added to all interactive elements

### 7.2 Component Review Checklist

- [ ] Touch targets are 44×44pt minimum
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus states defined and visible
- [ ] Disabled states visually distinct
- [ ] Loading states implemented
- [ ] Error states with helpful messages
- [ ] Screen reader labels specified
- [ ] Works with Dynamic Type / Font scaling

### 7.3 Screen Review Checklist

- [ ] All states designed (default, loading, error, empty, success)
- [ ] Navigation flow is logical
- [ ] Back button behavior correct
- [ ] Data persists correctly
- [ ] Offline mode works
- [ ] Keyboard doesn't obscure inputs
- [ ] Safe areas respected (notch handling)

### 7.4 Performance Checklist

- [ ] Images optimized (WebP/SVG where possible)
- [ ] Lists use FlatList with proper keys
- [ ] No unnecessary re-renders (React.memo where needed)
- [ ] Expensive computations memoized (useMemo)
- [ ] Event handlers memoized (useCallback)
- [ ] App loads in under 3 seconds
- [ ] Workout logging completes in under 10 seconds

### 7.5 Testing Checklist

| Test Type | Coverage Target | Tool |
|-----------|-----------------|------|
| Unit Tests | 80%+ | Jest |
| Component Tests | All UI components | React Native Testing Library |
| E2E Tests | Critical paths | Detox |
| Accessibility Tests | All screens | axe, manual testing |

---

## 8. Performance Targets

### 8.1 Key Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| App Cold Start | <3 seconds | Time to interactive |
| Workout Log Time | <10 seconds | Tap to confirmation |
| Screen Transition | <300ms | Animation complete |
| List Scroll FPS | 60 FPS | During scroll |
| Memory Usage | <100MB | Steady state |

### 8.2 Optimization Guidelines

```tsx
// ✅ GOOD: Memoized component
const WorkoutCard = React.memo(({ workout, onPress }) => {
  return (
    <Pressable onPress={() => onPress(workout.id)}>
      {/* Content */}
    </Pressable>
  );
});

// ✅ GOOD: Memoized callback
const handleSave = useCallback(async (data) => {
  await saveWorkout(data);
}, [saveWorkout]);

// ✅ GOOD: Memoized computation
const weeklyStats = useMemo(() => {
  return calculateStats(workouts);
}, [workouts]);

// ✅ GOOD: Virtualized list
<FlatList
  data={workouts}
  renderItem={({ item }) => <WorkoutCard workout={item} />}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

---

## 9. Error Handling

### 9.1 Error Boundary

```tsx
// src/components/feedback/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    // Log to error reporting service
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😕</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We encountered an unexpected error. Please try again.
          </Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false })}
            variant="primary"
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
});
```

### 9.2 Async Error Handling

```tsx
// src/utils/handleAsyncError.ts

export async function handleAsyncError<T>(
  asyncFn: () => Promise<T>,
  options?: {
    retryCount?: number;
    onError?: (error: Error) => void;
    onSuccess?: (result: T) => void;
  }
): Promise<T | null> {
  const { retryCount = 0, onError, onSuccess } = options || {};
  
  try {
    const result = await asyncFn();
    onSuccess?.(result);
    return result;
  } catch (error) {
    const err = error as Error;
    
    if (retryCount > 0) {
      // Retry logic
      return handleAsyncError(asyncFn, {
        retryCount: retryCount - 1,
        onError,
        onSuccess,
      });
    }
    
    onError?.(err);
    return null;
  }
}

// Usage
const result = await handleAsyncError(
  () => saveWorkout(workout),
  {
    retryCount: 2,
    onError: (error) => {
      showErrorToast('Failed to save workout');
    },
  }
);
```

---

## 10. Environment Setup

### 10.1 Required Dependencies

```json
{
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "expo": "~50.0.0",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.4.0",
    "@types/react": "~18.2.45",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "typescript": "^5.3.0"
  }
}
```

### 10.2 Project Structure

```
trapp/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── feedback/
│   │   └── workout/
│   ├── screens/
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── Workout/
│   │   ├── Calendar/
│   │   ├── Stats/
│   │   ├── Achievements/
│   │   └── Settings/
│   ├── navigation/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── assets/
├── docs/
├── __tests__/
├── __mocks__/
└── package.json
```

---

## 11. Code Style Guidelines

### 11.1 Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `WorkoutCard` |
| Files | PascalCase | `WorkoutCard.tsx` |
| Hooks | camelCase with `use` prefix | `useWorkouts` |
| Constants | UPPER_SNAKE_CASE | `WORKOUT_TYPES` |
| Types/Interfaces | PascalCase | `WorkoutData` |
| Test files | `*.test.tsx` | `WorkoutCard.test.tsx` |

### 11.2 Import Order

```tsx
// 1. React
import React, { useState, useEffect } from 'react';

// 2. React Native
import { View, Text, StyleSheet } from 'react-native';

// 3. Third-party
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 4. Internal (absolute imports)
import { Button } from '@/components/ui/Button';
import { useWorkouts } from '@/hooks/useWorkouts';

// 5. Relative imports
import { formatDate } from './utils';

// 6. Types
import type { Workout } from '@/types';
```

---

## 12. Release Checklist

### 12.1 Pre-Release

- [ ] All P0 user stories complete
- [ ] 80%+ test coverage on core features
- [ ] No critical or high-priority bugs
- [ ] Accessibility audit passed
- [ ] Performance targets met
- [ ] App icons and splash screens updated
- [ ] Privacy policy and terms linked

### 12.2 Store Submission

- [ ] App Store screenshots (all sizes)
- [ ] Play Store screenshots
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)

### 12.3 Post-Launch

- [ ] Crash reporting configured
- [ ] Analytics events tracked
- [ ] User feedback channel open
- [ ] Hotfix process documented

---

*This handoff document should be kept up-to-date as implementation progresses. Any deviations from the design must be documented and approved.*

**Last Updated:** March 15, 2026  
**Next Review:** After Sprint 1 complete
