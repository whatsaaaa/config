// reference/ holds the configs this package replaces, as they are in their repositories:
// whatsaaaa/design-system at 9cf6b3c and whatsaaaa/ui-vue at 4d729c8.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const oxlint = fileURLToPath(new URL('../node_modules/.bin/oxlint', import.meta.url))
const path = (file: string) => fileURLToPath(new URL(file, import.meta.url))

interface PrintedConfig {
  plugins: string[]
  rules: Record<string, unknown>
  env: Record<string, boolean>
  overrides?: { files: string[]; env?: Record<string, boolean> }[]
}

/** The config oxlint runs with: `extends` followed and the categories expanded into rules. */
function printConfig(file: string): PrintedConfig {
  return JSON.parse(
    execFileSync(oxlint, ['-c', path(file), '--print-config'], { encoding: 'utf8' }),
  )
}

/** The environments every file gets, whether set at the top or in an override for every file. */
function environments(config: PrintedConfig) {
  const env = { ...config.env }
  delete env.builtin
  for (const override of config.overrides ?? []) {
    if (override.files.length === 1 && override.files[0] === '**/*')
      Object.assign(env, override.env)
  }
  return env
}

function withoutPlugin(rules: Record<string, unknown>, plugin: string) {
  return Object.fromEntries(
    Object.entries(rules).filter(([rule]) => !rule.startsWith(`${plugin}/`)),
  )
}

const references = ['design-system', 'ui-vue'].map((name) => ({
  name,
  config: printConfig(`./reference/${name}/.oxlintrc.json`),
}))

describe.each(references)('the configs that replace $name .oxlintrc.json', ({ config }) => {
  test('vue.json turns on the same rules, plugins and environments', () => {
    const vue = printConfig('../vue.json')
    expect(vue.rules).toEqual(config.rules)
    expect(vue.plugins.sort()).toEqual(config.plugins.sort())
    expect(environments(vue)).toEqual(environments(config))
  })

  test('base.json is the same without Vue', () => {
    const base = printConfig('../base.json')
    expect(base.rules).toEqual(withoutPlugin(config.rules, 'vue'))
    expect(base.plugins.sort()).toEqual(config.plugins.filter((p) => p !== 'vue').sort())
    expect(environments(base)).toEqual(environments(config))
  })
})

describe('react.json', () => {
  test('is base.json with the React rules', () => {
    const base = printConfig('../base.json')
    const react = printConfig('../react.json')
    expect(withoutPlugin(react.rules, 'react')).toEqual(base.rules)
    expect(react.rules['react/rules-of-hooks']).toBe('deny')
    expect(react.rules['react/incompatible-library']).toBe('warn')
    expect(react.plugins.sort()).toEqual([...base.plugins, 'react'].sort())
    expect(environments(react)).toEqual(environments(base))
  })
})

describe.each(['base', 'vue', 'react'])('%s.json, extended by a project', (name) => {
  // oxlint does not pass a top-level `env` on through `extends`: this holds that the browser
  // and Node globals still reach a project that extends the config, as they did before.
  test('knows the browser and Node globals', () => {
    const dir = mkdtempSync(join(tmpdir(), 'oxlint-config-'))
    writeFileSync(
      join(dir, '.oxlintrc.json'),
      JSON.stringify({ extends: [path(`../${name}.json`)], rules: { 'no-undef': 'error' } }),
    )
    writeFileSync(join(dir, 'globals.js'), 'export const url = [window.location, process.env]\n')
    writeFileSync(join(dir, 'unknown.js'), 'export const value = notAGlobal\n')
    const lint = (file: string) => {
      try {
        execFileSync(oxlint, ['-c', join(dir, '.oxlintrc.json'), join(dir, file)], {
          encoding: 'utf8',
        })
        return 'passes'
      } catch (error) {
        return (error as { stdout: string }).stdout.includes('no-undef') ? 'no-undef' : error
      }
    }
    expect(lint('globals.js')).toBe('passes')
    expect(lint('unknown.js')).toBe('no-undef')
  })
})
