"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, ChevronRight, History, Loader2, Search, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PermissionGate } from "@/components/ui/permission-gate"
import { AccessDenied } from "@/components/admin/access-denied"
import { Permission } from "@/lib/permissions"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
const PAGE_SIZE = 50

interface AuditLog {
  id: string
  actorId: string | null
  actorRole: string | null
  actorEmail: string | null
  action: string
  entityType: string
  entityId: string | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface PaginatedAuditLogs {
  data: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const ACTION_OPTIONS = [
  "USER_CREATED",
  "DONATION_APPROVED",
  "DONATION_REJECTED",
  "DONATION_REFUNDED",
  "DONATION_STATUS_CHANGED",
  "USER_STATUS_CHANGED",
  "USER_DELETED",
  "TRANSACTION_FLAGGED",
  "INVESTMENT_CREATED",
  "INVESTMENT_UPDATED",
] as const

const ENTITY_TYPE_OPTIONS = ["User", "Donation", "Investment", "Program"] as const

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  editor: "bg-green-100 text-green-800",
  finance: "bg-yellow-100 text-yellow-800",
  ceo: "bg-amber-100 text-amber-800",
  cfo: "bg-amber-100 text-amber-800",
  investment_manager: "bg-teal-100 text-teal-800",
  risk_manager: "bg-orange-100 text-orange-800",
  ethic_committee: "bg-rose-100 text-rose-800",
  audit_independent: "bg-slate-100 text-slate-800",
  dewan_pengawas: "bg-indigo-100 text-indigo-800",
  dewan_pembina: "bg-indigo-100 text-indigo-800",
  partnership_onboarding: "bg-cyan-100 text-cyan-800",
  personal: "bg-blue-100 text-blue-800",
  company: "bg-purple-100 text-purple-800",
}

/** Map an action verb to a Tailwind badge class by suffix. */
function actionBadgeClass(action: string): string {
  if (/_CREATED$|_APPROVED$/.test(action)) return "bg-emerald-100 text-emerald-800"
  if (/_REJECTED$|_DELETED$/.test(action)) return "bg-red-100 text-red-800"
  if (/_REFUNDED$|_FLAGGED$/.test(action)) return "bg-amber-100 text-amber-800"
  if (/_CHANGED$|_UPDATED$/.test(action)) return "bg-blue-100 text-blue-800"
  return "bg-slate-100 text-slate-800"
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function truncate(value: string, length: number): string {
  return value.length <= length ? value : value.slice(0, length) + "…"
}

/**
 * Authenticated GET against the backend, reading the same `dpbd_token`
 * key used by auth-context. Mirrors the helper in /admin/users — once the
 * shared `lib/api.ts` is reviewed end-to-end we can switch to it.
 */
async function fetchAuditLogs(query: URLSearchParams): Promise<PaginatedAuditLogs> {
  const token = typeof window !== "undefined" ? localStorage.getItem("dpbd_token") : null
  const res = await fetch(`${API_BASE_URL}/audit/logs?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `HTTP ${res.status}`
    throw new Error(message)
  }
  return (await res.json()) as PaginatedAuditLogs
}

interface FilterState {
  action: string // 'all' or one of ACTION_OPTIONS
  entityType: string // 'all' or one of ENTITY_TYPE_OPTIONS
  startDate: string // YYYY-MM-DD or ''
  endDate: string // YYYY-MM-DD or ''
}

const INITIAL_FILTERS: FilterState = {
  action: "all",
  entityType: "all",
  startDate: "",
  endDate: "",
}

export default function AuditTrailPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  // Email field: raw (immediate) and debounced. Only the debounced value
  // feeds into the fetch so we don't slam the API on every keystroke.
  const [emailRaw, setEmailRaw] = useState("")
  const [emailDebounced, setEmailDebounced] = useState("")
  const [page, setPage] = useState(1)

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 300ms debounce on the email input. Reset to page 1 when the debounced
  // value lands so the user sees results from the start.
  useEffect(() => {
    const t = setTimeout(() => {
      setEmailDebounced(emailRaw)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [emailRaw])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(PAGE_SIZE))
      if (filters.action !== "all") params.set("action", filters.action)
      if (filters.entityType !== "all") params.set("entityType", filters.entityType)
      if (filters.startDate) params.set("startDate", `${filters.startDate}T00:00:00.000Z`)
      if (filters.endDate) params.set("endDate", `${filters.endDate}T23:59:59.999Z`)
      if (emailDebounced.trim()) params.set("actorEmail", emailDebounced.trim())

      const result = await fetchAuditLogs(params)
      setLogs(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat audit log")
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, filters.action, filters.entityType, filters.startDate, filters.endDate, emailDebounced])

  useEffect(() => {
    void load()
  }, [load])

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
    setExpandedId(null)
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS)
    setEmailRaw("")
    setEmailDebounced("")
    setPage(1)
    setExpandedId(null)
  }

  const hasActiveFilters =
    filters.action !== "all" ||
    filters.entityType !== "all" ||
    filters.startDate !== "" ||
    filters.endDate !== "" ||
    emailRaw.trim() !== ""

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  return (
    <PermissionGate require={Permission.READ_AUDIT_TRAIL} fallback={<AccessDenied />}>
      <div className="space-y-6">
        {/* Section 1 — Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6" />
            Audit Trail
          </h1>
          <p className="text-muted-foreground">Log seluruh aktivitas pengguna sistem</p>
        </div>

        {/* Section 2 — Filter bar */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div className="lg:col-span-2">
                <Label className="text-sm">Cari aktor (email)</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="email@example.com"
                    value={emailRaw}
                    onChange={(e) => setEmailRaw(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Aksi</Label>
                <Select value={filters.action} onValueChange={(v) => updateFilter("action", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Aksi</SelectItem>
                    {ACTION_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Entitas</Label>
                <Select
                  value={filters.entityType}
                  onValueChange={(v) => updateFilter("entityType", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Entitas</SelectItem>
                    {ENTITY_TYPE_OPTIONS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Dari tanggal</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Sampai tanggal</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Reset Filter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3 — Log table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <LogTableSkeleton />
            ) : error ? (
              <div className="p-6 text-center text-sm text-destructive">{error}</div>
            ) : logs.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left bg-muted/30">
                      <th className="w-10"></th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Waktu</th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Aktor</th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Role</th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Aksi</th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Entitas</th>
                      <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const isOpen = expandedId === log.id
                      const hasMetadata = log.metadata !== null && Object.keys(log.metadata).length > 0
                      return (
                        <RowGroup
                          key={log.id}
                          log={log}
                          isOpen={isOpen}
                          hasMetadata={hasMetadata}
                          onToggle={() => setExpandedId(isOpen ? null : log.id)}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4 — Pagination */}
        {!loading && !error && total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-medium text-foreground">{rangeStart}</span>–
              <span className="font-medium text-foreground">{rangeEnd}</span> dari{" "}
              <span className="font-medium text-foreground">{total}</span> log
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Hal {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  )
}

interface RowGroupProps {
  log: AuditLog
  isOpen: boolean
  hasMetadata: boolean
  onToggle: () => void
}

function RowGroup({ log, isOpen, hasMetadata, onToggle }: RowGroupProps) {
  const truncatedEntityId = log.entityId ? truncate(log.entityId, 8) : "—"
  const roleLabel = log.actorRole ?? "—"

  return (
    <>
      <tr
        className="border-b hover:bg-muted/40 cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-3 px-3 text-muted-foreground">
          {hasMetadata ? (
            isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <span className="inline-block w-4" />
          )}
        </td>
        <td className="py-3 px-3 whitespace-nowrap font-mono text-xs">{formatDateTime(log.createdAt)}</td>
        <td className="py-3 px-3 max-w-[220px] truncate" title={log.actorEmail ?? ""}>
          {log.actorEmail ?? <span className="text-muted-foreground italic">system</span>}
        </td>
        <td className="py-3 px-3">
          {log.actorRole ? (
            <Badge className={`${ROLE_BADGE[log.actorRole] ?? "bg-slate-100 text-slate-800"} font-normal`}>
              {roleLabel}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        <td className="py-3 px-3">
          <Badge className={`${actionBadgeClass(log.action)} font-mono text-xs font-normal`}>
            {log.action}
          </Badge>
        </td>
        <td className="py-3 px-3 whitespace-nowrap">
          <span className="text-muted-foreground">{log.entityType}</span>
          {log.entityId && (
            <span className="ml-2 font-mono text-xs" title={log.entityId}>
              {truncatedEntityId}
            </span>
          )}
        </td>
        <td className="py-3 px-3 text-muted-foreground">
          {hasMetadata ? (
            <span className="text-xs">{Object.keys(log.metadata as Record<string, unknown>).length} field</span>
          ) : (
            <span className="text-xs italic">—</span>
          )}
        </td>
      </tr>
      {isOpen && hasMetadata && (
        <tr className="border-b bg-muted/20">
          <td></td>
          <td colSpan={6} className="py-3 px-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Metadata</p>
              <pre className="text-xs bg-background border rounded-md p-3 overflow-x-auto max-h-64 overflow-y-auto font-mono">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                {log.ipAddress && (
                  <span>
                    IP: <span className="font-mono text-foreground">{log.ipAddress}</span>
                  </span>
                )}
                {log.userAgent && (
                  <span className="truncate max-w-[400px]" title={log.userAgent}>
                    UA: <span className="font-mono text-foreground">{log.userAgent}</span>
                  </span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function LogTableSkeleton() {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Memuat audit log…</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-muted/40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <History className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">
        {hasFilters ? "Tidak ada log yang cocok" : "Belum ada audit log"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {hasFilters
          ? "Coba ubah atau hapus filter untuk melihat lebih banyak hasil."
          : "Audit log akan muncul di sini ketika pengguna melakukan tindakan yang ter-track."}
      </p>
    </div>
  )
}
