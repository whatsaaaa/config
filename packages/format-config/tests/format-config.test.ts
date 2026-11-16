// reference/ holds the configs this package replaces, as they are in their repositories:
// whatsaaaa/design-system at 9cf6b3c and whatsaaaa/ui-vue at 4d729c8.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import oxfmtOptions from '../src/oxfmt.ts'

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url))

const oxfmt = (source: string, file: string, config: string) =>
  execFileSync(path('../node_modules/.bin/oxfmt'), ['-c', config, `--stdin-filepath=${file}`], {
    input: source,
    encoding: 'utf8',
  })

/** The formatting options of an .oxfmtrc.json: what is left without its schema and its ignores. */
function formattingOptions(file: string) {
  const options: Record<string, unknown> = JSON.parse(readFileSync(path(file), 'utf8'))
  delete options.$schema
  delete options.ignorePatterns
  return options
}

describe('./oxfmt', () => {
  test.each(['design-system', 'ui-vue'])('holds the options of %s .oxfmtrc.json', (name) => {
    expect(oxfmtOptions).toEqual(formattingOptions(`./reference/${name}/.oxfmtrc.json`))
  })

  test('formats as design-system .oxfmtrc.json does', () => {
    // badly formatted on purpose: double quotes, semicolons, long and short lines
    const source = readFileSync(path('./unformatted.txt'), 'utf8')
    const reference = oxfmt(source, 'a.ts', path('./reference/design-system/.oxfmtrc.json'))
    expect(oxfmt(source, 'a.ts', path('./oxfmt.config.ts'))).toBe(reference)
    expect(reference).not.toBe(source)
  })
})
