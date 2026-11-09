module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((@react-native|react-native|@react-navigation|react-native-screens|@react-native-async-storage|firebase|@firebase)/))',
  ],
};
