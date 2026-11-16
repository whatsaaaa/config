import { useMemo } from 'react'

export function useGreeting(name: string): string {
  return useMemo(() => `Hello, ${name}`, [name])
}
