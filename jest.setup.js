import "@testing-library/jest-native/extend-expect";

// Mock navigation hooks for testing
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useFocusEffect: (effect, deps) => {
      // Use regular useEffect in test environment
      const React = require("react");
      React.useEffect(effect, deps);
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
  };
});

// NOTE: React Native 0.81+ no longer exports NativeAnimatedHelper in the same location.
// If you hit warnings about useNativeDriver, mock the appropriate module here
