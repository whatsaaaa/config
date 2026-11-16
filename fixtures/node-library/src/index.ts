import { readFile } from 'node:fs/promises'
import { greeting } from './greeting.ts'
import settings from './settings.json' with { type: 'json' }

export { greeting }

export async function readName(path: string): Promise<string> {
  const names = (await readFile(path, 'utf8')).split('\n')
  return names[0] ?? settings.fallbackName
}
