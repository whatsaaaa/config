// The React block of form-builder's eslint.config.ts, as it is there. The rest of that config is
// form-builder's own (eslint-plugin-boundaries) or the skeleton design-system and ui-vue share.
import pluginReactHooks from 'eslint-plugin-react-hooks'

export default {
  // The rules of hooks and the React Compiler's checks, for the React code.
  ...pluginReactHooks.configs.flat.recommended,
  name: 'app/react',
  files: ['frameworks/react/**/*.{ts,tsx}', 'integration/tests/react*.tsx'],
  rules: {
    ...pluginReactHooks.configs.flat.recommended.rules,
    'react-hooks/exhaustive-deps': 'error',
  },
}
