"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PermissionGate } from "@/components/ui/permission-gate"
import { AccessDenied } from "@/components/admin/access-denied"
import { Permission } from "@/lib/permissions"
import { usePermission } from "@/hooks/use-permission"
import { useToast } from "@/hooks/use-toast"
import { formatRupiah } from "@/lib/utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// ---- Types ---------------------------------------------------------------

type RiskOperator = "greater_than" | "less_than" | "equals"
type RiskSeverity = "info" | "warning" | "critical"

/**
 * Metric keys must match `RISK_METRIC_KEYS` in
 * backend/src/risk/risk-metrics.ts. Sending an unregistered key would be
 * rejected by the DTO's @IsIn() at the boundary.
 */
type MetricKey =
  | "reksa_dana_percentage"
  | "sukuk_percentage"
  | "deposito_syariah_percentage"
  | "saham_syariah_percentage"
  | "single_instrument_percentage"
  | "total_exposure_idr"
  | "active_instruments"

interface RiskThreshold {
  id: string
  name: string
  metricKey: string
  operator: RiskOperator
  thresholdValue: string
  severity: RiskSeverity
  isActive: boolean
  description: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

interface RiskAlert {
  id: string
  thresholdId: string
  triggeredValue: string
  message: string
  severity: RiskSeverity
  isResolved: boolean
  resolvedAt: string | null
  resolvedBy: string | null
  createdAt: string
}

interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface EvaluationResult {
  evaluatedThresholds: number
  triggeredAlerts: RiskAlert[]
}

// ---- Static maps ---------------------------------------------------------

const METRIC_OPTIONS: { value: MetricKey; label: string; unit: string }[] = [
  { value: "sukuk_percentage", label: "Konsentrasi Sukuk (%)", unit: "%" },
  { value: "reksa_dana_percentage", label: "Konsentrasi Reksa Dana (%)", unit: "%" },
  { value: "deposito_syariah_percentage", label: "Konsentrasi Deposito Syariah (%)", unit: "%" },
  { value: "saham_syariah_percentage", label: "Konsentrasi Saham Syariah (%)", unit: "%" },
  { value: "single_instrument_percentage", label: "Konsentrasi Instrumen Tunggal (%)", unit: "%" },
  { value: "total_exposure_idr", label: "Total Eksposur (IDR)", unit: "IDR" },
  { value: "active_instruments", label: "Jumlah Instrumen Aktif", unit: "instrumen" },
]

const METRIC_LABEL: Record<string, string> = Object.fromEntries(
  METRIC_OPTIONS.map((o) => [o.value, o.label]),
)

const METRIC_UNIT: Record<string, string> = Object.fromEntries(
  METRIC_OPTIONS.map((o) => [o.value, o.unit]),
)

const OPERATOR_OPTIONS: { value: RiskOperator; label: string; symbol: string }[] = [
  { value: "greater_than", label: "Lebih dari", symbol: ">" },
  { value: "less_than", label: "Kurang dari", symbol: "<" },
  { value: "equals", label: "Sama dengan", symbol: "=" },
]

const OPERATOR_SYMBOL: Record<RiskOperator, string> = {
  greater_than: ">",
  less_than: "<",
  equals: "=",
}

const SEVERITY_OPTIONS: { value: RiskSeverity; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Peringatan" },
  { value: "critical", label: "Kritis" },
]

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  info: "Info",
  warning: "Peringatan",
  critical: "Kritis",
}

const SEVERITY_BADGE_CLASS: Record<RiskSeverity, string> = {
  info: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-0",
  warning: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0",
  critical: "bg-red-100 text-red-700 hover:bg-red-100 border-0",
}

// ---- Helpers -------------------------------------------------------------

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("dpbd_token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

async function readApiError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}))
  if (typeof body === "object" && body !== null && "message" in body) {
    const m = (body as { message: unknown }).message
    if (Array.isArray(m)) {
      return m
        .map((e: unknown) => {
          if (typeof e === "object" && e !== null && "message" in e) {
            return String((e as { message: unknown }).message)
          }
          return String(e)
        })
        .join(", ")
    }
    return String(m)
  }
  return `HTTP ${res.status}`
}

