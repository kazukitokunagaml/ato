import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    passWithNoTests: true,
    globalSetup: ['src/test/setup-integration.ts'],
    testTimeout: 30000, // Testcontainersは起動に時間がかかる
    hookTimeout: 60000,
    // 結合テストは同じDBを共有するためシーケンシャル実行
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/db/schema.ts'],
    },
  },
})
