"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRight,
  ClipboardCheck,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/utils"
import {
  fetchEndowment,
  fetchPublicStats,
  type EndowmentSummary,
  type PublicStats,
} from "./shared"

/**
 * CFO dashboard. Focused on cash flow + ROI; the CFO approves
 * disbursements but doesn't sit in the portfolio detail like the IM.
 * Hydrates from `/analytics/endowment` (corpus + return + disbursed)
 * and `/analytics/public-stats` (donations total) — same endpoints the
 * landing page already calls.
 */
export function CFODashboard() {
  const [endowment, setEndowment] = useState<EndowmentSummary | null>(null)
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [e, p] = await Promise.all([fetchEndowment(), fetchPublicStats()])
        if (!cancelled) {
          setEndowment(e)
          setStats(p)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat ringkasan")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const balance =
    stats && endowment ? stats.totalDonasi - endowment.totalDisalurkan : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard CFO</h1>
          <p className="text-muted-foreground">
            Arus kas, saldo, dan imbal hasil dana abadi DPBD
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/reports">
            Lihat Laporan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Dana Masuk"
          value={stats ? formatRupiah(stats.totalDonasi) : "—"}
          hint="Donasi 'completed' (sumber: public-stats)"
          icon={ArrowDownToLine}
          tone="emerald"
        />
        <SummaryCard
          label="Total Penyaluran"
          value={endowment ? formatRupiah(endowment.totalDisalurkan) : "—"}
          hint="Disbursement berstatus 'completed'"
          icon={ArrowUpFromLine}
          tone="rose"
        />
        <SummaryCard
          label="Saldo Tersedia"
          value={stats && endowment ? formatRupiah(balance) : "—"}
          hint="Dana masuk dikurangi penyaluran"
          icon={Wallet}
          tone="amber"
        />
        <SummaryCard
          label="Imbal Hasil YTD"
          value={endowment ? formatRupiah(endowment.totalImbalHasil) : "—"}
          hint={
            endowment
              ? `${endowment.returnPercentage >= 0 ? "+" : ""}${endowment.returnPercentage.toFixed(2)}% dari corpus`
              : ""
          }
          icon={TrendingUp}
          tone="blue"
        />
      </div>

      {/* Approval queue placeholder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="w-4 h-4" />
              Antrean Persetujuan Penyaluran
            </CardTitle>
            <CardDescription>Disbursement menunggu approval CFO</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/disbursements">
              Buka Penyaluran
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Endpoint disbursement queue belum tersedia. Buka halaman{" "}
            <Link href="/admin/disbursements" className="underline">
              Penyaluran
            </Link>{" "}
            untuk meninjau pengajuan.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  hint?: string
  icon: typeof Wallet
  tone: "emerald" | "rose" | "amber" | "blue"
}) {
  const toneClasses: Record<typeof tone, string> = {
    emerald: "bg-emerald-500/10 text-emerald-700",
    rose: "bg-rose-500/10 text-rose-700",
    amber: "bg-amber-500/10 text-amber-700",
    blue: "bg-blue-500/10 text-blue-700",
  }
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${toneClasses[tone]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
