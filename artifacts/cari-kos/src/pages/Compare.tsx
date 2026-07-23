import { useState } from "react"
import { Link } from "wouter"
import { useQuery } from "@tanstack/react-query"
import {
  useGetKos,
  getGetKosQueryKey,
  customFetch,
  type KosDetail,
} from "@workspace/api-client-react"
import { useCompare } from "@/store/compare-store"
import type { WorthItScoreData, FactorKey } from "@/types/worth-it-score"
import { formatRupiah } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Trophy,
  Swords,
  TableProperties,
  X,
  Star,
  Banknote,
  Home,
  MapPin,
  ShieldCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
  Minus,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Slot {
  kos: KosDetail | undefined
  score: WorthItScoreData | undefined
  loading: boolean
}

interface LoadedSlot {
  id: number
  kos: KosDetail
  score: WorthItScoreData
}

// ─── Hook: single slot data ───────────────────────────────────────────────────
function useKosSlot(id: number | undefined): Slot {
  const { data: kos } = useGetKos(id ?? 0, {
    query: { enabled: !!id, queryKey: getGetKosQueryKey(id ?? 0) },
  })
  const { data: score } = useQuery<WorthItScoreData>({
    queryKey: ["worth-it-score", id ?? 0],
    queryFn: () => customFetch<WorthItScoreData>(`/api/kos/${id}/worth-it-score`),
    enabled: !!id,
  })
  return { kos, score, loading: !!id && (!kos || !score) }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function gradeColor(grade: string) {
  if (grade === "A+") return "text-emerald-600"
  if (grade === "A") return "text-emerald-500"
  if (grade === "B+") return "text-amber-500"
  if (grade === "B") return "text-amber-400"
  if (grade === "C") return "text-orange-500"
  return "text-rose-500"
}

function gradeLabel(grade: string) {
  if (grade === "A+") return "Sangat Worth It"
  if (grade === "A") return "Worth It"
  if (grade === "B+") return "Cukup Worth It"
  if (grade === "B") return "Lumayan"
  if (grade === "C") return "Perlu Pertimbangan"
  return "Kurang Direkomendasikan"
}

const FACTOR_ICONS: Record<FactorKey, React.ReactNode> = {
  harga: <Banknote className="w-4 h-4" />,
  fasilitas: <Home className="w-4 h-4" />,
  lokasi: <MapPin className="w-4 h-4" />,
  keamanan: <ShieldCheck className="w-4 h-4" />,
  rating: <Star className="w-4 h-4" />,
}

// Per-row comparison definitions
const COMPARE_ROWS: {
  key: string
  label: string
  icon: React.ReactNode
  getValue: (s: LoadedSlot) => string
  getRaw: (s: LoadedSlot) => number     // higher = better (except harga)
  higherIsBetter: boolean
}[] = [
  {
    key: "harga",
    label: "Harga / Bulan",
    icon: <Banknote className="w-4 h-4" />,
    getValue: s => formatRupiah(s.kos.harga) + "/bln",
    getRaw: s => s.kos.harga,
    higherIsBetter: false,
  },
  {
    key: "fasilitas",
    label: "Fasilitas",
    icon: <Home className="w-4 h-4" />,
    getValue: s => `${s.kos.fasilitas?.length ?? 0}/8 fasilitas`,
    getRaw: s => s.kos.fasilitas?.length ?? 0,
    higherIsBetter: true,
  },
  {
    key: "lokasi",
    label: "Lokasi",
    icon: <MapPin className="w-4 h-4" />,
    getValue: s => `Skor ${s.score.factors.lokasi.score}/100`,
    getRaw: s => s.score.factors.lokasi.score,
    higherIsBetter: true,
  },
  {
    key: "keamanan",
    label: "Keamanan",
    icon: <ShieldCheck className="w-4 h-4" />,
    getValue: s => {
      const sc = s.score.factors.keamanan.score
      return sc === 100 ? "CCTV + Penjaga" : sc === 60 ? "Sebagian ada" : "Tidak ada"
    },
    getRaw: s => s.score.factors.keamanan.score,
    higherIsBetter: true,
  },
  {
    key: "rating",
    label: "Rating Penghuni",
    icon: <Star className="w-4 h-4" />,
    getValue: s =>
      s.kos.avgRating != null
        ? `${s.kos.avgRating.toFixed(1)} ★ (${s.kos.reviewCount})`
        : "Belum ada",
    getRaw: s => s.kos.avgRating ?? 0,
    higherIsBetter: true,
  },
  {
    key: "worth_it",
    label: "Worth It Score",
    icon: <Trophy className="w-4 h-4" />,
    getValue: s => `${s.score.total}/100 (${s.score.grade})`,
    getRaw: s => s.score.total,
    higherIsBetter: true,
  },
]

function getWinner(slots: LoadedSlot[], row: typeof COMPARE_ROWS[0]): number | null {
  const raws = slots.map(s => row.getRaw(s))
  const best = row.higherIsBetter ? Math.max(...raws) : Math.min(...raws)
  const winners = slots.filter(s => row.getRaw(s) === best)
  return winners.length === 1 ? winners[0].id : null  // null = tie
}

function getOverallWinner(slots: LoadedSlot[]): LoadedSlot {
  return [...slots].sort((a, b) => b.score.total - a.score.total)[0]
}

function getWinnerReason(winner: LoadedSlot, allSlots: LoadedSlot[]): string {
  const winsIn: string[] = []
  for (const row of COMPARE_ROWS) {
    const winnerId = getWinner(allSlots, row)
    if (winnerId === winner.id) winsIn.push(row.label)
  }
  const secondBest = allSlots
    .filter(s => s.id !== winner.id)
    .sort((a, b) => b.score.total - a.score.total)[0]
  const gap = secondBest ? winner.score.total - secondBest.score.total : 0
  return `Unggul di ${winsIn.length} dari ${COMPARE_ROWS.length} kategori` +
    (gap > 0 ? `, selisih ${gap} poin dari pesaing terdekat.` : ".")
}

// ─── Kos column card (header cell in table) ────────────────────────────────────
function KosHeaderCell({
  slot,
  isWinner,
  onRemove,
}: {
  slot: LoadedSlot
  isWinner: boolean
  onRemove: () => void
}) {
  return (
    <div className={cn(
      "relative p-3 rounded-xl border text-center space-y-1 min-w-[140px]",
      isWinner
        ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700"
        : "bg-card border-border"
    )}>
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 gap-1">
            <Trophy className="w-2.5 h-2.5" /> Winner
          </Badge>
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Hapus ${slot.kos.nama}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <Link href={`/kos/${slot.id}`} className="block hover:underline">
        <p className="font-bold text-sm leading-tight line-clamp-2 pr-4">{slot.kos.nama}</p>
      </Link>
      <p className="text-xs text-muted-foreground line-clamp-1">{slot.kos.alamat}</p>
      <p className="text-sm font-black text-primary">{formatRupiah(slot.kos.harga)}</p>
    </div>
  )
}

// ─── Compare Table ────────────────────────────────────────────────────────────
function CompareTable({ slots, onRemove }: { slots: LoadedSlot[]; onRemove: (id: number) => void }) {
  const winner = getOverallWinner(slots)

  return (
    <div className="space-y-6">
      {/* Horizontal scrollable table */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="min-w-max">
          {/* Header row: kos cards */}
          <div className="flex gap-3 mb-4 pl-36">
            {slots.map(s => (
              <KosHeaderCell
                key={s.id}
                slot={s}
                isWinner={s.id === winner.id}
                onRemove={() => onRemove(s.id)}
              />
            ))}
          </div>

          {/* Data rows */}
          <div className="space-y-1">
            {COMPARE_ROWS.map(row => {
              const winnerId = getWinner(slots, row)
              return (
                <div key={row.key} className="flex items-center gap-3">
                  {/* Row label */}
                  <div className="w-36 shrink-0 flex items-center gap-2 text-sm font-semibold text-muted-foreground py-2">
                    <span className="text-primary/60">{row.icon}</span>
                    {row.label}
                  </div>
                  {/* Value cells */}
                  {slots.map(s => {
                    const isWinner = winnerId === s.id
                    const isTie = winnerId === null
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "min-w-[140px] px-3 py-2.5 rounded-xl text-sm font-medium text-center border transition-colors",
                          isWinner
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-300 font-bold"
                            : isTie
                            ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-700"
                            : "bg-muted/30 border-border text-muted-foreground"
                        )}
                      >
                        {row.getValue(s)}
                        {isWinner && <span className="ml-1 text-emerald-600 dark:text-emerald-400">✓</span>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Overall Winner card */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-700 p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500 rounded-xl text-white shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
              Overall Winner
            </p>
            <p className="text-xl font-black text-foreground leading-tight">{winner.kos.nama}</p>
            <p className={cn("text-sm font-semibold mt-0.5", gradeColor(winner.score.grade))}>
              {winner.score.total}/100 · {gradeLabel(winner.score.grade)}
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {getWinnerReason(winner, slots)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Battle Mode ──────────────────────────────────────────────────────────────
function BattleRow({
  row,
  left,
  right,
}: {
  row: typeof COMPARE_ROWS[0]
  left: LoadedSlot
  right: LoadedSlot
}) {
  const lRaw = row.getRaw(left)
  const rRaw = row.getRaw(right)
  const lWins = row.higherIsBetter ? lRaw > rRaw : lRaw < rRaw
  const rWins = row.higherIsBetter ? rRaw > lRaw : rRaw < lRaw
  const tie = lRaw === rRaw

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {/* Left value */}
      <div className={cn(
        "p-3 rounded-xl text-sm text-right border transition-colors",
        lWins
          ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-300"
          : "bg-muted/20 border-border text-muted-foreground"
      )}>
        {row.getValue(left)}
      </div>

      {/* Center: category label + winner arrow */}
      <div className="flex flex-col items-center gap-1 min-w-[72px]">
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          {row.icon}
          <span className="font-semibold hidden sm:inline">{row.label}</span>
        </div>
        <div className="flex items-center gap-0.5 text-xs font-bold">
          {tie ? (
            <Minus className="w-4 h-4 text-amber-500" />
          ) : lWins ? (
            <ChevronLeft className="w-5 h-5 text-emerald-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-emerald-500" />
          )}
        </div>
        {/* Category name on mobile (below icon) */}
        <span className="text-[10px] text-muted-foreground text-center sm:hidden leading-tight">
          {row.label}
        </span>
      </div>

      {/* Right value */}
      <div className={cn(
        "p-3 rounded-xl text-sm text-left border transition-colors",
        rWins
          ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-300"
          : "bg-muted/20 border-border text-muted-foreground"
      )}>
        {row.getValue(right)}
      </div>
    </div>
  )
}

function BattleMode({ left, right }: { left: LoadedSlot; right: LoadedSlot }) {
  const lTotal = left.score.total
  const rTotal = right.score.total
  const champion = lTotal >= rTotal ? left : right
  const isLeftChamp = champion.id === left.id

  // Count category wins
  const leftWins = COMPARE_ROWS.filter(row => {
    const lRaw = row.getRaw(left)
    const rRaw = row.getRaw(right)
    return row.higherIsBetter ? lRaw > rRaw : lRaw < rRaw
  }).length
  const rightWins = COMPARE_ROWS.length - leftWins - COMPARE_ROWS.filter(row => row.getRaw(left) === row.getRaw(right)).length

  return (
    <div className="space-y-5">
      {/* Hero matchup header */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr]">
          {/* Left kos */}
          <div className={cn(
            "p-4 text-center space-y-1",
            isLeftChamp && "bg-emerald-50 dark:bg-emerald-950/20"
          )}>
            {isLeftChamp && (
              <div className="flex justify-center mb-2">
                <Badge className="bg-emerald-500 text-white gap-1 text-xs">
                  <Trophy className="w-3 h-3" /> Champion
                </Badge>
              </div>
            )}
            <Link href={`/kos/${left.id}`} className="block">
              <p className="font-black text-sm md:text-base leading-tight hover:text-primary transition-colors">
                {left.kos.nama}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-1">{left.kos.alamat}</p>
            <p className="text-primary font-bold text-sm">{formatRupiah(left.kos.harga)}/bln</p>
            <div className={cn("text-2xl font-black mt-1", gradeColor(left.score.grade))}>
              {left.score.total}
              <span className="text-sm text-muted-foreground font-normal">/100</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {leftWins} kategori menang
            </p>
          </div>

          {/* VS center */}
          <div className="flex flex-col items-center justify-center px-3 py-4 border-x border-border bg-muted/10">
            <Swords className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-xs font-black text-muted-foreground tracking-widest">VS</span>
          </div>

          {/* Right kos */}
          <div className={cn(
            "p-4 text-center space-y-1",
            !isLeftChamp && "bg-emerald-50 dark:bg-emerald-950/20"
          )}>
            {!isLeftChamp && (
              <div className="flex justify-center mb-2">
                <Badge className="bg-emerald-500 text-white gap-1 text-xs">
                  <Trophy className="w-3 h-3" /> Champion
                </Badge>
              </div>
            )}
            <Link href={`/kos/${right.id}`} className="block">
              <p className="font-black text-sm md:text-base leading-tight hover:text-primary transition-colors">
                {right.kos.nama}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-1">{right.kos.alamat}</p>
            <p className="text-primary font-bold text-sm">{formatRupiah(right.kos.harga)}/bln</p>
            <div className={cn("text-2xl font-black mt-1", gradeColor(right.score.grade))}>
              {right.score.total}
              <span className="text-sm text-muted-foreground font-normal">/100</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {rightWins} kategori menang
            </p>
          </div>
        </div>
      </div>

      {/* Category rows */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider px-1 mb-3">
          Perbandingan Per Kategori
        </p>
        {COMPARE_ROWS.map(row => (
          <BattleRow key={row.key} row={row} left={left} right={right} />
        ))}
      </div>

      {/* Champion verdict */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-700 p-5">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-5 h-5 text-emerald-600" />
          <p className="font-black text-foreground">
            {champion.kos.nama} <span className="text-emerald-600">menang</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getWinnerReason(champion, [left, right])}
        </p>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CompareSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl bg-muted/40" />
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
      <div className="p-5 bg-muted/30 rounded-2xl">
        <GitCompareArrows className="w-12 h-12 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Belum ada kos yang dipilih</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Pilih 2–5 kos dari beranda dengan menekan tombol{" "}
          <strong>Bandingkan</strong> pada kartu kos.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Cari Kos</Link>
      </Button>
    </div>
  )
}

// Imported inside component to avoid cycle issues
function GitCompareArrows({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M16 3h5v5" /><path d="M8 3H3v5" />
      <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
      <path d="m15 9 6-6" />
      <path d="M12 22v-8.3a4 4 0 0 1 1.172-2.872L21 3" />
    </svg>
  )
}

// ─── Main Compare page ─────────────────────────────────────────────────────────
export default function Compare() {
  const { ids, remove } = useCompare()
  const [mode, setMode] = useState<"table" | "battle">("table")

  // Fixed 5 slots — always call same number of hooks (valid React)
  const s0 = useKosSlot(ids[0])
  const s1 = useKosSlot(ids[1])
  const s2 = useKosSlot(ids[2])
  const s3 = useKosSlot(ids[3])
  const s4 = useKosSlot(ids[4])

  const rawSlots: Slot[] = [s0, s1, s2, s3, s4]
  const isLoading = ids.some((_, i) => rawSlots[i]?.loading)

  const loadedSlots: LoadedSlot[] = ids
    .map((id, i) => {
      const s = rawSlots[i]
      if (!s?.kos || !s?.score) return null
      return { id, kos: s.kos, score: s.score } as LoadedSlot
    })
    .filter((s): s is LoadedSlot => s !== null)

  const canBattle = loadedSlots.length === 2

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-lg leading-tight">Perbandingan Kos</h1>
            <p className="text-xs text-muted-foreground">
              {loadedSlots.length} dari {ids.length} kos siap · pilih hingga 5 kos
            </p>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center bg-muted rounded-xl p-1 gap-1 shrink-0">
            <button
              onClick={() => setMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                mode === "table"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
            <button
              onClick={() => canBattle ? setMode("battle") : undefined}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                mode === "battle"
                  ? "bg-background text-foreground shadow-sm"
                  : canBattle
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-muted-foreground/40 cursor-not-allowed"
              )}
              title={!canBattle ? "Pilih tepat 2 kos untuk Battle Mode" : undefined}
            >
              <Swords className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Battle</span>
              {!canBattle && (
                <span className="text-[10px] bg-muted-foreground/20 px-1 rounded">2</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {ids.length === 0 ? (
          <EmptyState />
        ) : isLoading ? (
          <CompareSkeleton />
        ) : loadedSlots.length < 2 ? (
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <p className="text-base font-semibold">Memuat data kos…</p>
            <p className="text-sm">Atau tambahkan lebih banyak kos dari beranda.</p>
            <Button variant="outline" asChild>
              <Link href="/"><Plus className="w-4 h-4 mr-2" />Tambah Kos</Link>
            </Button>
          </div>
        ) : mode === "table" ? (
          <CompareTable slots={loadedSlots} onRemove={remove} />
        ) : loadedSlots.length === 2 ? (
          <BattleMode left={loadedSlots[0]} right={loadedSlots[1]} />
        ) : (
          <div className="text-center py-12 space-y-3">
            <Swords className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <p className="font-semibold">Battle Mode butuh tepat 2 kos</p>
            <p className="text-sm text-muted-foreground">
              Hapus beberapa kos hingga tersisa 2, atau gunakan Tabel.
            </p>
            <Button variant="outline" onClick={() => setMode("table")}>
              Ke Tabel Perbandingan
            </Button>
          </div>
        )}

        {/* Add more prompt */}
        {ids.length > 0 && ids.length < 5 && (
          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Plus className="w-4 h-4" />
              Tambah kos lagi ({5 - ids.length} slot tersisa)
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
