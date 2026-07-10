/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { codecovVitePlugin } from '@codecov/vite-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import tsconfigPaths from 'vite-tsconfig-paths';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root: __dirname,
  // Keep emitted worker URLs relative to the package entry point. An absolute
  // base makes consumers look for the worker in their own public directory.
  base: './',
  cacheDir: '../../node_modules/.vite/ted',
  plugins: [
    dts({
      entryRoot: 'src',
      include: ['src'],
      exclude: ['src/test/**'],
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
    react(),
    tsconfigPaths(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: '@tedengine/ted',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],

  assetsInclude: ['**/*.obj', '**/*.mtl', '**/*.program', '**/*.ldtk'],

  // Uncomment this if you are using workers.
  worker: {
    format: 'es',
    plugins: () => [tsconfigPaths()],
  },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    assetsDir: 'workers',
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'ted',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
