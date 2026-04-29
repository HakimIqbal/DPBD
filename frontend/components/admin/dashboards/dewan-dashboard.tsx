"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2, ShieldCheck, Sprout, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/utils"
import {
  fetchEndowment,
  fetchPublicStats,
  type EndowmentSummary,
  type PublicStats,
} from "./shared"

/**
 * Dewan Pembina + Dewan Pengawas dashboard. High-level governance
 * view: corpus health, return, active programs. Deliberately spartan —
 * detailed cuts route through the Laporan page or the CFO.
 */
export function DewanDashboard({ role }: { role: "dewan_pembina" | "dewan_pengawas" }) {
  const [summary, setSummary] = useState<EndowmentSummary | null>(null)
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [e, p] = await Promise.all([fetchEndowment(), fetchPublicStats()])
        if (!cancelled) {
          setSummary(e)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // "Dana Aman" indicator: ratio of total invested (currentValue) vs corpus.
  // ≥100% means current value covers principal; below means unrealized loss.
  const safetyPct = summary && summary.totalCorpus > 0
    ? (summary.totalCurrentValue / summary.totalCorpus) * 100
    : 0
  const isSafe = safetyPct >= 100

  const roleLabel =
    role === "dewan_pembina" ? "Dewan Pembina" : "Dewan Pengawas"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard {roleLabel}</h1>
          <p className="text-muted-foreground">
            Ringkasan tingkat tinggi dana abadi DPBD
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

      {/* 3 high-level cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tabular-nums">
                {summary ? formatRupiah(summary.totalCorpus) : "—"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Total Dana Abadi</p>
              <p className="text-xs text-muted-foreground mt-2">Pokok yang dikelola</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tabular-nums">
                {summary ? formatRupiah(summary.totalImbalHasil) : "—"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Imbal Hasil Tahun Ini</p>
              <p className="text-xs text-muted-foreground mt-2">
                {summary
                  ? `${summary.returnPercentage >= 0 ? "+" : ""}${summary.returnPercentage.toFixed(2)}% dari corpus`
                  : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700">
                <Sprout className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tabular-nums">
                {stats?.totalProgram ?? 0}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Program Aktif</p>
              <p className="text-xs text-muted-foreground mt-2">Sedang berjalan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dana Aman indicator */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">Indikator Dana Aman</p>
              <p className="text-xs text-muted-foreground">
                Nilai pasar saat ini dibanding pokok dana
              </p>
            </div>
            <Badge
              className={
                isSafe
                  ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 border-0"
                  : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/10 border-0"
              }
            >
              {isSafe ? "Dana Aman" : "Perlu Perhatian"}
            </Badge>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${isSafe ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(safetyPct, 100).toFixed(0)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>
              {summary ? formatRupiah(summary.totalCurrentValue) : "—"} dari{" "}
              {summary ? formatRupiah(summary.totalCorpus) : "—"}
            </span>
            <span className="tabular-nums">{safetyPct.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        Untuk laporan lengkap, hubungi CFO atau lihat halaman{" "}
        <Link href="/admin/reports" className="underline font-medium">
          Laporan
        </Link>
        .
      </div>
    </div>
  )
}
