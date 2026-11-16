// reference/ holds the configs this package replaces, as they are in their repositories:
// whatsaaaa/design-system at 9cf6b3c and whatsaaaa/ui-vue at 4d729c8.
import { describe, expect, test } from 'vitest'
import { differences, resolveOptions } from './compare.ts'

// Each config is compared with the configs it replaces, option by option, after `extends` is
// followed. Every difference is listed here with its reason, so none goes unnoticed.

describe('node.json', () => {
  test('sets what design-system tsconfig.json sets', () => {
    expect(
      differences(
        resolveOptions('./reference/design-system/tsconfig.json'),
        resolveOptions('../node.json'),
      ),
    ).toEqual({
      // design-system's modules also run in browsers as they are, so it holds them to ES2022 and
      // adds the DOM to its own config. Code Node runs has what Node 22, the oldest Node the
      // projects support, has: ES2024, the Set methods and iterator helpers of ES2025, and
      // Array.fromAsync.
      target: { reference: 'es2022', ours: 'es2024' },
      lib: {
        reference: ['es2022', 'dom', 'dom.iterable'],
        ours: ['es2024', 'es2025.collection', 'es2025.iterator', 'esnext.array'],
      },
      // new for every project: JSON modules can be imported
      resolveJsonModule: { ours: true },
    })
  })
})

describe('bundler.json', () => {
  test('sets what ui-vue tsconfig.json sets', () => {
    expect(
      differences(
        resolveOptions('./reference/ui-vue/tsconfig.json'),
        resolveOptions('../bundler.json'),
      ),
    ).toEqual({
      // ui-vue type-checks its configs and tests with this config too, and they run in Node,
      // so it adds Node's types to its own config. Code a bundler builds runs in a browser.
      types: { reference: ['node'] },
      resolveJsonModule: { ours: true },
    })
  })

  test('sets what design-system tsconfig.vue.json sets', () => {
    expect(
      differences(
        resolveOptions('./reference/design-system/tsconfig.vue.json'),
        resolveOptions('../bundler.json'),
      ),
    ).toEqual({
      // design-system has it in its node config only, and its code has no syntax it rejects
      erasableSyntaxOnly: { ours: true },
      types: { reference: ['node'] },
      resolveJsonModule: { ours: true },
    })
  })
})

describe('base.json', () => {
  test('is what node.json and bundler.json share', () => {
    const base = resolveOptions('../base.json')
    for (const flavour of ['../node.json', '../bundler.json']) {
      const options = resolveOptions(flavour)
      for (const [key, value] of Object.entries(base)) {
        expect({ [key]: options[key] }).toEqual({ [key]: value })
      }
    }
  })

  test('holds the house rules', () => {
    expect(resolveOptions('../base.json')).toMatchObject({
      strict: true,
      noUncheckedIndexedAccess: true,
      verbatimModuleSyntax: true,
      erasableSyntaxOnly: true,
      isolatedModules: true,
      resolveJsonModule: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
    })
  })
})
