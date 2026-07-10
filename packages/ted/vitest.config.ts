import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'ted',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/webgl.mock.ts', './vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/packages/ted',
      reporter: ['json', 'html'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['src/test/**', 'src/**/*.test.{ts,tsx,js,jsx}'],
    },
  },
});
