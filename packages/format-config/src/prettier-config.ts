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
