import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

// Each fixture is a project that extends the packages the way a whatsaaaa project does, through
// their published entry points (the workspace links them, with dist/ built on install).

const fixture = (name: string) => fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url))

function run(name: string, bin: string, args: string[], input?: string) {
  const result = spawnSync(join(fixture(name), 'node_modules/.bin', bin), args, {
    cwd: fixture(name),
    encoding: 'utf8',
    input,
  })
  return { code: result.status, output: `${result.stdout}${result.stderr}` }
}

const passes = { code: 0 }

/** Lints a file written outside the fixture, with the fixture's oxlint config. */
function oxlintFile(name: string, file: string, source: string) {
  const dir = mkdtempSync(join(tmpdir(), 'fixture-'))
  writeFileSync(join(dir, file), source)
  return run(name, 'oxlint', ['-c', join(fixture(name), '.oxlintrc.json'), join(dir, file)])
}

const fixtures = [
  { name: 'node-library', typeCheck: 'tsc' },
  { name: 'vue-app', typeCheck: 'vue-tsc' },
  { name: 'react-app', typeCheck: 'tsc' },
  { name: 'astro-site', typeCheck: 'tsc' },
]

describe.each(fixtures)('$name', ({ name, typeCheck }) => {
  test(`passes ${typeCheck}`, () => {
    expect(run(name, typeCheck, ['--noEmit'])).toMatchObject(passes)
  })

  test('passes oxlint', () => {
    expect(run(name, 'oxlint', ['--deny-warnings'])).toMatchObject(passes)
  })

  test('passes ESLint', () => {
    expect(run(name, 'eslint', ['--max-warnings', '0', '.'])).toMatchObject(passes)
  })

  test("passes oxfmt's check", () => {
    expect(run(name, 'oxfmt', ['--check', '.'])).toMatchObject(passes)
  })

  test('oxlint reports a debugger statement', () => {
    const result = oxlintFile(name, 'bad.ts', 'debugger\n')
    expect(result.output).toContain('no-debugger')
  })

  test('ESLint reports an explicit any', () => {
    const result = run(
      name,
      'eslint',
      ['--stdin', '--stdin-filename', 'src/bad.ts'],
      'export const value: any = 1\n',
    )
    expect(result.output).toContain('@typescript-eslint/no-explicit-any')
  })

  test('oxfmt formats without semicolons, with single quotes', () => {
    const result = run(
      name,
      'oxfmt',
      ['--stdin-filepath=src/bad.ts'],
      'const a = "x";\nexport { a };\n',
    )
    expect(result.output).toBe("const a = 'x'\nexport { a }\n")
  })
})

describe('vue-app', () => {
  test("ESLint checks eslint-plugin-vue's recommended rules", () => {
    const result = run(
      'vue-app',
      'eslint',
      ['--stdin', '--stdin-filename', 'src/BadInput.vue'],
      '<script setup lang="ts">\nconst text = defineModel<string>()\n</script>\n\n<template>\n  <input v-model="text" id="text" />\n</template>\n',
    )
    expect(result.output).toContain('vue/attributes-order')
  })

  test("oxlint checks Vue's rules", () => {
    const result = oxlintFile(
      'vue-app',
      'BadExport.vue',
      '<script setup lang="ts">\nexport const value = 1\n</script>\n',
    )
    expect(result.output).toContain('no-export-in-script-setup')
  })
})

describe('react-app', () => {
  test('oxlint checks the rules of hooks', () => {
    const result = oxlintFile(
      'react-app',
      'BadHook.tsx',
      "import { useState } from 'react'\n\nexport function Counter({ on }: { on: boolean }) {\n  if (on) {\n    const [count] = useState(0)\n    return <p>{count}</p>\n  }\n  return null\n}\n",
    )
    expect(result.output).toContain('rules-of-hooks')
  })
})

describe('astro-site', () => {
  test("passes Prettier's check, Astro files included", () => {
    expect(run('astro-site', 'prettier', ['--check', '.'])).toMatchObject(passes)
  })

  test('Prettier formats Astro files with the shared options', () => {
    const result = run(
      'astro-site',
      'prettier',
      ['--stdin-filepath', 'src/pages/bad.astro'],
      '---\nconst title = "whatsaaaa";\n---\n<h1>{title}</h1>\n',
    )
    expect(result).toEqual({
      code: 0,
      output: "---\nconst title = 'whatsaaaa'\n---\n\n<h1>{title}</h1>\n",
    })
  })
})
