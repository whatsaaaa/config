<img src="https://raw.githubusercontent.com/whatsaaaa/config/main/.github/assets/readme-header.svg" alt="whatsaaaa" width="100%" />

# @whatsaaaa/eslint-config

The ESLint flat config of whatsaaaa projects: [typescript-eslint](https://typescript-eslint.io)'s recommended rules through [`@vue/eslint-config-typescript`](https://github.com/vuejs/eslint-config-typescript), [eslint-plugin-vue](https://eslint.vuejs.org)'s recommended rules for Vue, the rules of hooks for React, every rule oxlint runs left to oxlint, and every formatting rule left to the formatter.

```sh
pnpm add -D @whatsaaaa/eslint-config eslint typescript jiti
```

The plugins come with the package. `jiti` lets ESLint load a TypeScript config.

```ts
// eslint.config.ts
import whatsaaaa from '@whatsaaaa/eslint-config'

export default whatsaaaa(
  { vue: true, ignores: ['**/.nuxt/**'] },

  // the project's own config objects, after the shared ones
  {
    name: 'app/nuxt',
    files: ['app/pages/**/*.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
)
```

| Option         | Default            | What it does                                                                                                                                                                            |
| -------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vue`          | `false`            | Lints `.vue` files with eslint-plugin-vue's `flat/recommended`                                                                                                                          |
| `react`        | `false`            | Checks the rules of hooks and the React Compiler's rules, with `react-hooks/exhaustive-deps` as an error                                                                                |
| `ignores`      | `[]`               | Paths to skip, on top of the default ones: `dist`, `coverage` and Playwright's reports                                                                                                  |
| `oxlintConfig` | `'.oxlintrc.json'` | The oxlint config, from the working directory: a JSON one, or a JS or TS one such as `oxlint.config.ts`. ESLint turns off every rule it turns on, since oxlint runs first and is faster |

`whatsaaaa()` returns a Promise, which the config file exports as it is: ESLint awaits it, as it has since ESLint 8.44, and the package needs ESLint 10.

It lints `.ts`, `.mts`, `.cts`, `.tsx` and `.vue` files, and ESLint's own `.js`, `.mjs` and `.cjs`. The project's config objects come after the shared ones and before the oxlint and formatter ones, so they can change a shared rule and cannot turn on one oxlint or the formatter owns.

## License

MIT
