"use client"

import { useEffect, useState } from "react"
import {
  ArrowRight,
  GraduationCap,
  HandHeart,
  Landmark,
  PiggyBank,
  Sparkles,
  TrendingUp,
  HandCoins,
  Percent,
  type LucideIcon,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
const REFRESH_INTERVAL_MS = 60_000 // Endowment data changes slowly — once a minute is plenty.

// ---- Types -----------------------------------------------------------------

type InstrumentType =
  | "reksa_dana"
  | "sukuk"
  | "deposito_syariah"
  | "saham_syariah"
  | string // backend may return others; treated as "Lainnya"

interface AllocationSlice {
  type: InstrumentType
  amount: number
  percentage: number
}

interface EndowmentSummary {
  totalCorpus: number
  totalCurrentValue: number
  totalImbalHasil: number
  totalDisalurkan: number
  returnPercentage: number
  activeInvestments: number
  allocationByType: AllocationSlice[]
  lastUpdated: string
}

// ---- Display maps ----------------------------------------------------------

const INSTRUMENT_LABELS: Record<string, string> = {
  sukuk: "Sukuk Negara",
  reksa_dana: "Reksa Dana Syariah",
  deposito_syariah: "Deposito Syariah",
  saham_syariah: "Saham Syariah",
}

const INSTRUMENT_COLORS: Record<string, string> = {
  sukuk: "#378ADD",
  reksa_dana: "#1D9E75",
  deposito_syariah: "#BA7517",
  saham_syariah: "#D85A30",
}

/**
 * Canonical row order for the bar chart — keeps the layout stable across
 * refreshes regardless of the order the API returns slices in. Anything the
 * API includes that isn't in this list is appended as "Lainnya".
 */
const INSTRUMENT_ORDER: InstrumentType[] = [
  "sukuk",
  "reksa_dana",
  "deposito_syariah",
  "saham_syariah",
]

// ---- Helpers ---------------------------------------------------------------

/**
 * Compact Indonesian rupiah formatter used by the counter cards. Picks the
 * largest unit that gives a number ≥ 1 so we read "Rp 1,5 Miliar" rather
 * than "Rp 1500 Juta".
 */
function formatLargeRupiah(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "Rp 0"
  const abs = Math.abs(n)
  const sign = n < 0 ? "-" : ""
  if (abs >= 1_000_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000_000).toFixed(2).replace(".", ",")} Triliun`
  }
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2).replace(".", ",")} Miliar`
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace(".", ",")} Juta`
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(0)} Ribu`
  }
  return `${sign}Rp ${Math.round(abs).toLocaleString("id-ID")}`
}

