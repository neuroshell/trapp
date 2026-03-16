import "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as React from "react";

import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import {
  AuthStackParamList,
  RootStackParamList,
  RootTabParamList,
} from "./src/navigation/types";
import { AchievementsScreen } from "./src/screens/AchievementsScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LogScreen } from "./src/screens/LogScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SplashScreen } from "./src/screens/SplashScreen";

const Tab = createBottomTabNavigator<RootTabParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      id="root-tab-navigator"
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<
            typeof MaterialCommunityIcons
          >["name"] = "help-circle";

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Log") iconName = "plus-box";
          else if (route.name === "Calendar") iconName = "calendar";
          else if (route.name === "Achievements") iconName = "trophy";
          else if (route.name === "Settings") iconName = "cog";

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      id="auth-stack-navigator"
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <RootStack.Navigator
        id="root-stack-navigator"
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          <RootStack.Screen name="Auth" component={AuthStackScreen} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
