import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Options = Record<string, unknown>

const tsc = fileURLToPath(new URL('../node_modules/.bin/tsc', import.meta.url))

/** The compiler options a tsconfig file resolves to, with its `extends` followed, as tsc --showConfig prints them. */
export function resolveOptions(path: string): Options {
  // --showConfig needs a file to compile, so a probe config extends the one asked for
  const dir = mkdtempSync(join(tmpdir(), 'tsconfig-'))
  writeFileSync(join(dir, 'probe.ts'), 'export {}\n')
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      extends: fileURLToPath(new URL(path, import.meta.url)),
      files: ['probe.ts'],
      include: [],
    }),
  )
  const output = execFileSync(tsc, ['--showConfig', '-p', dir], { encoding: 'utf8' })
  return (JSON.parse(output) as { compilerOptions: Options }).compilerOptions
}

/** Every option the two configs set differently, with the value of each side. */
export function differences(reference: Options, ours: Options) {
  const keys = new Set([...Object.keys(reference), ...Object.keys(ours)])
  const result: Record<string, { reference: unknown; ours: unknown }> = {}
  for (const key of [...keys].sort()) {
    if (JSON.stringify(reference[key]) !== JSON.stringify(ours[key])) {
      result[key] = { reference: reference[key], ours: ours[key] }
    }
  }
  return result
}
