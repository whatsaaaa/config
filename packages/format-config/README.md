<img src="https://raw.githubusercontent.com/whatsaaaa/config/main/.github/assets/readme-header.svg" alt="whatsaaaa" width="100%" />

# @whatsaaaa/format-config

The formatter options of whatsaaaa projects, for [oxfmt](https://oxc.rs/docs/guide/usage/formatter) and for [Prettier](https://prettier.io): no semicolons, single quotes, lines of 100. One source for both, so they format a file the same way.

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

Prettier is for what oxfmt does not format, such as Astro files. A project names the config in its `.prettierrc.json`:

```json
"@whatsaaaa/format-config/prettier"
```

When the project has [`prettier-plugin-astro`](https://github.com/withastro/prettier-plugin-astro) installed, the config takes the plugin and formats `.astro` files with it.

The width of 100 is oxfmt's default, written out because Prettier's is 80.

## License

MIT
