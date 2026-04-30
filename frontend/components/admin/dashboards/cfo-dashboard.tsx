"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRight,
  Check,
  ClipboardCheck,
  Loader2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatRupiah } from "@/lib/utils"
import {
  approveDisbursement,
  fetchEndowment,
  fetchPendingDisbursements,
  fetchPublicStats,
  rejectDisbursement,
  type EndowmentSummary,
  type PendingDisbursement,
  type PublicStats,
} from "./shared"

/**
 * CFO dashboard. Cash flow + ROI on top, then the live approval queue.
 * Hydrates from /analytics/endowment + /analytics/public-stats (same
 * endpoints the landing hero uses) + /disbursements/pending.
 */
export function CFODashboard() {
  const { toast } = useToast()

  const [endowment, setEndowment] = useState<EndowmentSummary | null>(null)
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [pending, setPending] = useState<PendingDisbursement[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [rejectTarget, setRejectTarget] = useState<PendingDisbursement | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [acting, setActing] = useState<string | null>(null) // id currently being approved/rejected

  const refreshAll = useCallback(async () => {
    setError(null)
    const [e, p, q] = await Promise.allSettled([
      fetchEndowment(),
      fetchPublicStats(),
      fetchPendingDisbursements(),
    ])
    if (e.status === "fulfilled") setEndowment(e.value)
    if (p.status === "fulfilled") setStats(p.value)
    if (q.status === "fulfilled") setPending(q.value)
    // If queue fetch failed (e.g. 401 because token expired), surface
    // it — but don't blank the corpus cards if those still loaded.
    const failures = [e, p, q].filter((r) => r.status === "rejected")
    if (failures.length > 0) {
      const reason = failures
        .map((f) => (f as PromiseRejectedResult).reason)
        .map((r) => (r instanceof Error ? r.message : String(r)))
        .join("; ")
      setError(reason)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refreshAll()
      } catch {
        // refreshAll already routes errors into state
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshAll])

  const balance =
    stats && endowment ? stats.totalDonasi - endowment.totalDisalurkan : 0

  async function handleApprove(d: PendingDisbursement) {
    setActing(d.id)
    try {
      await approveDisbursement(d.id)
      // Optimistic local removal — beats a full refetch round-trip.
      setPending((prev) => (prev ?? []).filter((x) => x.id !== d.id))
      toast({
        title: "Penyaluran disetujui",
        description: `${d.programName} — ${formatRupiah(d.amount)}`,
      })
    } catch (e) {
      toast({
        title: "Gagal menyetujui",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setActing(null)
    }
  }

  function openReject(d: PendingDisbursement) {
    setRejectTarget(d)
    setRejectReason("")
  }

  async function handleReject() {
    if (!rejectTarget) return
    if (rejectReason.trim().length === 0) {
      toast({
        title: "Alasan wajib diisi",
        description: "Masukkan alasan penolakan sebelum melanjutkan.",
        variant: "destructive",
      })
      return
    }
    const target = rejectTarget
    setActing(target.id)
    try {
      await rejectDisbursement(target.id, rejectReason.trim())
      setPending((prev) => (prev ?? []).filter((x) => x.id !== target.id))
      toast({
        title: "Penyaluran ditolak",
        description: `${target.programName} — ${formatRupiah(target.amount)}`,
      })
      setRejectTarget(null)
      setRejectReason("")
    } catch (e) {
      toast({
        title: "Gagal menolak",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingCount = pending?.length ?? 0

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

      {/* Approval queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base flex-wrap">
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              Antrean Persetujuan Penyaluran
              {pendingCount > 0 && (
                <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/10 border-0 ml-1">
                  {pendingCount} menunggu
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Pengajuan dari Finance — review dan setujui atau tolak</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/admin/disbursements">
              Buka Halaman Lengkap
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {pending === null ? (
            // null = fetch failed (error already shown above)
            <div className="px-6 pb-6 text-sm text-muted-foreground">
              Tidak dapat memuat antrean.
            </div>
          ) : pending.length === 0 ? (
            <div className="px-6 pb-8 pt-2 text-center text-sm text-emerald-700">
              Tidak ada pengajuan pending — antrean kosong ✓
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left bg-muted/30">
                    <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Program</th>
                    <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">Jumlah</th>
                    <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Diajukan Oleh</th>
                    <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
                    <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((d) => {
                    const dt = d.requestedAt ?? d.createdAt
                    const isActing = acting === d.id
                    return (
                      <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20 align-top">
                        <td className="py-3 px-3">
                          <div className="font-medium">{d.programName}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                            {d.recipient}
                          </div>
                          {d.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-md mt-0.5">
                              {d.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-medium whitespace-nowrap">
                          {formatRupiah(d.amount)}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {d.requestedByName ?? d.requestedByEmail ?? "—"}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                          {new Date(dt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-700 hover:bg-emerald-50"
                              disabled={isActing}
                              onClick={() => handleApprove(d)}
                            >
                              {isActing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5 mr-1" />
                              )}
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-red-50"
                              disabled={isActing}
                              onClick={() => openReject(d)}
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Tolak
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null)
            setRejectReason("")
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak pengajuan?</DialogTitle>
            <DialogDescription>
              {rejectTarget && (
                <>
                  {rejectTarget.programName} — {formatRupiah(rejectTarget.amount)}
                  <br />
                  Penolakan akan tercatat di audit trail. Alasan dikirim ke Finance.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Alasan penolakan</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Misal: Anggaran kuartal ini sudah terpakai. Ajukan ulang setelah 1 Juli."
              rows={4}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null)
                setRejectReason("")
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={acting !== null || rejectReason.trim().length === 0}
            >
              {acting !== null && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tolak Pengajuan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
