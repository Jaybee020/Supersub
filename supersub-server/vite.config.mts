import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/node_modules/**', '**/.eslintrc.cjs', 'src/index.ts'],
    },
    setupFiles: ['dotenv/config'],
    fileParallelism: false,
    testTimeout: 10_000,
    restoreMocks: true,
    globals: true,
  },
  plugins: [tsconfigPaths()],
});
