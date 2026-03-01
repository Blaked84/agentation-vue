import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    workspace: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'packages/agentation-vue/__tests__/composables/**/*.spec.ts',
            'packages/agentation-vue/__tests__/utils/**/*.spec.ts',
          ],
          environment: 'jsdom',
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          include: [
            'packages/agentation-vue/__tests__/components/**/*.spec.ts',
          ],
          environment: 'jsdom',
        },
      },
    ],
  },
})
