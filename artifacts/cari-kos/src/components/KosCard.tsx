import { Link } from "wouter"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"
import { Star, MapPin } from "lucide-react"
import { formatRupiah } from "@/lib/formatters"
import { getIcon } from "@/lib/icons"
import type { KosSummary } from "@workspace/api-client-react"

export function KosCard({ kos }: { kos: KosSummary }) {
  const visibleFasilitas = kos.fasilitas?.slice(0, 3) || [];
  const extraFasilitas = (kos.fasilitas?.length || 0) - 3;

  return (
    <Link href={`/kos/${kos.id}`} className="block h-full group">
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 active:scale-[0.98]">
        {/* Optional Image placeholder - Since DB doesn't have cover image, we will use a generated gradient or placeholder pattern based on ID */}
        <div 
          className="h-32 w-full bg-muted relative"
          style={{ 
            backgroundImage: `linear-gradient(120deg, hsl(var(--secondary) / 0.3), hsl(var(--primary) / 0.1))`,
          }}
        >
          {kos.avgRating != null && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-amber-600 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              {kos.avgRating.toFixed(1)}
            </div>
          )}
        </div>
        
        <CardHeader className="p-4 pb-2 flex-none">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {kos.nama}
          </h3>
          <div className="flex items-start gap-1 text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p className="text-xs line-clamp-1">{kos.alamat}</p>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 flex-grow">
          <div className="flex flex-wrap gap-1.5 mt-2">
            {visibleFasilitas.map(f => (
              <Badge key={f.id} variant="secondary" className="px-1.5 py-0.5 gap-1 font-medium bg-secondary/30 text-secondary-foreground">
                {getIcon(f.icon)}
                <span className="truncate max-w-[60px]">{f.nama}</span>
              </Badge>
            ))}
            {extraFasilitas > 0 && (
              <Badge variant="outline" className="px-1.5 py-0.5 text-xs text-muted-foreground">
                +{extraFasilitas}
              </Badge>
            )}
            {visibleFasilitas.length === 0 && (
              <span className="text-xs text-muted-foreground italic">Info fasilitas belum tersedia</span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 mt-auto flex items-end justify-between border-t border-border/40 pb-3 pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Mulai dari</span>
            <div className="text-primary font-bold text-base">
              {formatRupiah(kos.harga)}<span className="text-xs text-muted-foreground font-normal">/bln</span>
            </div>
          </div>
          {kos.reviewCount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              ({kos.reviewCount} ulasan)
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
