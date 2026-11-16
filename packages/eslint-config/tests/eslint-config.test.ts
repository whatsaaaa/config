// reference/ holds the configs this package replaces, as they are in their repositories:
// whatsaaaa/design-system at 9cf6b3c and whatsaaaa/ui-vue at 4d729c8 (each eslint.config.ts with
// the .oxlintrc.json it reads), and the React block of whatsaaaa/form-builder at 1ad145c.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint, type Linter } from 'eslint'
import { afterAll, describe, expect, test } from 'vitest'
import whatsaaaa from '../src/index.ts'
import reactBlock from './reference/form-builder/react.ts'

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url))
const oxlintConfig = (name: string) => path(`../node_modules/@whatsaaaa/oxlint-config/${name}.json`)

const startDir = process.cwd()
afterAll(() => process.chdir(startDir))

/** The config ESLint applies to a file, from a reference repository's own eslint.config.ts. */
async function referenceConfig(name: string, file: string) {
  const cwd = path(`./reference/${name}`)
  // its oxlint dedupe reads .oxlintrc.json from the working directory, as in that repository
  process.chdir(cwd)
  try {
    return await new ESLint({ cwd }).calculateConfigForFile(file)
  } finally {
    process.chdir(startDir)
  }
}

/** The config ESLint applies to a file under the shared config. */
function oursConfig(config: Linter.Config[], file: string) {
  const cwd = path('./reference')
  return new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: config,
  }).calculateConfigForFile(file)
}

type Rules = Record<string, unknown>

function withoutPlugin(rules: Rules, plugin: string) {
  return Object.fromEntries(
    Object.entries(rules).filter(([rule]) => !rule.startsWith(`${plugin}/`)),
  )
}

// Files the projects' own blocks (their one-word component names) do not reach
const files = ['src/components/GreetingCard.vue', 'src/module.ts', 'scripts/build.mts']

describe.each(['design-system', 'ui-vue'])('whatsaaaa({ vue: true }) replacing %s', (name) => {
  const vue = whatsaaaa({ vue: true, oxlintConfig: oxlintConfig('vue') })

  test.each(files)('turns on the same rules for %s', async (file) => {
    const reference = await referenceConfig(name, file)
    const ours = await oursConfig(await vue, file)
    expect(ours.rules).toEqual(reference.rules)
    expect(Object.keys(ours.plugins).sort()).toEqual(Object.keys(reference.plugins).sort())
    expect(ours.languageOptions.parser.meta).toEqual(reference.languageOptions.parser.meta)
  })
})

describe('whatsaaaa() without a framework', () => {
  test.each(['design-system', 'ui-vue'])('turns on the rules of %s without Vue', async (name) => {
    const file = 'src/module.ts'
    const reference = await referenceConfig(name, file)
    const ours = await oursConfig(await whatsaaaa({ oxlintConfig: oxlintConfig('base') }), file)
    expect(withoutPlugin(ours.rules, 'vue')).toEqual(withoutPlugin(reference.rules, 'vue'))
    // eslint-config-prettier lists Vue's formatting rules, turned off
    const vueRulesOn = Object.entries(ours.rules as Record<string, [number]>).filter(
      ([rule, [level]]) => rule.startsWith('vue/') && level > 0,
    )
    expect(vueRulesOn).toEqual([])
  })
})

describe('whatsaaaa({ react: true }) replacing form-builder', () => {
  const react = whatsaaaa({ react: true, oxlintConfig: oxlintConfig('react') })

  // oxlint's React plugin runs most rules of hooks itself, so ESLint leaves them to it
  const oxlintRules: Rules = JSON.parse(
    execFileSync(
      path('../node_modules/.bin/oxlint'),
      ['-c', oxlintConfig('react'), '--print-config'],
      { encoding: 'utf8' },
    ),
  ).rules
  const severity = { deny: 2, warn: 1, allow: 0 } as Record<string, number>

  test.each(['src/App.tsx', 'src/use-greeting.ts'])(
    'checks every rule of hooks at the same severity in %s',
    async (file) => {
      const reference = new ESLint({
        cwd: path('./reference'),
        overrideConfigFile: true,
        overrideConfig: [reactBlock as Linter.Config],
      })
      const referenceRules = (await reference.calculateConfigForFile(
        `frameworks/react/${file}`,
      )) as { rules: Record<string, [number, ...unknown[]]> }
      const ours = (await oursConfig(await react, file)) as { rules: Record<string, [number]> }

      const hooks = Object.entries(referenceRules.rules).filter(([rule]) =>
        rule.startsWith('react-hooks/'),
      )
      expect(hooks.length).toBeGreaterThan(0)
      for (const [rule, [level]] of hooks) {
        const inEslint = ours.rules[rule]?.[0]
        const inOxlint = severity[oxlintRules[rule.replace('react-hooks/', 'react/')] as string]
        // either ESLint runs it as before, or ESLint leaves it to oxlint, which runs it as before
        expect({ rule, level: inEslint || inOxlint }).toEqual({ rule, level })
      }
    },
  )

  test('changes no other rule', async () => {
    const plain = await oursConfig(
      await whatsaaaa({ oxlintConfig: oxlintConfig('base') }),
      'src/module.ts',
    )
    const ours = await oursConfig(await react, 'src/module.ts')
    const others = (rules: Rules) =>
      Object.fromEntries(
        Object.entries(rules).filter(
          ([rule]) => !rule.startsWith('react-hooks/') && !rule.startsWith('react/'),
        ),
      )
    expect(others(ours.rules)).toEqual(others(plain.rules))
  })
})

describe('options', () => {
  test('ignores build output, coverage and test reports, and what the project adds', async () => {
    const eslint = new ESLint({
      cwd: path('./reference'),
      overrideConfigFile: true,
      overrideConfig: await whatsaaaa({
        ignores: ['generated/**'],
        oxlintConfig: oxlintConfig('base'),
      }),
    })
    for (const file of [
      'dist/index.ts',
      'packages/a/dist/index.ts',
      'coverage/index.ts',
      'playwright-report/index.ts',
      'test-results/index.ts',
      'generated/index.ts',
    ]) {
      expect({ file, ignored: await eslint.isPathIgnored(file) }).toEqual({ file, ignored: true })
    }
    expect(await eslint.isPathIgnored('src/index.ts')).toBe(false)
  })

  test("puts the project's configs before the oxlint and formatter ones", async () => {
    const config = await whatsaaaa({ oxlintConfig: oxlintConfig('base') }, { name: 'project/own' })
    const names = config.map((block) => block.name)
    const own = names.indexOf('project/own')
    expect(own).toBeGreaterThan(names.indexOf('whatsaaaa/files-to-lint'))
    expect(own).toBeLessThan(names.findIndex((name) => name?.startsWith('oxlint/')))
    expect(names.at(-1)).toBe('config-prettier')
  })

  test('leaves to oxlint what an oxlint config in TypeScript turns on', async () => {
    const file = join(mkdtempSync(join(tmpdir(), 'oxlint-config-')), 'oxlint.config.ts')
    writeFileSync(
      file,
      "export default { plugins: ['typescript'], rules: { 'typescript/no-explicit-any': 'error' } }\n",
    )
    const rule = '@typescript-eslint/no-explicit-any'
    const plain = await oursConfig(
      await whatsaaaa({ oxlintConfig: oxlintConfig('base') }),
      'src/module.ts',
    )
    const ours = await oursConfig(await whatsaaaa({ oxlintConfig: file }), 'src/module.ts')
    expect({ plain: plain.rules[rule], ours: ours.rules[rule] }).toEqual({ plain: [2], ours: [0] })
  })
})
