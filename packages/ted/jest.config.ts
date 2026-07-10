export default {
  displayName: 'ted',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
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
