import type { Linter } from 'eslint'
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import skipFormatting from 'eslint-config-prettier/flat'

type ConfigInput = Parameters<typeof defineConfigWithVueTs>[number]

export interface Options {
  /** Lints Vue files with eslint-plugin-vue's recommended rules. */
  vue?: boolean
  /** Checks the rules of hooks and the React Compiler's rules. */
  react?: boolean
  /** Paths ESLint skips, on top of {@link defaultIgnores}. */
  ignores?: string[]
  /**
   * The project's oxlint config. ESLint leaves the rules it turns on to oxlint, which runs first
   * and is faster.
   */
  oxlintConfig?: string
}

/** What no project lints: build output, coverage and Playwright's reports. */
export const defaultIgnores = [
  '**/dist/**',
  '**/coverage/**',
  'playwright-report/**',
  'test-results/**',
  'blob-report/**',
]

/**
 * The ESLint config of a whatsaaaa project. The project's own config objects come after the
 * shared rules and before the oxlint and formatter ones, so oxlint and the formatter still win.
 */
export function whatsaaaa(options: Options = {}, ...configs: Linter.Config[]): Linter.Config[] {
  const { vue = false, react = false, ignores = [], oxlintConfig = '.oxlintrc.json' } = options
  return defineConfigWithVueTs(
    {
      name: 'whatsaaaa/files-to-lint',
      files: ['**/*.{ts,mts,cts,tsx,vue}'],
    },

    globalIgnores([...defaultIgnores, ...ignores]),

    ...(vue ? pluginVue.configs['flat/recommended'] : []),
    vueTsConfigs.recommended,

    ...(react
      ? [
          {
            ...pluginReactHooks.configs.flat.recommended,
            name: 'whatsaaaa/react',
            files: ['**/*.{ts,mts,cts,tsx}'],
            rules: {
              ...pluginReactHooks.configs.flat.recommended.rules,
              'react-hooks/exhaustive-deps': 'error' as const,
            },
          },
        ]
      : []),

    ...(configs as ConfigInput[]),

    ...pluginOxlint.buildFromOxlintConfigFile(oxlintConfig),
    skipFormatting,
  ) as Linter.Config[]
}

export default whatsaaaa
