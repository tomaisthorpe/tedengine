 
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
  coverageReporters: ['json', 'html'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/src/test/webgl.mock.ts',
    '<rootDir>/jest.setup.ts',
  ],
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
};
