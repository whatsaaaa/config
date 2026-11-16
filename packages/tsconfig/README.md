<img src="https://raw.githubusercontent.com/whatsaaaa/config/main/.github/assets/readme-header.svg" alt="whatsaaaa" width="100%" />

# @whatsaaaa/tsconfig

The TypeScript configs of whatsaaaa projects.

```sh
pnpm add -D @whatsaaaa/tsconfig typescript
```

| Config         | For                                                                       | Sets                                                                                                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base.json`    | what the other two share                                                  | `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `isolatedModules`, `resolveJsonModule`, `esModuleInterop`, `skipLibCheck`, `noEmit`                                                                                                            |
| `node.json`    | code Node runs as it is, with its type stripping: scripts, tests, configs | base, on [`@tsconfig/node22`](https://www.npmjs.com/package/@tsconfig/node22) (`module: nodenext`), with Node's types, `rewriteRelativeImportExtensions`, `target` ES2024 and in `lib` what Node 22 has: ES2024, the Set methods and iterator helpers of ES2025, `Array.fromAsync` |
| `bundler.json` | code a bundler builds: apps, sites, a Vue or React library                | base, with `target` and `lib` ES2022 and the DOM in `lib`, `module: preserve`, `moduleResolution: bundler` and `allowImportingTsExtensions`                                                                                                                                        |

```jsonc
// tsconfig.json
{
  "extends": "@whatsaaaa/tsconfig/node.json",
  "include": ["src", "scripts", "tests", "*.config.ts"],
}
```

- `base.json` sets no `target` or `lib`. A project that extends it alone has TypeScript's defaults, or those of the config it extends with it.
- `node.json` needs `@types/node` in the project, at the major of the oldest Node the project supports: `@types/node@22` for Node 22, so it rejects the Node APIs of later majors. It does not catch those that came in a later minor release of that major: on Node 22.18, it still takes Node 22.19's `process.threadCpuUsage`.
- `node.json` holds code to Node 22, the oldest Node whatsaaaa projects support: it rejects what Node 22 does not have, such as `Promise.try`. It sets its own `lib` because `@tsconfig/node22`'s, under TypeScript 6, takes in some of what Node 22 lacks. That `lib` names parts of ES2025, so the package needs TypeScript 6 or later.
- `bundler.json` brings no types of its own. A project adds the ones its code runs with, such as `"types": ["vite/client"]`.
- `erasableSyntaxOnly` rejects enums, namespaces and parameter properties, which Node's type stripping cannot run.
- A config that compiles to `dist/` sets `noEmit: false`, with its `rootDir` and `outDir`.

## License

MIT
