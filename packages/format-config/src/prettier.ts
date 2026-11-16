// For what oxfmt does not format, such as Astro files. A project names this module as its Prettier
// config, and the Astro plugin comes in when the project has prettier-plugin-astro installed.
import { fileURLToPath } from 'node:url'
import { options } from './options.ts'

export interface PrettierConfig {
  semi: boolean
  singleQuote: boolean
  printWidth: number
  plugins?: string[]
  overrides?: { files: string; options: { parser: string } }[]
}

/** The Prettier config, with the Astro plugin at the given path, or without it. */
export function prettierConfig(astroPlugin?: string): PrettierConfig {
  if (!astroPlugin) return { ...options }
  return {
    ...options,
    plugins: [astroPlugin],
    overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
  }
}

// The plugin is an optional peer dependency, so it resolves from here when the project has it.
function resolveAstroPlugin(): string | undefined {
  try {
    return fileURLToPath(import.meta.resolve('prettier-plugin-astro'))
  } catch {
    return undefined
  }
}

export default prettierConfig(resolveAstroPlugin())
