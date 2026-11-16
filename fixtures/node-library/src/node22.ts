// node.json holds code to Node 22, the oldest Node whatsaaaa projects support: it takes what Node 22
// has and rejects what it does not.
import * as crypto from 'node:crypto'

export async function uniqueNames(names: AsyncIterable<string>): Promise<string[]> {
  const unique = new Set(await Array.fromAsync(names)).union(new Set(['whatsaaaa']))
  return unique
    .values()
    .filter((name) => /^\p{L}+$/v.test(name))
    .map((name) => name.toUpperCase())
    .toArray()
}

export function newerThanNode22() {
  return [
    // @ts-expect-error: Node 22 has no Promise.try
    Promise.try(() => 1),
    // @ts-expect-error: Node 22 has no Error.isError
    Error.isError(new Error('whatsaaaa')),
    // @ts-expect-error: Node 22 has no Map getOrInsert
    new Map<string, number>().getOrInsert('whatsaaaa', 1),
    // @ts-expect-error: Node 22 has no crypto.argon2
    crypto.argon2,
  ]
}
