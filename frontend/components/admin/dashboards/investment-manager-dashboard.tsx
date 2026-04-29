"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import {
  ArrowRight,
  Briefcase,
  Loader2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/utils"
import {
  TYPE_COLORS,
  TYPE_LABELS,
  fetchEndowment,
  fetchRecentInvestmentTransactions,
  transactionLabel,
  type EndowmentSummary,
  type InvestmentTransaction,
} from "./shared"

/**
 * Investment Manager dashboard. Portfolio-centric: corpus, current
 * value, return, allocation. Aimed at the user who actually rebalances.
 */
export function InvestmentManagerDashboard() {
  const [summary, setSummary] = useState<EndowmentSummary | null>(null)
  const [recent, setRecent] = useState<InvestmentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [s, t] = await Promise.all([
          fetchEndowment(),
          fetchRecentInvestmentTransactions(5),
        ])
        if (!cancelled) {
          setSummary(s)
          setRecent(t)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat data portofolio")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const allocationChart = useMemo(
    () =>
      (summary?.allocationByType ?? []).map((a) => ({
        name: TYPE_LABELS[a.type] ?? a.type,
        value: a.amount,
        percentage: a.percentage,
        color: TYPE_COLORS[a.type] ?? "#999",
      })),
    [summary],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isPositive = (summary?.returnPercentage ?? 0) >= 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Investment Manager</h1>
          <p className="text-muted-foreground">
            Posisi portofolio dan transaksi terbaru dana abadi
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/portfolio">
            <Briefcase className="w-4 h-4 mr-2" />
            Buka Portfolio Investasi
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
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Corpus</p>
            <p className="text-2xl font-bold mt-2 tabular-nums">
              {summary ? formatRupiah(summary.totalCorpus) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Pokok investasi terkumpul</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Nilai Sekarang</p>
            <p className="text-2xl font-bold mt-2 tabular-nums">
              {summary ? formatRupiah(summary.totalCurrentValue) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Mark-to-market saat ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Imbal Hasil</p>
            <p className="text-2xl font-bold mt-2 tabular-nums">
              {summary ? formatRupiah(summary.totalImbalHasil) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Realisasi + unrealized</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Return %</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-bold tabular-nums">
                {summary
                  ? `${isPositive ? "+" : ""}${summary.returnPercentage.toFixed(2)}%`
                  : "—"}
              </p>
              {summary && (
                <Badge
                  className={
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 border-0"
                      : "bg-red-500/10 text-red-700 hover:bg-red-500/10 border-0"
                  }
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {isPositive ? "Untung" : "Rugi"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Terhadap pokok awal</p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alokasi Portofolio</CardTitle>
            <CardDescription>Distribusi nilai per kelas instrumen</CardDescription>
          </CardHeader>
          <CardContent>
            {allocationChart.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Belum ada data alokasi.
              </div>
            ) : (
              <>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationChart.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(_v: number, _n: string, props) => {
                          const p = (props as unknown as { payload?: { percentage?: number } }).payload
                          const pct = p?.percentage ?? 0
                          return [`${pct.toFixed(2)}%`, "Persentase"]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {allocationChart.map((a) => (
                    <div key={a.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                      <span className="text-muted-foreground">{a.name}</span>
                      <span className="font-medium ml-auto tabular-nums">
                        {a.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="w-4 h-4" />
                Transaksi Investasi Terbaru
              </CardTitle>
              <CardDescription>5 transaksi terakhir lintas portofolio</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/portfolio">
                Lihat Semua
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Belum ada transaksi tercatat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left bg-muted/30">
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Jenis</th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">Jumlah</th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="py-3 px-3 whitespace-nowrap text-muted-foreground">
                          {tx.transactionDate}
                        </td>
                        <td className="py-3 px-3">{transactionLabel(tx.transactionType)}</td>
                        <td className="py-3 px-3 text-right tabular-nums font-medium">
                          {formatRupiah(tx.amount)}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground line-clamp-1 max-w-md">
                          {tx.notes ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