function toNumber(v: string | null | undefined): number {
  if (v === null || v === undefined) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function formatThresholdValue(metricKey: string, value: string | number): string {
  const n = typeof value === "number" ? value : toNumber(value)
  if (metricKey === "total_exposure_idr") return formatRupiah(n)
  if (metricKey === "active_instruments") return `${n.toFixed(0)} instrumen`
  return `${n.toFixed(2)}%`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ---- API helpers ---------------------------------------------------------

async function evaluateRisk(): Promise<EvaluationResult> {
  const res = await fetch(`${API_BASE_URL}/risk/evaluate`, {
    method: "POST",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as EvaluationResult
}

async function fetchAlerts(isResolved?: boolean): Promise<Paginated<RiskAlert>> {
  const params = new URLSearchParams()
  if (isResolved !== undefined) params.set("isResolved", String(isResolved))
  params.set("limit", "200")
  const res = await fetch(`${API_BASE_URL}/risk/alerts?${params.toString()}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as Paginated<RiskAlert>
}

async function fetchThresholds(): Promise<Paginated<RiskThreshold>> {
  const params = new URLSearchParams({ limit: "200" })
  const res = await fetch(`${API_BASE_URL}/risk/thresholds?${params.toString()}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as Paginated<RiskThreshold>
}

async function postThreshold(payload: Record<string, unknown>): Promise<RiskThreshold> {
  const res = await fetch(`${API_BASE_URL}/risk/thresholds`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as RiskThreshold
}

async function patchThreshold(
  id: string,
  payload: Record<string, unknown>,
): Promise<RiskThreshold> {
  const res = await fetch(`${API_BASE_URL}/risk/thresholds/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as RiskThreshold
}

async function deleteThresholdReq(id: string): Promise<RiskThreshold> {
  const res = await fetch(`${API_BASE_URL}/risk/thresholds/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as RiskThreshold
}

async function resolveAlertReq(id: string): Promise<RiskAlert> {
  const res = await fetch(`${API_BASE_URL}/risk/alerts/${id}/resolve`, {
    method: "PATCH",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as RiskAlert
}

// ---- Form schema ---------------------------------------------------------

const METRIC_VALUES = METRIC_OPTIONS.map((o) => o.value) as [MetricKey, ...MetricKey[]]
const OPERATOR_VALUES: [RiskOperator, ...RiskOperator[]] = [
  "greater_than",
  "less_than",
  "equals",
]
const SEVERITY_VALUES: [RiskSeverity, ...RiskSeverity[]] = ["info", "warning", "critical"]

const thresholdSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  metricKey: z.enum(METRIC_VALUES, { message: "Pilih metrik" }),
  operator: z.enum(OPERATOR_VALUES, { message: "Pilih operator" }),
  thresholdValue: z.coerce
    .number({ message: "Nilai harus berupa angka" })
    .min(0, "Nilai tidak boleh negatif")
    .max(1e15, "Nilai terlalu besar"),
  severity: z.enum(SEVERITY_VALUES, { message: "Pilih tingkat keparahan" }),
  description: z.string().max(2000).optional().or(z.literal("")),
})

type ThresholdFormValues = z.infer<typeof thresholdSchema>

// ==========================================================================
// Page
// ==========================================================================

export default function RiskPage() {
  return (
    <PermissionGate require={Permission.READ_RISK} fallback={<AccessDenied />}>
      <RiskPageContent />
    </PermissionGate>
  )
}

function RiskPageContent() {
  const { toast } = useToast()
  const canWrite = usePermission(Permission.WRITE_RISK)

  const [thresholds, setThresholds] = useState<RiskThreshold[]>([])
  const [activeAlerts, setActiveAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [evaluating, setEvaluating] = useState(false)

  const [dialogState, setDialogState] = useState<
    { mode: "create" } | { mode: "edit"; threshold: RiskThreshold } | null
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<RiskThreshold | null>(null)

  const refresh = useCallback(async (alsoEvaluate: boolean) => {
    setError(null)
    try {
      if (alsoEvaluate) {
        // Evaluate first so the alerts list reflects the latest portfolio
        // snapshot. Each call appends — caller decides cadence.
        await evaluateRisk()
      }
      const [alertsRes, thresholdsRes] = await Promise.all([
        fetchAlerts(false),
        fetchThresholds(),
      ])
      setActiveAlerts(alertsRes.data)
      setThresholds(thresholdsRes.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data risiko")
      throw e
    }
  }, [])

  // Initial load: evaluate once (write-permission only — POST /risk/evaluate
  // requires WRITE_RISK on the backend) then fetch alerts + thresholds.
  // Read-only viewers (CFO, audit_independent, etc.) just see the existing
  // persisted alerts.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await refresh(canWrite)
      } catch {
        // surfaced via state below
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refresh, canWrite])

  async function handleManualEvaluate() {
    if (!canWrite) return
    setEvaluating(true)
    try {
      const result = await evaluateRisk()
      const alertsRes = await fetchAlerts(false)
      setActiveAlerts(alertsRes.data)
      toast({
        title: "Evaluasi selesai",
        description:
          result.triggeredAlerts.length > 0
            ? `${result.triggeredAlerts.length} alert baru dari ${result.evaluatedThresholds} threshold aktif`
            : `Tidak ada breach dari ${result.evaluatedThresholds} threshold aktif`,
      })
    } catch (e) {
      toast({
        title: "Evaluasi gagal",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setEvaluating(false)
    }
  }

  async function handleResolveAlert(alert: RiskAlert) {
    if (!canWrite) return
    try {
      await resolveAlertReq(alert.id)
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alert.id))
      toast({ title: "Alert ditandai selesai", description: alert.message.slice(0, 80) })
    } catch (e) {
      toast({
        title: "Gagal menandai alert",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  async function handleToggleActive(threshold: RiskThreshold, nextActive: boolean) {
    if (!canWrite) return
    try {
      const updated = await patchThreshold(threshold.id, { isActive: nextActive })
      setThresholds((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      toast({
        title: nextActive ? "Threshold diaktifkan" : "Threshold dinonaktifkan",
        description: threshold.name,
      })
    } catch (e) {
      toast({
        title: "Gagal mengubah status",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget || !canWrite) return
    try {
      const deleted = await deleteThresholdReq(deleteTarget.id)
      // Soft delete: replace in place so user sees status flip rather than row vanish.
      setThresholds((prev) => prev.map((t) => (t.id === deleted.id ? deleted : t)))
      toast({ title: "Threshold dinonaktifkan", description: deleteTarget.name })
    } catch (e) {
      toast({
        title: "Gagal menghapus",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleSaved() {
    setDialogState(null)
    try {
      const thresholdsRes = await fetchThresholds()
      setThresholds(thresholdsRes.data)
    } catch (e) {
      toast({
        title: "Gagal memuat ulang threshold",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const overallStatus = useMemo(() => computeOverallStatus(activeAlerts), [activeAlerts])
  const activeThresholdCount = useMemo(
    () => thresholds.filter((t) => t.isActive).length,
    [thresholds],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data risiko...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            Risk & Compliance
          </h1>
          <p className="text-muted-foreground">
            Monitoring eksposur portofolio dan threshold alert
          </p>
        </div>
        {canWrite && (
          <Button
            variant="outline"
            onClick={handleManualEvaluate}
            disabled={evaluating}
          >
            {evaluating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Jalankan Evaluasi
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* SECTION 1 — Overview */}
      <OverviewCards
        overallStatus={overallStatus}
        activeAlertsCount={activeAlerts.length}
        activeThresholdCount={activeThresholdCount}
      />

      {/* SECTION 2 — Active alerts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Alert Aktif</h2>
          <p className="text-sm text-muted-foreground">{activeAlerts.length} belum diselesaikan</p>
        </div>
        <AlertsTable
          alerts={activeAlerts}
          canWrite={canWrite}
          thresholdsById={thresholds}
          onResolve={handleResolveAlert}
        />
      </section>

      {/* SECTION 3 — Thresholds */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Threshold</h2>
          {canWrite && (
            <Button onClick={() => setDialogState({ mode: "create" })}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Threshold
            </Button>
          )}
        </div>
        <ThresholdsTable
          thresholds={thresholds}
          canWrite={canWrite}
          onToggleActive={handleToggleActive}
          onEdit={(t) => setDialogState({ mode: "edit", threshold: t })}
          onDelete={(t) => setDeleteTarget(t)}
        />
      </section>

      {/* SECTION 4 — Create / Edit modal */}
      <ThresholdDialog
        state={dialogState}
        onClose={() => setDialogState(null)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Nonaktifkan threshold?"
        description={
          deleteTarget
            ? `Threshold "${deleteTarget.name}" akan dinonaktifkan. Riwayat alert tetap tersimpan.`
            : ""
        }
        confirmText="Ya, Nonaktifkan"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  )
}

// ==========================================================================
// Section 1 — Overview cards
// ==========================================================================

type OverallStatus = "AMAN" | "PERHATIAN" | "KRITIS"

function computeOverallStatus(alerts: RiskAlert[]): OverallStatus {
  if (alerts.some((a) => a.severity === "critical")) return "KRITIS"
  if (alerts.some((a) => a.severity === "warning")) return "PERHATIAN"
  return "AMAN"
}

const STATUS_BADGE_CLASS: Record<OverallStatus, string> = {
  AMAN: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0",
  PERHATIAN: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-0",
  KRITIS: "bg-red-100 text-red-800 hover:bg-red-100 border-0",
}

const STATUS_ICON: Record<OverallStatus, typeof ShieldCheck> = {
  AMAN: ShieldCheck,
  PERHATIAN: AlertTriangle,
  KRITIS: ShieldAlert,
}

function OverviewCards({
  overallStatus,
  activeAlertsCount,
  activeThresholdCount,
}: {
  overallStatus: OverallStatus
  activeAlertsCount: number
  activeThresholdCount: number
}) {
  const StatusIcon = STATUS_ICON[overallStatus]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Status Risiko Keseluruhan</p>
            <StatusIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <Badge className={`text-base px-3 py-1 ${STATUS_BADGE_CLASS[overallStatus]}`}>
            {overallStatus}
          </Badge>
          <p className="text-xs text-muted-foreground mt-3">
            Berdasarkan severity tertinggi dari alert aktif
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Alert Aktif</p>
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{activeAlertsCount}</p>
          <p className="text-xs text-muted-foreground mt-3">Alert belum diselesaikan</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Threshold Aktif</p>
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{activeThresholdCount}</p>
          <p className="text-xs text-muted-foreground mt-3">Rule monitoring yang berjalan</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================================================
// Section 2 — Alerts table
// ==========================================================================

function AlertsTable({
  alerts,
  canWrite,
  thresholdsById,
  onResolve,
}: {
  alerts: RiskAlert[]
  canWrite: boolean
  thresholdsById: RiskThreshold[]
  onResolve: (a: RiskAlert) => void
}) {
  const tIndex = useMemo(
    () => new Map(thresholdsById.map((t) => [t.id, t] as const)),
    [thresholdsById],
  )

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-700" />
          </div>
          <p className="font-medium text-emerald-900">
            Tidak ada alert aktif — portofolio dalam kondisi aman ✓
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left bg-muted/30">
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Waktu</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Threshold</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Nilai Aktual</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Severity</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const t = tIndex.get(alert.thresholdId)
                const metricKey = t?.metricKey ?? ""
                return (
                  <tr key={alert.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-3 px-3 whitespace-nowrap text-muted-foreground">
                      {formatDateTime(alert.createdAt)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium">{t?.name ?? "(threshold dihapus)"}</div>
                      {t && (
                        <div className="text-xs text-muted-foreground">
                          {METRIC_LABEL[metricKey] ?? metricKey} {OPERATOR_SYMBOL[t.operator]}{" "}
                          {formatThresholdValue(metricKey, t.thresholdValue)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      {formatThresholdValue(metricKey, alert.triggeredValue)}
                    </td>
                    <td className="py-3 px-3">
                      <Badge className={SEVERITY_BADGE_CLASS[alert.severity]}>
                        {SEVERITY_LABEL[alert.severity]}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {canWrite ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onResolve(alert)}
                        >
                          Tandai Selesai
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================================================
// Section 3 — Thresholds table
// ==========================================================================

function ThresholdsTable({
  thresholds,
  canWrite,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  thresholds: RiskThreshold[]
  canWrite: boolean
  onToggleActive: (t: RiskThreshold, next: boolean) => void
  onEdit: (t: RiskThreshold) => void
  onDelete: (t: RiskThreshold) => void
}) {
  if (thresholds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-medium">Belum ada threshold</p>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Tambahkan threshold pertama untuk mulai memantau eksposur portofolio.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left bg-muted/30">
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Nama</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Metrik</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Operator</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Nilai</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Severity</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {thresholds.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="py-3 px-3">
                    <div className="font-medium">{t.name}</div>
                    {t.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {METRIC_LABEL[t.metricKey] ?? t.metricKey}
                  </td>
                  <td className="py-3 px-3 font-mono">{OPERATOR_SYMBOL[t.operator]}</td>
                  <td className="py-3 px-3 font-mono tabular-nums">
                    {formatThresholdValue(t.metricKey, t.thresholdValue)}
                  </td>
                  <td className="py-3 px-3">
                    <Badge className={SEVERITY_BADGE_CLASS[t.severity]}>
                      {SEVERITY_LABEL[t.severity]}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <Switch
                      checked={t.isActive}
                      disabled={!canWrite}
                      onCheckedChange={(next) => onToggleActive(t, next)}
                      aria-label={`Aktifkan ${t.name}`}
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    {canWrite ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(t)}
                          aria-label={`Edit ${t.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => onDelete(t)}
                          aria-label={`Nonaktifkan ${t.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================================================
// Section 4 — Create modal
// ==========================================================================

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; threshold: RiskThreshold }
  | null

function ThresholdDialog({
  state,
  onClose,
  onSaved,
}: {
  state: DialogState
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const isOpen = state !== null
  const isEdit = state?.mode === "edit"
  const editing = state?.mode === "edit" ? state.threshold : null

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ThresholdFormValues>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: {
      name: "",
      metricKey: undefined,
      operator: undefined,
      thresholdValue: undefined,
      severity: undefined,
      description: "",
    },
  })

  // Refill the form whenever we transition into a new dialog state. On
  // close (state === null) we leave the form alone — Dialog unmounts the
  // body, so RHF state is gone the next time the dialog opens anyway.
  useEffect(() => {
    if (!state) return
    if (state.mode === "edit") {
      reset({
        name: state.threshold.name,
        metricKey: state.threshold.metricKey as MetricKey,
        operator: state.threshold.operator,
        thresholdValue: toNumber(state.threshold.thresholdValue),
        severity: state.threshold.severity,
        description: state.threshold.description ?? "",
      })
    } else {
      reset({
        name: "",
        metricKey: undefined,
        operator: undefined,
        thresholdValue: undefined,
        severity: undefined,
        description: "",
      })
    }
  }, [state, reset])

  const watchMetric = watch("metricKey")
  const unitHint = watchMetric ? METRIC_UNIT[watchMetric] : ""

  async function onSubmit(values: ThresholdFormValues) {
    try {
      const payload: Record<string, unknown> = {
        name: values.name,
        metricKey: values.metricKey,
        operator: values.operator,
        thresholdValue: values.thresholdValue,
        severity: values.severity,
      }
      if (values.description && values.description.length > 0) {
        payload.description = values.description
      } else if (isEdit) {
        // Allow editing to clear description by sending empty string explicitly.
        payload.description = ""
      }

      if (editing) {
        await patchThreshold(editing.id, payload)
        toast({ title: "Threshold diperbarui", description: values.name })
      } else {
        await postThreshold(payload)
        toast({ title: "Threshold dibuat", description: values.name })
      }
      onSaved()
    } catch (e) {
      toast({
        title: isEdit ? "Gagal memperbarui threshold" : "Gagal membuat threshold",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Threshold" : "Tambah Threshold"}</DialogTitle>
          <DialogDescription>
            Atur metrik portofolio dan ambang batas yang akan memicu alert.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Threshold</Label>
            <Input
              id="name"
              placeholder="Misal: Konsentrasi Sukuk"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Metrik</Label>
            <Controller
              control={control}
              name="metricKey"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metrik" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.metricKey && (
              <p className="text-xs text-destructive">{errors.metricKey.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Operator</Label>
              <Controller
                control={control}
                name="operator"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATOR_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label} ({o.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.operator && (
                <p className="text-xs text-destructive">{errors.operator.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="thresholdValue">
                Nilai {unitHint && <span className="text-muted-foreground">({unitHint})</span>}
              </Label>
              <Input
                id="thresholdValue"
                type="number"
                step="any"
                min="0"
                placeholder="0"
                {...register("thresholdValue")}
              />
              {errors.thresholdValue && (
                <p className="text-xs text-destructive">{errors.thresholdValue.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tingkat Keparahan</Label>
            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.severity && (
              <p className="text-xs text-destructive">{errors.severity.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Textarea
              id="description"
              placeholder="Konteks singkat: kapan rule ini relevan, kenapa angkanya segini..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
