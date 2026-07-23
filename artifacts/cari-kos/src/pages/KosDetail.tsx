import { useParams, Link } from "wouter"
import { useGetKos, getGetKosQueryKey } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRupiah } from "@/lib/formatters"
import { getIcon } from "@/lib/icons"
import WorthItScore from "@/components/WorthItScore"
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  MessageCircle, 
  Clock, 
  AlertTriangle,
  MessageSquare
} from "lucide-react"

export default function KosDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: kos, isLoading, isError } = useGetKos(id, { 
    query: { 
      enabled: !!id && !isNaN(id), 
      queryKey: getGetKosQueryKey(id) 
    } 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b p-4">
          <div className="max-w-4xl mx-auto flex items-center">
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-4 py-8 space-y-8">
          <Skeleton className="w-full h-64 md:h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/2 h-6" />
          </div>
          <Skeleton className="w-full h-32" />
        </main>
      </div>
    )
  }

  if (isError || !kos) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Kos Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-6">Mungkin ID kos salah atau data telah dihapus.</p>
        <Button asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    )
  }

  const noWaFormatted = kos.noWa?.replace(/^0/, '62');
  const waLink = noWaFormatted ? `https://wa.me/${noWaFormatted}` : '#';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header with Back Button */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 p-4 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="font-bold font-serif text-lg truncate px-4">{kos.nama}</div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:px-8 md:pt-8 space-y-10 pb-32">
        
        {/* Cover Hero (Placeholder gradient since no specific cover photo) */}
        <div 
          className="w-full h-64 md:h-96 rounded-3xl overflow-hidden relative shadow-sm border border-border"
          style={{ 
            backgroundImage: `linear-gradient(135deg, hsl(var(--secondary) / 0.4), hsl(var(--primary) / 0.2))`,
          }}
        >
          {kos.avgRating != null && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold text-amber-600 shadow-lg animate-in fade-in zoom-in duration-500 delay-300">
              <Star className="w-5 h-5 fill-current" />
              {kos.avgRating.toFixed(1)} <span className="text-muted-foreground font-normal ml-1">({kos.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Title & Core Info */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-black font-serif text-foreground mb-3">{kos.nama}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-base">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <p>{kos.alamat}</p>
              </div>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-right shrink-0 min-w-[240px]">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Harga per bulan</p>
              <p className="text-3xl font-black text-primary">{formatRupiah(kos.harga)}</p>
            </div>
          </div>
        </div>

        {/* Worth It Score — full width on mobile, right sidebar on desktop */}
        <WorthItScore kosId={id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Fasilitas */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold border-b border-border pb-2 flex items-center gap-2">
                <SparklesIcon /> Fasilitas
              </h2>
              {kos.fasilitas && kos.fasilitas.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {kos.fasilitas.map(f => (
                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                      <div className="p-2 bg-white rounded-lg text-secondary-foreground shadow-sm">
                        {getIcon(f.icon)}
                      </div>
                      <span className="font-medium text-sm">{f.nama}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Informasi fasilitas belum tersedia.</p>
              )}
            </section>

            {/* Deskripsi */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold border-b border-border pb-2 flex items-center gap-2">
                <FileTextIcon /> Deskripsi
              </h2>
              <div className="prose prose-sm md:prose-base prose-neutral dark:prose-invert">
                {kos.deskripsi ? (
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{kos.deskripsi}</p>
                ) : (
                  <p className="italic text-muted-foreground">Tidak ada deskripsi dari pemilik.</p>
                )}
              </div>
            </section>

            {/* Aturan & Jam */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-muted/30 p-5 rounded-2xl border border-border">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Aturan Kos
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {kos.aturan || "Tidak ada aturan khusus yang dicantumkan."}
                </p>
              </section>
              <section className="bg-muted/30 p-5 rounded-2xl border border-border">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" /> Jam Operasional
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {kos.jamOperasional || "24 Jam"}
                </p>
              </section>
            </div>

            {/* Reviews */}
            <section className="space-y-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Ulasan Penghuni
                </h2>
                <Badge variant="outline" className="text-sm">{kos.reviewCount} Ulasan</Badge>
              </div>

              {kos.reviews && kos.reviews.length > 0 ? (
                <div className="space-y-4">
                  {kos.reviews.map(review => (
                    <div key={review.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                            U{review.userId}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">User #{review.userId}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-muted opacity-30"}`} />
                          ))}
                        </div>
                      </div>
                      {review.komentar && (
                        <p className="text-sm text-foreground mt-2">{review.komentar}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Belum ada ulasan untuk kos ini.</p>
                  <p className="text-xs text-muted-foreground mt-1">Jadilah yang pertama memberikan ulasan setelah menyewa.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Floating CTA for Mobile & Desktop */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 z-40 transform translate-y-0 transition-transform">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">Tertarik dengan kos ini?</p>
            <p className="font-bold">{kos.nama}</p>
          </div>
          <Button 
            className="w-full md:w-auto h-14 px-8 text-base font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            variant="whatsapp"
            asChild
          >
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" />
              Tanya Pemilik (WhatsApp)
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
  )
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
  )
}