function formatSignedPercent(value: number): string {
  if (!Number.isFinite(value)) return "0,00%"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2).replace(".", ",")}%`
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ---- Component -------------------------------------------------------------

export function EndowmentSection() {
  const [data, setData] = useState<EndowmentSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/endowment`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as EndowmentSummary
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      } catch (err) {
        // Don't surface this to landing visitors — keep skeleton on first
        // failure, retry on the next interval. Other landing sections use
        // this same "silent retry" pattern.
        console.error("[EndowmentSection] fetch failed:", err)
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    const id = window.setInterval(load, REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return (
    <section
      id="dana-abadi"
      className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#1a0a0a] via-[#0c0404] to-[#1a0a0a]"
    >
      {/* Soft brand-color glows so the section feels "lit" without competing
          with the hero gradient above. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-[#B30000]/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-[#D4C896]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-sm font-medium text-[#D4C896] uppercase tracking-wider">
            Dana Abadi (Endowment)
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white text-balance">
            Donasi Anda Tidak Dihabiskan —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4C896] to-[#f0e6c8]">
              Dikembangkan
            </span>
          </h2>
          <p className="mt-4 text-lg text-white/70 text-pretty leading-relaxed">
            Setiap donasi yang masuk diinvestasikan dalam instrumen syariah. Hanya{" "}
            <span className="text-[#D4C896] font-medium">imbal hasil</span> yang
            disalurkan ke program — pokok dana abadi tetap utuh dan terus tumbuh
            untuk generasi diaspora berikutnya.
          </p>
        </div>

        {/* Sub-section A — Counter cards */}
        <CounterCards data={data} loading={loading} />

        {/* Sub-section B — Flow visualization */}
        <FlowDiagram />

        {/* Sub-section C — Allocation bars */}
        <AllocationBars data={data} loading={loading} />

        {/* Last-updated footnote */}
        {data?.lastUpdated && (
          <p className="mt-10 text-center text-xs text-white/40">
            Diperbarui {formatLastUpdated(data.lastUpdated)} · Otomatis menyegarkan
            setiap menit
          </p>
        )}
      </div>
    </section>
  )
}

// ---- Sub-section A: counter cards ------------------------------------------

interface CounterCard {
  label: string
  value: string
  icon: LucideIcon
  /** Hex used for icon tint + value highlight. */
  accent: string
}

interface CounterProps {
  data: EndowmentSummary | null
  loading: boolean
}

function CounterCards({ data, loading }: CounterProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
        {Array.from({ length: 4 }).map((_, i) => (
          <CounterSkeleton key={i} />
        ))}
      </div>
    )
  }

  const cards: CounterCard[] = [
    {
      label: "Total Dana Abadi",
      value: formatLargeRupiah(data.totalCorpus),
      icon: PiggyBank,
      accent: "#B30000",
    },
    {
      label: "Imbal Hasil Dihasilkan",
      value: formatLargeRupiah(data.totalImbalHasil),
      icon: TrendingUp,
      accent: "#D4C896", // gold
    },
    {
      label: "Sudah Disalurkan ke Program",
      value: formatLargeRupiah(data.totalDisalurkan),
      icon: HandCoins,
      accent: "#4a9f6e", // mint/green
    },
    {
      label: "Imbal Hasil per Tahun",
      value: formatSignedPercent(data.returnPercentage),
      icon: Percent,
      accent: data.returnPercentage >= 0 ? "#4a9f6e" : "#B30000",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
      {cards.map((c) => (
        <CounterCardView key={c.label} card={c} />
      ))}
    </div>
  )
}

function CounterCardView({ card }: { card: CounterCard }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.07] transition-all duration-300" />
      <div className="relative p-5 md:p-6">
        <div
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
          style={{ backgroundColor: `${card.accent}26` /* ~15% alpha */ }}
        >
          <card.icon className="w-5 h-5" style={{ color: card.accent }} />
        </div>
        <p
          className="text-2xl md:text-3xl font-bold mb-1 tabular-nums tracking-tight"
          style={{ color: card.accent }}
        >
          {card.value}
        </p>
        <p className="text-sm text-white/60 leading-snug">{card.label}</p>
      </div>
    </div>
  )
}

function CounterSkeleton() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10" />
      <div className="relative p-5 md:p-6">
        <div className="w-11 h-11 rounded-xl bg-white/10 animate-pulse mb-4" />
        <div className="h-7 w-3/4 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  )
}

// ---- Sub-section B: flow diagram -------------------------------------------

interface FlowStep {
  icon: LucideIcon
  label: string
  /** Sub-label gives the 2-second elevator pitch for the step. */
  hint: string
  accent: string
}

const FLOW_STEPS: FlowStep[] = [
  {
    icon: HandHeart,
    label: "Donasi Masuk",
    hint: "Donatur menyalurkan dana ke yayasan",
    accent: "#B30000",
  },
  {
    icon: Landmark,
    label: "Diinvestasikan Syariah",
    hint: "Sukuk, reksa dana, deposito, saham syariah",
    accent: "#378ADD",
  },
  {
    icon: Sparkles,
    label: "Imbal Hasil",
    hint: "Hasil investasi dikumpulkan secara berkala",
    accent: "#D4C896",
  },
  {
    icon: GraduationCap,
    label: "Program Diaspora",
    hint: "Beasiswa, UMKM, kesehatan, dan lainnya",
    accent: "#4a9f6e",
  },
]

