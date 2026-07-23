import React, { useRef } from "react"
import { KosCard } from "./KosCard"
import { Skeleton } from "./ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { KosSummary } from "@workspace/api-client-react"

interface KosSectionProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  data?: KosSummary[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function KosSection({ 
  title, 
  icon, 
  description, 
  data = [], 
  isLoading, 
  emptyMessage = "Belum ada data kos untuk kategori ini." 
}: KosSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth + 50 : current.offsetWidth - 50;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // if (!isLoading && data.length === 0) {
  //   return null; 
  // }

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-6 px-4 md:px-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {icon && <div className="text-primary">{icon}</div>}
            <h2 className="text-2xl font-bold font-serif text-foreground">{title}</h2>
          </div>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative group">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-8 pb-8 pt-2 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[280px] md:w-[320px] flex-none snap-start">
                <div className="h-[340px] rounded-2xl border border-border bg-card overflow-hidden">
                  <Skeleton className="h-32 w-full rounded-none" />
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="pt-6">
                      <Skeleton className="h-8 w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : data.length > 0 ? (
            data.map((kos, index) => (
              <div 
                key={kos.id} 
                className="w-[280px] md:w-[320px] flex-none snap-start"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both h-full">
                  <KosCard kos={kos} />
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center px-4 bg-muted/30 rounded-2xl border border-dashed border-border mx-4 md:mx-8">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
