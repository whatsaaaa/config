<img src="https://raw.githubusercontent.com/whatsaaaa/config/main/.github/assets/readme-header.svg" alt="whatsaaaa" width="100%" />

# @whatsaaaa/format-config

The formatter options of whatsaaaa projects, for [oxfmt](https://oxc.rs/docs/guide/usage/formatter): no semicolons and single quotes, with oxfmt's defaults otherwise, such as lines of 100.

```sh
pnpm add -D @whatsaaaa/format-config oxfmt
```

oxfmt has no `extends`, so a project spreads the options into its `oxfmt.config.ts`:

```ts
// oxfmt.config.ts
import { defineConfig } from 'oxfmt'
import whatsaaaa from '@whatsaaaa/format-config/oxfmt'

export default defineConfig({ ...whatsaaaa, ignorePatterns: ['pnpm-lock.yaml'] })
```

oxfmt formats Astro files too, from version 0.73. A project with Astro files adds `astro: true` and installs `@astrojs/compiler-rs`, which oxfmt needs for them:

```ts
export default defineConfig({ ...whatsaaaa, astro: true })
```

## License

MIT