function FlowDiagram() {
  return (
    <div className="mb-16">
      <h3 className="text-center text-base md:text-lg text-white/70 mb-8">
        Bagaimana Donasi Anda Bekerja
      </h3>

      {/* Horizontal on lg+, vertical stack on small screens. */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-2">
        {FLOW_STEPS.map((step, idx) => {
          const isLast = idx === FLOW_STEPS.length - 1
          return (
            <div
              key={step.label}
              className="flex flex-col lg:flex-row items-center gap-4 lg:gap-2 lg:flex-1"
            >
              <FlowStepCard step={step} index={idx} />
              {!isLast && <FlowArrow />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FlowStepCard({ step, index }: { step: FlowStep; index: number }) {
  return (
    <div className="relative w-full lg:w-auto lg:flex-1 group">
      <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 group-hover:border-white/20 transition-all duration-300" />
      <div className="relative p-5 text-center flex flex-col items-center gap-3">
        <div
          className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{ backgroundColor: `${step.accent}26` }}
        >
          <step.icon className="w-6 h-6" style={{ color: step.accent }} />
          <span
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/10 text-white/80 text-xs font-medium flex items-center justify-center border border-white/20"
            aria-hidden
          >
            {index + 1}
          </span>
        </div>
        <p className="text-base font-semibold text-white">{step.label}</p>
        <p className="text-xs text-white/50 leading-snug max-w-[16ch]">{step.hint}</p>
      </div>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="text-white/30 flex-shrink-0" aria-hidden>
      {/* Right arrow on horizontal layout, down arrow on stacked. */}
      <ArrowRight className="w-6 h-6 hidden lg:block" />
      <ArrowRight className="w-6 h-6 rotate-90 lg:hidden" />
    </div>
  )
}

// ---- Sub-section C: allocation bars ----------------------------------------

interface AllocationBarsProps {
  data: EndowmentSummary | null
  loading: boolean
}

function AllocationBars({ data, loading }: AllocationBarsProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10" />
      <div className="relative p-6 md:p-8">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
          <h3 className="text-lg md:text-xl font-semibold text-white">
            Alokasi Dana Investasi
          </h3>
          <p className="text-xs text-white/40">Persentase dari nilai pasar saat ini</p>
        </div>

        {loading || !data ? (
          <AllocationSkeleton />
        ) : data.allocationByType.length === 0 ? (
          <p className="text-sm text-white/50 italic py-8 text-center">
            Belum ada alokasi investasi untuk ditampilkan.
          </p>
        ) : (
          <div className="space-y-4">
            {orderedSlices(data.allocationByType).map((slice) => (
              <AllocationRow key={slice.type} slice={slice} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Reorder the API response into the canonical INSTRUMENT_ORDER, then append
 * any unexpected types at the end labelled "Lainnya".
 */
function orderedSlices(slices: AllocationSlice[]): AllocationSlice[] {
  const byType = new Map(slices.map((s) => [s.type, s]))
  const ordered: AllocationSlice[] = []
  for (const t of INSTRUMENT_ORDER) {
    const s = byType.get(t)
    if (s) {
      ordered.push(s)
      byType.delete(t)
    }
  }
  // Anything left over gets appended.
  for (const s of byType.values()) ordered.push(s)
  return ordered
}

function AllocationRow({ slice }: { slice: AllocationSlice }) {
  const label = INSTRUMENT_LABELS[slice.type] ?? "Lainnya"
  const color = INSTRUMENT_COLORS[slice.type] ?? "#94a3b8"
  const widthPct = Math.max(0, Math.min(100, slice.percentage))

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="text-sm font-medium text-white truncate">{label}</span>
        </div>
        <div className="flex items-baseline gap-3 text-xs text-white/60 tabular-nums shrink-0">
          <span className="hidden sm:inline">{formatLargeRupiah(slice.amount)}</span>
          <span className="text-white font-semibold text-sm">
            {slice.percentage.toFixed(1).replace(".", ",")}%
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden bg-white/5">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${widthPct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

function AllocationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-2.5 rounded-full bg-white/5 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
