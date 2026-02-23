import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    env: { VITEST: 'true' },
    include: ['src/**/*.test.ts'],
    testTimeout: 90_000,
    hookTimeout: 60_000,
  },
  plugins: [tsconfigPaths()],
})
