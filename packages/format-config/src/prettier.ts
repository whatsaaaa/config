// For what oxfmt does not format, such as Astro files. A project names this module as its Prettier
// config, and the Astro plugin comes in when the project has prettier-plugin-astro installed.
import { fileURLToPath } from 'node:url'
import { prettierConfig } from './prettier-config.ts'

// The plugin is an optional peer dependency, so it resolves from here when the project has it.
function resolveAstroPlugin(): string | undefined {
  try {
    return fileURLToPath(import.meta.resolve('prettier-plugin-astro'))
  } catch {
    return undefined
  }
}

export default prettierConfig(resolveAstroPlugin())
