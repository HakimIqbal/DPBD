"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchActiveAlerts, type RiskAlert } from "./shared"

type OverallStatus = "AMAN" | "PERHATIAN" | "KRITIS"

function computeOverallStatus(alerts: RiskAlert[]): OverallStatus {
  if (alerts.some((a) => a.severity === "critical")) return "KRITIS"
  if (alerts.some((a) => a.severity === "warning")) return "PERHATIAN"
  return "AMAN"
}

const STATUS_BADGE: Record<OverallStatus, string> = {
  AMAN: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0",
  PERHATIAN: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-0",
  KRITIS: "bg-red-100 text-red-800 hover:bg-red-100 border-0",
}

const STATUS_HINT: Record<OverallStatus, string> = {
  AMAN: "Tidak ada alert aktif — portofolio dalam batas threshold",
  PERHATIAN: "Ada warning yang belum diselesaikan",
  KRITIS: "Ada breach kritis — buka halaman Risk untuk detail",
}

/**
 * Risk Manager dashboard. Light-weight summary that funnels users
 * straight into /admin/risk where the actual work happens.
 */
export function RiskManagerDashboard() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const a = await fetchActiveAlerts()
        if (!cancelled) setAlerts(a.data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat alert")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const status = useMemo(() => computeOverallStatus(alerts), [alerts])
  const StatusIcon = status === "AMAN" ? ShieldCheck : status === "PERHATIAN" ? AlertTriangle : ShieldAlert

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
          <h1 className="text-2xl font-bold">Dashboard Risk Manager</h1>
          <p className="text-muted-foreground">
            Status risiko portofolio dan alert aktif
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/risk">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Buka Risk & Compliance
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground">Status Risiko Keseluruhan</p>
              <StatusIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <Badge className={`text-base px-3 py-1 ${STATUS_BADGE[status]}`}>
              {status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-3">{STATUS_HINT[status]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground">Alert Aktif</p>
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold tabular-nums">{alerts.length}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Belum diselesaikan
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/admin/risk">
                Tinjau Alert
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left bg-muted/30">
                    <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Severity</th>
                    <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Pesan</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.slice(0, 5).map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="py-3 px-3">
                        <Badge
                          className={
                            a.severity === "critical"
                              ? "bg-red-100 text-red-700 hover:bg-red-100 border-0"
                              : a.severity === "warning"
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"
                          }
                        >
                          {a.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground line-clamp-1">{a.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
