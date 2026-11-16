import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/*.test.ts', 'packages/*/tests/*.test.ts'],
    // the fixture tests run the real tools, each in a process of its own
    testTimeout: 60_000,
  },
})
