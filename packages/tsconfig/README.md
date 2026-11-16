<img src="https://raw.githubusercontent.com/whatsaaaa/config/main/.github/assets/readme-header.svg" alt="whatsaaaa" width="100%" />

# @whatsaaaa/tsconfig

The TypeScript configs of whatsaaaa projects.

```sh
pnpm add -D @whatsaaaa/tsconfig typescript
```

| Config         | For                                                                       | Sets                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base.json`    | what the other two share                                                  | `target` and `lib` ES2022, `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `isolatedModules`, `resolveJsonModule`, `esModuleInterop`, `skipLibCheck`, `noEmit` |
| `node.json`    | code Node runs as it is, with its type stripping: scripts, tests, configs | base, on [`@tsconfig/node24`](https://www.npmjs.com/package/@tsconfig/node24) (`module: nodenext`), with Node's types and `rewriteRelativeImportExtensions`                                        |
| `bundler.json` | code a bundler builds: apps, sites, a Vue or React library                | base, with `module: preserve`, `moduleResolution: bundler`, `allowImportingTsExtensions` and the DOM in `lib`                                                                                      |

```jsonc
// tsconfig.json
{
  "extends": "@whatsaaaa/tsconfig/node.json",
  "include": ["src", "scripts", "tests", "*.config.ts"],
}
```

- `node.json` needs `@types/node` in the project.
- `bundler.json` brings no types of its own. A project adds the ones its code runs with, such as `"types": ["vite/client"]`.
- `erasableSyntaxOnly` rejects enums, namespaces and parameter properties, which Node's type stripping cannot run.
- A config that compiles to `dist/` sets `noEmit: false`, with its `rootDir` and `outDir`.

## License

MIT
