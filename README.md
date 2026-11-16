<img src="./.github/assets/readme-header.svg" alt="whatsaaaa" width="100%" />

# config

Shared TypeScript, lint and format configuration packages for whatsaaaa projects. A project extends them instead of keeping its own copy, so the house rules stay the same everywhere and a change reaches every project as a version bump.

| Package                                                | What it is                                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [`@whatsaaaa/tsconfig`](./packages/tsconfig)           | TypeScript configs: `base.json`, `node.json` for code Node runs, `bundler.json` for code a bundler builds |
| [`@whatsaaaa/oxlint-config`](./packages/oxlint-config) | oxlint configs: `base.json`, `vue.json`, `react.json`                                                     |
| [`@whatsaaaa/eslint-config`](./packages/eslint-config) | The ESLint flat config: TypeScript, Vue and React, leaving to oxlint what it covers                       |
| [`@whatsaaaa/format-config`](./packages/format-config) | The formatter options, for oxfmt                                                                          |

They hold what design-system and ui-vue configured by hand before, rule for rule. The tests compare each package with those configs and list every difference with its reason.

## Use it

```sh
pnpm add -D @whatsaaaa/tsconfig @whatsaaaa/oxlint-config @whatsaaaa/eslint-config @whatsaaaa/format-config
```

```jsonc
// tsconfig.json
{ "extends": "@whatsaaaa/tsconfig/bundler.json", "include": ["src", "*.config.ts"] }
```

```jsonc
// .oxlintrc.json: oxlint's `extends` takes paths, not package names
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@whatsaaaa/oxlint-config/vue.json"],
  "ignorePatterns": ["dist"],
}
```

```ts
// eslint.config.ts
import whatsaaaa from '@whatsaaaa/eslint-config'

export default whatsaaaa({ vue: true, ignores: ['generated/**'] })
```

```ts
// oxfmt.config.ts
import { defineConfig } from 'oxfmt'
import whatsaaaa from '@whatsaaaa/format-config/oxfmt'

export default defineConfig({ ...whatsaaaa, ignorePatterns: ['pnpm-lock.yaml'] })
```

Each package's README has the details. The projects in [`fixtures/`](./fixtures) use the packages this way.

## Working on it

You need Node.js (22.18 or later on 22, or 24.12 or later) and [pnpm](https://pnpm.io/installation), which switches itself to the version `packageManager` names in `package.json`. `pnpm install` builds the packages' `dist/`, which this repository's own configs and the fixtures use, the way a project uses the published packages.

| Command           | What it does                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm build`      | Builds `@whatsaaaa/eslint-config` and `@whatsaaaa/format-config` into their `dist/`            |
| `pnpm test`       | Runs the tests: each config against the configs it replaces, and every tool on every fixture   |
| `pnpm lint`       | Checks the code with oxlint and ESLint, and each package as it is packed with publint and attw |
| `pnpm type-check` | Type-checks the packages, the tests and the configs                                            |
| `pnpm format`     | Formats everything                                                                             |
| `pnpm changeset`  | Records a change to a package for the next release                                             |

`test`, `lint` and `type-check` build first, so each one works on a fresh checkout and after a change to a package's source.

A change to a config changes what every project that extends it checks. When a test that compares a package with the configs it replaces fails, either the change is a mistake, or it is meant: then list it in the test with its reason, and make the changeset say what projects will see.

## Checks

CI runs on every pull request: formatting, lint (with publint and attw on each packed package), types, and the tests. The tests check that:

- each tsconfig resolves to the options of the design-system and ui-vue configs it replaces, apart from the differences the test lists,
- each oxlint config turns on the same rules, plugins and environments as design-system's and ui-vue's, and a project that extends it still knows the browser and Node globals,
- the ESLint config turns on the same rules as design-system's and ui-vue's for TypeScript and Vue files, and every rule of hooks of form-builder's React block at the same severity, in ESLint or in oxlint,
- the formatter options are those of design-system and ui-vue, and oxfmt formats a file with them as with design-system's config,
- each fixture passes `tsc` (`vue-tsc` for Vue), oxlint, ESLint and oxfmt's check (Astro files included, for the Astro one), and each tool reports what its config should catch.

## Releasing

1. A pull request that changes what a package ships adds a changeset with `pnpm changeset`.
2. When it merges, the release workflow, `.github/workflows/release.yml`, opens a Version Packages pull request that bumps the versions and writes the changelogs. It then starts CI on that pull request's branch, since GitHub starts no CI run for a pull request the workflow's own token opens, and the `main` ruleset requires CI to pass.
3. Merging that one starts the publish job. It waits for a reviewer to approve the `npm` environment.
4. Once approved, it publishes to npm through trusted publishing, with provenance. No npm token is stored anywhere.

That needs:

- an `npm` environment in the repository, with a required reviewer and `main` as its only deployment branch,
- "Allow GitHub Actions to create and approve pull requests" turned on in the repository's Actions settings, so the workflow can open its pull request,
- a trusted publisher on each package's npm settings: GitHub Actions, repository `whatsaaaa/config`, workflow `release.yml`, environment `npm`,
- a public repository, since npm records provenance only for a public one.

### The first release

npm sets up a trusted publisher only for a package that exists, and a trusted publisher that has not published within 48 hours of being set up expires. So the four packages start with a placeholder published by hand, and the release workflow publishes 1.0.0, the version in each `package.json`, as it publishes every later version. In order:

1. Publish a `0.0.0` placeholder of each package, logged in to npm as the owner of the `@whatsaaaa` scope (`npm login`):

   ```sh
   for name in tsconfig oxlint-config eslint-config format-config; do
     dir="$(mktemp -d)"
     printf '{ "name": "@whatsaaaa/%s", "version": "0.0.0", "license": "MIT", "repository": { "type": "git", "url": "git+https://github.com/whatsaaaa/config.git" } }\n' "$name" > "$dir/package.json"
     npm publish "$dir" --access public
   done
   ```

2. In the repository's settings, create the `npm` environment (required reviewer `whatsaaaa`, deployment branches: `main` only) and turn on "Allow GitHub Actions to create and approve pull requests" (Actions, General).
3. On npmjs.com, in each package's Settings, add a trusted publisher: GitHub Actions, organization or user `whatsaaaa`, repository `config`, workflow filename `release.yml`, environment `npm`.
4. Within 48 hours, merge the pull request that adds the packages. With no changeset pending, the release workflow goes straight to publishing the versions npm does not have yet: 1.0.0 of each package. Approve the `npm` environment when the publish job waits for it. If the workflow ran before steps 1 to 3 were done, its publish job failed: re-run it from the Actions tab.
5. Mark the placeholders deprecated:

   ```sh
   for name in tsconfig oxlint-config eslint-config format-config; do
     npm deprecate "@whatsaaaa/$name@0.0.0" "Placeholder, use 1.0.0 or later"
   done
   ```

## Layout

```
packages/tsconfig/        @whatsaaaa/tsconfig
packages/oxlint-config/   @whatsaaaa/oxlint-config
packages/eslint-config/   @whatsaaaa/eslint-config
packages/format-config/   @whatsaaaa/format-config
packages/*/tests/         each package's tests, and in reference/ the configs it replaces, as they are in their repositories
fixtures/                 one project per flavour that extends the packages: a Node library, a Vue app, a React app, an Astro site
tests/                    the tests that run every tool on every fixture
```

## License

[MIT](./LICENSE)
