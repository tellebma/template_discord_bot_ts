import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/deploy-commands.ts',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ['verbose'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/commands': resolve(__dirname, './src/commands'),
      '@/events': resolve(__dirname, './src/events'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/fonctions': resolve(__dirname, './src/fonctions'),
    },
  },
});
