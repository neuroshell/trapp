import "@testing-library/jest-native/extend-expect";

global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock navigation hooks for testing
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useFocusEffect: (effect, deps) => {
      // Use regular useEffect in test environment
      const React = require("react");
      React.useEffect(() => {
        // Execute the effect immediately in tests
        const cleanup = effect();
        return cleanup;
      }, deps || []);
    },
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useIsFocused: () => true,
  };
});

// Mock expo modules
jest.mock("expo-status-bar", () => ({
  StatusBar: "StatusBar",
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// NOTE: React Native 0.81+ no longer exports NativeAnimatedHelper in the same location.
// If you hit warnings about useNativeDriver, mock the appropriate module here
