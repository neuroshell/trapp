module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|expo|@react-native|@expo|@expo/vector-icons|expo-modules-core|react-native-modal-datetime-picker|@react-navigation|@react-native-community)/)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/web-build/",
    "/backend/",
    "/__e2e__/",  // Exclude Playwright E2E tests
  ],
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",  // Only run tests in __tests__ directory
    "!**/__tests__/integration.test.tsx",  // Exclude integration tests (NetInfo issues)
    "!**/__tests__/HomeScreen.test.tsx",  // Exclude HomeScreen tests (NetInfo issues)
  ],
  moduleNameMapper: {
    "^@expo/vector-icons$": "<rootDir>/__mocks__/@expo/vector-icons.js",
    "^expo-font$": "<rootDir>/__mocks__/expo-font.js",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: ".",
        outputName: "junit.xml",
        addFileAttribute: "true",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
  ],
  coverageReporters: ["text", "lcov", "cobertura"],
};
