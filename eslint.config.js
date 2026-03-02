import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  ignores: ['**/dist/**'],
}, {
  rules: {
    'vue/custom-event-name-casing': ['error', 'kebab-case'],
    'vue/v-on-event-hyphenation': ['error', 'always'],
  },
})
