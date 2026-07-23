import { useLocation, useSearch } from "wouter"
import { 
  useListKos, 
  useListKosTrending, 
  useListKosBestValue, 
  useListKosBudgetFriendly, 
  useListKosHighestRated, 
  useListKosNewest,
  useListFasilitas
} from "@workspace/api-client-react"
import { HeroSearch } from "@/components/HeroSearch"
import { KosSection } from "@/components/KosSection"
import { Flame, Gem, Wallet, Star, Sparkles, Search as SearchIcon } from "lucide-react"

// Optional: generated hero background image
import heroBg from "@assets/generated_images/hero-kos.jpg"

export default function Home() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString || "");
  
  const kota = searchParams.get("kota") || undefined;
  const universitas = searchParams.get("universitas") || undefined;
  const budget_max = searchParams.get("budget_max") ? Number(searchParams.get("budget_max")) : undefined;

  
  const hasSearch = !!(kota || universitas || budget_max);

  // Use all requested hooks
  const { data: searchResults, isLoading: isLoadingSearch } = useListKos(
    { kota, universitas, budget_max },
    { query: { enabled: hasSearch } }
  );

  const { data: trending, isLoading: isLoadingTrending } = useListKosTrending({ limit: 10 });
  const { data: bestValue, isLoading: isLoadingBestValue } = useListKosBestValue({ limit: 10 });
  const { data: budgetFriendly, isLoading: isLoadingBudget } = useListKosBudgetFriendly({ limit: 10 });
  const { data: highestRated, isLoading: isLoadingHighest } = useListKosHighestRated({ limit: 10 });
  const { data: newest, isLoading: isLoadingNewest } = useListKosNewest({ limit: 10 });
  const { data: fasilitas } = useListFasilitas();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Navbar Minimalist */}
      <header className="absolute top-0 inset-x-0 z-50 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
          <span className="bg-primary text-white p-1.5 rounded-lg">CK</span>
          CariKos
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${heroBg})`,
              // Fallback gradient if image is slow or missing
              backgroundColor: "hsl(var(--primary) / 0.2)"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </div>

        <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center">
          <Badge className="mb-6 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-white/30 uppercase tracking-widest text-[10px] md:text-xs">
            Temukan Rumah Kedua Mu
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-white mb-6 leading-tight drop-shadow-lg">
            Kos Nyaman, <br className="hidden md:block"/>Kuliah Tenang.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow">
            Cari kos di sekitar kampusmu dengan mudah. Bandingkan fasilitas, harga, dan review dari teman-teman mahasiswa lainnya.
          </p>
          
          <div className="w-full relative z-20">
            <HeroSearch />
          </div>

          {fasilitas && fasilitas.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap text-white/80 text-sm max-w-3xl">
              <span className="opacity-70 mr-1">Fasilitas unggulan:</span>
              {fasilitas.slice(0, 5).map(f => (
                <span key={f.id} className="bg-white/10 px-2 py-0.5 rounded-md border border-white/20 shadow-sm text-xs">
                  {f.nama}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full pb-24 space-y-4 md:space-y-8 -mt-6 relative z-30">
        
        {/* Search Results Section - Only visible when searched */}
        {hasSearch && (
          <div id="search-results" className="scroll-mt-24 pt-8 border-b border-border/50 pb-8">
            <KosSection 
              title="Hasil Pencarian" 
              icon={<SearchIcon />}
              description={`Ditemukan kos yang sesuai dengan kriteria pencarianmu.`}
              data={searchResults} 
              isLoading={isLoadingSearch} 
              emptyMessage="Maaf, tidak ada kos yang sesuai dengan kriteria pencarianmu. Coba ubah budget atau lokasi."
            />
          </div>
        )}

        {/* The 5 Required Sections */}
        <KosSection 
          title="Lagi Trending" 
          icon={<Flame />}
          description="Paling banyak di-review dan dilihat mahasiswa bulan ini."
          data={trending} 
          isLoading={isLoadingTrending} 
        />

        <KosSection 
          title="Value Terbaik" 
          icon={<Gem />}
          description="Harga masuk akal dengan fasilitas dan rating jempolan."
          data={bestValue} 
          isLoading={isLoadingBestValue} 
        />

        <KosSection 
          title="Budget Pelajar" 
          icon={<Wallet />}
          description="Ramah di kantong, cocok buat yang mau hemat."
          data={budgetFriendly} 
          isLoading={isLoadingBudget} 
        />

        <KosSection 
          title="Rating Tertinggi" 
          icon={<Star className="fill-current" />}
          description="Kos idaman dengan review memuaskan dari penghuni."
          data={highestRated} 
          isLoading={isLoadingHighest} 
        />

        <KosSection 
          title="Baru Ditambahkan" 
          icon={<Sparkles />}
          description="Kos fresh yang baru aja masuk di CariKos."
          data={newest} 
          isLoading={isLoadingNewest} 
        />
        
      </main>

      {/* Simple Footer */}
      <footer className="bg-card py-12 px-6 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-black text-foreground flex items-center gap-2">
            <span className="bg-primary text-white p-1 rounded">CK</span>
            CariKos
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} CariKos. Membantu mahasiswa mencari kos dengan mudah.
          </p>
        </div>
      </footer>
    </div>
  )
}

function Badge({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  )
}
