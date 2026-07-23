import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { customFetch } from "@workspace/api-client-react"
import { Banknote, ChevronDown, ChevronUp, Home, MapPin, ShieldCheck, Star } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FactorDetail {
  score: number
  weight: number
  label: string
  explanation: string
}

interface WorthItScoreData {
  total: number
  grade: string
  factors: {
    harga: FactorDetail
    fasilitas: FactorDetail
    lokasi: FactorDetail
    keamanan: FactorDetail
    rating: FactorDetail
  }
  cityContext: {
    campusName: string
    peerCount: number
    avgHarga: number
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gradeColor(grade: string): string {
  if (grade === "A+") return "text-emerald-600"
  if (grade === "A")  return "text-emerald-500"
  if (grade === "B+") return "text-amber-500"
  if (grade === "B")  return "text-amber-400"
  if (grade === "C")  return "text-orange-500"
  return "text-rose-500"
}

function gradeLabel(grade: string): string {
  if (grade === "A+") return "Sangat Worth It"
  if (grade === "A")  return "Worth It"
  if (grade === "B+") return "Cukup Worth It"
  if (grade === "B")  return "Lumayan"
  if (grade === "C")  return "Perlu Pertimbangan"
  return "Kurang Direkomendasikan"
}

function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-400"
  if (score >= 40) return "bg-orange-400"
  return "bg-rose-400"
}

const FACTOR_ICONS: Record<string, React.ReactNode> = {
  harga:     <Banknote  className="w-4 h-4 shrink-0" />,
  fasilitas: <Home      className="w-4 h-4 shrink-0" />,
  lokasi:    <MapPin    className="w-4 h-4 shrink-0" />,
  keamanan:  <ShieldCheck className="w-4 h-4 shrink-0" />,
  rating:    <Star      className="w-4 h-4 shrink-0" />,
}

function FactorIcon({ factorKey, score }: { factorKey: string; score: number }) {
  const colorClass =
    score >= 80 ? "text-emerald-500" :
    score >= 60 ? "text-amber-500"   :
    score >= 40 ? "text-orange-500"  : "text-rose-500"
  return (
    <span className={cn("flex items-center justify-center", colorClass)}>
      {FACTOR_ICONS[factorKey]}
    </span>
  )
}

// ─── Score ring (SVG) ─────────────────────────────────────────────────────────
function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const R = 44
  const circ = 2 * Math.PI * R
  const fill = circ - (score / 100) * circ

  const ringColor =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#f59e0b" :
    score >= 40 ? "#f97316" : "#ef4444"

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor"
          strokeWidth="8" className="text-muted/20" />
        {/* Fill */}
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-black leading-none", gradeColor(grade))}>{score}</span>
        <span className="text-[10px] text-muted-foreground font-medium">/100</span>
      </div>
    </div>
  )
}

// ─── Factor row ───────────────────────────────────────────────────────────────
function FactorRow({ factorKey, factor }: { factorKey: string; factor: FactorDetail }) {
  const contribution = Math.round(factor.score * factor.weight)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FactorIcon factorKey={factorKey} score={factor.score} />
          <span className="font-semibold truncate">{factor.label}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            ({Math.round(factor.weight * 100)}%)
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-bold tabular-nums">{factor.score}</span>
          <span className="text-xs text-muted-foreground">→ +{contribution} poin</span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", scoreBarColor(factor.score))}
          style={{ width: `${factor.score}%` }}
        />
      </div>
      {/* Explanation */}
      <p className="text-xs text-muted-foreground leading-relaxed pl-6">{factor.explanation}</p>
    </div>
  )
}

