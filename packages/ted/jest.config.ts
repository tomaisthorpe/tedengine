/* eslint-disable */
export default {
  displayName: 'ted',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/ted',
  collectCoverageFrom: ['./src/**/*'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
