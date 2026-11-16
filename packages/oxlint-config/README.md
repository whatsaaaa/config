<img src="https://raw.githubusercontent.com/whatsaaaa/config/main/.github/assets/readme-header.svg" alt="whatsaaaa" width="100%" />

# @whatsaaaa/oxlint-config

The [oxlint](https://oxc.rs/docs/guide/usage/linter) configs of whatsaaaa projects.

```sh
pnpm add -D @whatsaaaa/oxlint-config oxlint
```

| Config       | Sets                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `base.json`  | the `eslint`, `typescript`, `unicorn` and `oxc` plugins, every `correctness` rule as an error, the browser and Node globals |
| `vue.json`   | base, with the `vue` plugin                                                                                                 |
| `react.json` | base, with the `react` plugin, `react/rules-of-hooks` as an error and `react/incompatible-library` as a warning             |

oxlint's `extends` takes paths, not package names, so a project's `.oxlintrc.json` points into `node_modules`:

```jsonc
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@whatsaaaa/oxlint-config/vue.json"],
  "ignorePatterns": ["dist"],
}
```

The configs are for a `.oxlintrc.json`. An `oxlint.config.ts` cannot extend them: its `extends` takes config objects, not paths, and these files are JSON with comments, which a JS import does not load.

[`@whatsaaaa/eslint-config`](https://www.npmjs.com/package/@whatsaaaa/eslint-config) reads that file and leaves to oxlint every rule it turns on.

oxlint does not pass a top-level `env` on through `extends`, so `base.json` sets the globals in an override for every file, which it does pass on.

## License

MIT
