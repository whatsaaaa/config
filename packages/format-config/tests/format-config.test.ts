// reference/ holds the configs this package replaces, as they are in their repositories:
// whatsaaaa/design-system at 9cf6b3c, whatsaaaa/ui-vue at 4d729c8, whatsaaaa/form-builder-sample
// at 94a3f3a (both apps have the same .prettierrc.json) and whatsaaaa/whatsaaaa.github.io at 3d9d22e.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import oxfmtOptions from '../src/oxfmt.ts'
import prettierDefault, { prettierConfig } from '../src/prettier.ts'

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url))
const readJson = (file: string): Record<string, unknown> =>
  JSON.parse(readFileSync(path(file), 'utf8'))

/** The formatting options of an .oxfmtrc.json: what is left without its schema and its ignores. */
function formattingOptions(file: string) {
  const options = readJson(file)
  delete options.$schema
  delete options.ignorePatterns
  return options
}

// oxfmt's default width, written out so Prettier, whose default is 80, wraps at the same width.
// It changes nothing for a project on oxfmt.
const width = { printWidth: 100 }

describe('./oxfmt', () => {
  test.each(['design-system', 'ui-vue'])('holds the options of %s .oxfmtrc.json', (name) => {
    expect(oxfmtOptions).toEqual({
      ...formattingOptions(`./reference/${name}/.oxfmtrc.json`),
      ...width,
    })
  })
})

describe('./prettier', () => {
  test('holds the options of form-builder-sample .prettierrc.json', () => {
    expect(prettierConfig()).toEqual({
      ...readJson('./reference/form-builder-sample/.prettierrc.json'),
      ...width,
    })
  })

  test('takes the Astro plugin and its override as whatsaaaa.github.io has them', () => {
    const site = readJson('./reference/whatsaaaa.github.io/.prettierrc.json')
    expect(prettierConfig('/path/to/prettier-plugin-astro')).toEqual({
      ...site,
      plugins: ['/path/to/prettier-plugin-astro'],
      // the site formats with semicolons, every other project without
      semi: false,
      ...width,
    })
  })

  test('finds the Astro plugin when it is installed', () => {
    expect(prettierDefault.plugins).toEqual([
      fileURLToPath(import.meta.resolve('prettier-plugin-astro')),
    ])
  })
})

describe('oxfmt and Prettier', () => {
  const bin = (name: string) => path(`../node_modules/.bin/${name}`)
  const oxfmt = (source: string, file: string, config: string) =>
    execFileSync(bin('oxfmt'), ['-c', config, `--stdin-filepath=${file}`], {
      input: source,
      encoding: 'utf8',
    })
  const prettier = (source: string, file: string) =>
    execFileSync(
      bin('prettier'),
      ['--config', path('./prettier.config.ts'), '--stdin-filepath', file],
      {
        input: source,
        encoding: 'utf8',
      },
    )

  // badly formatted on purpose: double quotes, semicolons, long and short lines
  const source = readFileSync(path('./unformatted.txt'), 'utf8')

  test('oxfmt formats with the shared options as with design-system .oxfmtrc.json', () => {
    const reference = oxfmt(source, 'a.ts', path('./reference/design-system/.oxfmtrc.json'))
    expect(oxfmt(source, 'a.ts', path('./oxfmt.config.ts'))).toBe(reference)
    expect(reference).not.toBe(source)
  })

  test('format a file the same way with the shared options', () => {
    expect(prettier(source, 'a.ts')).toBe(oxfmt(source, 'a.ts', path('./oxfmt.config.ts')))
  })
})
