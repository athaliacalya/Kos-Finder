import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

export const MAX_COMPARE = 5
const STORAGE_KEY = "cari-kos:compare-ids"

interface CompareContextValue {
  ids: number[]
  toggle: (id: number) => void
  remove: (id: number) => void
  has: (id: number) => boolean
  clear: () => void
  count: number
  isFull: boolean
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      const parsed = s ? JSON.parse(s) : []
      return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  const toggle = useCallback((id: number) => {
    setIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length >= MAX_COMPARE
        ? prev                         // silently ignore when full
        : [...prev, id]
    )
  }, [])

  const remove = useCallback((id: number) => {
    setIds(prev => prev.filter(i => i !== id))
  }, [])

  const has = useCallback((id: number) => ids.includes(id), [ids])

  const clear = useCallback(() => setIds([]), [])

  return (
    <CompareContext.Provider
      value={{ ids, toggle, remove, has, clear, count: ids.length, isFull: ids.length >= MAX_COMPARE }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error("useCompare must be inside <CompareProvider>")
  return ctx
}
