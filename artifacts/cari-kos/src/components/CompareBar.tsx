import { Link, useLocation } from "wouter"
import { GitCompareArrows, X } from "lucide-react"
import { useCompare } from "@/store/compare-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CompareBar() {
  const { ids, clear, count } = useCompare()
  const [location] = useLocation()

  // Don't show on compare page itself or when nothing is selected
  if (count === 0 || location === "/compare") return null

  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
      "flex items-center gap-3 px-4 py-3",
      "bg-foreground text-background rounded-2xl shadow-2xl",
      "border border-white/10",
      "animate-in slide-in-from-bottom-4 duration-300",
      "max-w-[calc(100vw-2rem)] w-auto"
    )}>
      <GitCompareArrows className="w-4 h-4 shrink-0 opacity-70" />

      <span className="text-sm font-semibold whitespace-nowrap">
        {count} kos dipilih
      </span>

      {/* Dot separators showing slots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-200",
              i < count ? "bg-primary scale-125" : "bg-white/20"
            )}
          />
        ))}
      </div>

      <Button
        size="sm"
        variant="secondary"
        asChild
        className="h-8 px-3 text-xs font-bold rounded-xl bg-white text-foreground hover:bg-white/90 shrink-0"
      >
        <Link href="/compare">Bandingkan</Link>
      </Button>

      <button
        onClick={clear}
        aria-label="Hapus semua pilihan"
        className="text-white/50 hover:text-white transition-colors p-0.5 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