// ─── Stars display ────────────────────────────────────────────────────────────
function ScoreStars({ score }: { score: number }) {
  // map 0-100 to 0-5 stars in 0.5 increments
  const stars = Math.round((score / 100) * 5 * 2) / 2
  return (
    <div className="flex items-center gap-0.5" aria-label={`${stars} dari 5 bintang`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const full = i + 1 <= stars
        const half = !full && i + 0.5 <= stars
        return (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              full ? "text-amber-400 fill-amber-400" :
              half ? "text-amber-400 fill-amber-200" :
              "text-muted-foreground/30"
            )}
          />
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function WorthItScore({ kosId }: { kosId: number }) {
  const [open, setOpen] = useState(false)

  const { data, isLoading, isError } = useQuery<WorthItScoreData>({
    queryKey: ["worth-it-score", kosId],
    queryFn: () => customFetch<WorthItScoreData>(`/api/kos/${kosId}/worth-it-score`),
    enabled: !!kosId,
  })

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-muted/40" />
        <div className="flex gap-4">
          <div className="w-28 h-28 rounded-full bg-muted/30" />
          <div className="flex-1 space-y-2 py-2">
            <div className="h-4 w-1/2 rounded bg-muted/40" />
            <div className="h-3 w-2/3 rounded bg-muted/30" />
            <div className="h-3 w-1/3 rounded bg-muted/20" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data) return null

  const factorOrder = ["harga", "fasilitas", "lokasi", "keamanan", "rating"] as const

  return (
    <section
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      aria-label="Worth It Score"
    >
      {/* ── Header row ── */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-1 mb-4">
          <span className="text-lg font-black font-serif text-foreground">Worth It Score</span>
          <span className="mt-0.5 ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
            BETA
          </span>
        </div>

        {/* Score ring + summary */}
        <div className="flex items-center gap-5">
          <ScoreRing score={data.total} grade={data.grade} />

          <div className="flex-1 min-w-0">
            <div className={cn("text-xl font-bold leading-tight", gradeColor(data.grade))}>
              {gradeLabel(data.grade)}
            </div>
            <ScoreStars score={data.total} />
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {data.cityContext.peerCount > 0
                ? `Dibandingkan dengan ${data.cityContext.peerCount} kos lain di sekitar ${data.cityContext.campusName}.`
                : `Kos terdekat dengan ${data.cityContext.campusName}.`
              }
            </p>
          </div>
        </div>

        {/* Mini bar summary (always visible) */}
        <div className="mt-5 grid grid-cols-5 gap-1.5" aria-hidden="true">
          {factorOrder.map(key => {
            const f = data.factors[key]
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", scoreBarColor(f.score))}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground text-center leading-tight hidden sm:block">
                  {f.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Expandable breakdown ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-5 sm:px-6 py-3 border-t border-border bg-muted/20 hover:bg-muted/40 transition-colors text-sm font-semibold text-foreground"
        aria-expanded={open}
      >
        <span>Lihat detail perhitungan</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 sm:px-6 py-5 border-t border-border space-y-5">
          {/* Contribution table header */}
          <div className="text-xs text-muted-foreground pb-1 border-b border-border/50">
            Skor tiap faktor × bobot = kontribusi ke total <strong className="text-foreground">{data.total}/100</strong>
          </div>

          {factorOrder.map(key => (
            <FactorRow key={key} factorKey={key} factor={data.factors[key]} />
          ))}

          {/* Formula summary */}
          <div className="rounded-xl bg-muted/30 p-4 text-xs text-muted-foreground space-y-1 border border-border/50">
            <p className="font-semibold text-foreground mb-2">Formula Perhitungan</p>
            {factorOrder.map(key => {
              const f = data.factors[key]
              return (
                <div key={key} className="flex items-center justify-between gap-2 font-mono">
                  <span className="flex items-center gap-1.5"><FactorIcon factorKey={key} score={f.score} />{f.label}</span>
                  <span>
                    {f.score} × {Math.round(f.weight * 100)}% ={" "}
                    <strong className="text-foreground">+{Math.round(f.score * f.weight)}</strong>
                  </span>
                </div>
              )
            })}
            <div className="flex items-center justify-between gap-2 font-mono border-t border-border/50 pt-2 mt-2 font-bold text-foreground">
              <span>Total</span>
              <span>{data.total}/100 (Grade {data.grade})</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
