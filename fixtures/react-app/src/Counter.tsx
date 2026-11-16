import { useState } from 'react'
import { useGreeting } from './use-greeting.ts'

export function Counter({ name }: { name: string }) {
  const [count, setCount] = useState(0)
  const greeting = useGreeting(name)
  return (
    <section>
      <h1>{greeting}</h1>
      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </section>
  )
}
