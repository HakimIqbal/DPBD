"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { PermissionGate } from "@/components/ui/permission-gate"
import { AccessDenied } from "@/components/admin/access-denied"
import { Permission } from "@/lib/permissions"
import { usePermission } from "@/hooks/use-permission"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
const TABLE_PAGE_SIZE = 20

// ---- Types ----------------------------------------------------------------

type InstrumentType = "reksa_dana" | "sukuk" | "deposito_syariah" | "saham_syariah"
type InvestmentStatus = "active" | "matured" | "liquidated"
type TransactionType =
  | "purchase"
  | "return_received"
  | "partial_liquidation"
  | "full_liquidation"
  | "value_update"

interface Allocation {
  type: InstrumentType
  amount: number
  percentage: number
}

interface PortfolioSummary {
  totalPrincipal: number
  totalCurrentValue: number
  totalReturn: number
  returnPercentage: number
  allocationByType: Allocation[]
  activeCount: number
  maturedCount: number
}

interface Investment {
  id: string
  name: string
  instrumentType: InstrumentType
  institution: string
  principalAmount: string
  currentValue: string
  purchaseDate: string
  maturityDate: string | null
  expectedReturnRate: string | null
  actualReturnAmount: string
  status: InvestmentStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface InvestmentTransaction {
  id: string
  investmentId: string
  transactionType: TransactionType
  amount: string
  transactionDate: string
  notes: string | null
  recordedBy: string | null
  createdAt: string
}

interface PaginatedInvestments {
  data: Investment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface InvestmentDetail {
  investment: Investment
  transactions: InvestmentTransaction[]
}

interface FilterState {
  instrumentType: "all" | InstrumentType
  status: "all" | InvestmentStatus
}

// ---- Static maps ----------------------------------------------------------

const TYPE_COLORS: Record<InstrumentType, string> = {
  reksa_dana: "#1D9E75",
  sukuk: "#378ADD",
  deposito_syariah: "#BA7517",
  saham_syariah: "#D85A30",
}

const TYPE_LABELS: Record<InstrumentType, string> = {
  reksa_dana: "Reksa Dana",
  sukuk: "Sukuk",
  deposito_syariah: "Deposito Syariah",
  saham_syariah: "Saham Syariah",
}

const STATUS_LABELS: Record<InvestmentStatus, string> = {
  active: "Aktif",
  matured: "Jatuh Tempo",
  liquidated: "Dilikuidasi",
}

const STATUS_BADGE_CLASS: Record<InvestmentStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  matured: "bg-amber-100 text-amber-800",
  liquidated: "bg-slate-100 text-slate-700",
}

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  purchase: "Pembelian",
  return_received: "Return Diterima",
  partial_liquidation: "Likuidasi Parsial",
  full_liquidation: "Likuidasi Penuh",
  value_update: "Update Nilai",
}

const INITIAL_FILTERS: FilterState = { instrumentType: "all", status: "all" }

// ---- Formatters -----------------------------------------------------------

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount)
}

function formatPercentage(value: number): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

function formatSignedRupiah(amount: number): string {
  const sign = amount > 0 ? "+" : ""
  return `${sign}${rupiahFormatter.format(amount)}`
}

function formatDate(iso: string): string {
  // `date` columns come back as 'YYYY-MM-DD'; full ISO timestamps also work.
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function toNumber(value: string | null | undefined): number {
  if (value === null || value === undefined) return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function calcReturnPercentage(principal: string, current: string): number {
  const p = toNumber(principal)
  const c = toNumber(current)
  if (p === 0) return 0
  return ((c - p) / p) * 100
}

// ---- API helpers ----------------------------------------------------------

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

async function fetchSummary(): Promise<PortfolioSummary> {
  const res = await fetch(`${API_BASE_URL}/investments/summary`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as PortfolioSummary
}

async function fetchInvestments(params: URLSearchParams): Promise<PaginatedInvestments> {
  const res = await fetch(`${API_BASE_URL}/investments?${params.toString()}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as PaginatedInvestments
}

async function fetchInvestmentDetail(id: string): Promise<InvestmentDetail> {
  const res = await fetch(`${API_BASE_URL}/investments/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as InvestmentDetail
}

async function createInvestment(payload: Record<string, unknown>): Promise<Investment> {
  const res = await fetch(`${API_BASE_URL}/investments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as Investment
}

async function postTransaction(
  investmentId: string,
  payload: Record<string, unknown>,
): Promise<{ investment: Investment; transaction: InvestmentTransaction }> {
  const res = await fetch(`${API_BASE_URL}/investments/${investmentId}/transactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as {
    investment: Investment
    transaction: InvestmentTransaction
  }
}

/** Local-timezone YYYY-MM-DD — used as the default for date inputs. */
function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

// ---- Page -----------------------------------------------------------------

export default function PortfolioPage() {
  const { toast } = useToast()
  const canWrite = usePermission(Permission.WRITE_PORTFOLIO)

  // Summary card state
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // Filter + table state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [tablePage, setTablePage] = useState(1)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [investmentsTotal, setInvestmentsTotal] = useState(0)
  const [tableLoading, setTableLoading] = useState(true)
  const [tableError, setTableError] = useState<string | null>(null)

  // Row expansion state. The transactions cache is keyed by investment id so
  // re-expanding a row doesn't refetch.
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [transactionCache, setTransactionCache] = useState<
    Map<string, InvestmentTransaction[]>
  >(new Map())
  const [expansionLoading, setExpansionLoading] = useState<Set<string>>(new Set())

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)

  // Add-transaction dialog state. The id (when non-null) doubles as the
  // open flag and tells the dialog which investment to POST against.
  const [txnDialogId, setTxnDialogId] = useState<string | null>(null)

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      setSummary(await fetchSummary())
    } catch (e) {
      setSummary(null)
      setSummaryError(e instanceof Error ? e.message : "Gagal memuat ringkasan")
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  const loadInvestments = useCallback(async () => {
    setTableLoading(true)
    setTableError(null)
    try {
      const params = new URLSearchParams()
      params.set("page", String(tablePage))
      params.set("limit", String(TABLE_PAGE_SIZE))
      if (filters.instrumentType !== "all") {
        params.set("instrumentType", filters.instrumentType)
      }
      if (filters.status !== "all") params.set("status", filters.status)

      const result = await fetchInvestments(params)
      setInvestments(result.data)
      setInvestmentsTotal(result.total)
    } catch (e) {
      setInvestments([])
      setInvestmentsTotal(0)
      setTableError(e instanceof Error ? e.message : "Gagal memuat daftar investasi")
    } finally {
      setTableLoading(false)
    }
  }, [tablePage, filters.instrumentType, filters.status])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  useEffect(() => {
    void loadInvestments()
  }, [loadInvestments])

  // Reset to page 1 whenever filters change. Wrapped in onChange of FilterBar
  // so we don't fight an effect-driven loop.
  function handleFiltersChange(next: FilterState) {
    setFilters(next)
    setTablePage(1)
    setExpandedId(null)
  }

  async function handleToggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!transactionCache.has(id)) {
      setExpansionLoading((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
      try {
        const detail = await fetchInvestmentDetail(id)
        setTransactionCache((prev) => {
          const next = new Map(prev)
          next.set(id, detail.transactions)
          return next
        })
      } catch (e) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Gagal memuat transaksi",
          variant: "destructive",
        })
      } finally {
        setExpansionLoading((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    }
  }

  async function handleCreated() {
    setCreateOpen(false)
    toast({
      title: "Sukses",
      description: "Investasi berhasil ditambahkan",
    })
    // Refresh both — the new row affects both the summary aggregate and the
    // table list. Drop expansion cache since the underlying list changed.
    setTransactionCache(new Map())
    setExpandedId(null)
    await Promise.all([loadSummary(), loadInvestments()])
  }

  /**
   * Re-fetch a single investment + its transactions and patch them into the
   * page state. Avoids re-fetching the whole list (preserves pagination,
   * expansion of other rows, etc.) — used after a transaction is posted.
   */
  const loadInvestmentDetail = useCallback(async (id: string) => {
    try {
      const detail = await fetchInvestmentDetail(id)
      setInvestments((prev) =>
        prev.map((inv) => (inv.id === id ? detail.investment : inv)),
      )
      setTransactionCache((prev) => {
        const next = new Map(prev)
        next.set(id, detail.transactions)
        return next
      })
    } catch (e) {
      toast({
        title: "Error",
        description:
          e instanceof Error ? e.message : "Gagal memuat detail investasi",
        variant: "destructive",
      })
    }
  }, [toast])

  async function handleTransactionCreated(investmentId: string) {
    setTxnDialogId(null)
    toast({
      title: "Sukses",
      description: "Transaksi berhasil dicatat",
    })
    // Refresh summary aggregate AND the specific investment row (which gives
    // us both the updated currentValue/principal/status and the new txn in
    // the journal).
    await Promise.all([loadSummary(), loadInvestmentDetail(investmentId)])
  }

  function handleEditPlaceholder(name: string) {
    toast({
      title: "Belum tersedia",
      description: `Form edit untuk ${name} akan dibuat di iterasi berikutnya.`,
    })
  }

  return (
    <PermissionGate require={Permission.READ_PORTFOLIO} fallback={<AccessDenied />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Portfolio Investasi
          </h1>
          <p className="text-muted-foreground">
            Manajemen instrumen dan alokasi dana investasi
          </p>
        </div>

        {/* Section 1 */}
        <SummaryCards
          summary={summary}
          loading={summaryLoading}
          error={summaryError}
        />

        {/* Section 2 */}
        <AllocationCard summary={summary} loading={summaryLoading} />

        {/* Section 3 */}
        <FilterBar
          filters={filters}
          onChange={handleFiltersChange}
          onAddClick={() => setCreateOpen(true)}
        />

        {/* Section 4 */}
        <InvestmentsTable
          investments={investments}
          total={investmentsTotal}
          page={tablePage}
          loading={tableLoading}
          error={tableError}
          expandedId={expandedId}
          transactionCache={transactionCache}
          expansionLoading={expansionLoading}
          canEdit={canWrite}
          onToggleExpand={handleToggleExpand}
          onPageChange={setTablePage}
          onEditClick={handleEditPlaceholder}
          onAddTransactionClick={(id) => setTxnDialogId(id)}
        />

        {/* Section 5 */}
        <CreateInvestmentDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleCreated}
        />

        {/* Tambah Transaksi dialog — controlled by id (non-null = open) */}
        <AddTransactionDialog
          investmentId={txnDialogId}
          investmentName={
            txnDialogId
              ? investments.find((i) => i.id === txnDialogId)?.name ?? ""
              : ""
          }
          onOpenChange={(open) => {
            if (!open) setTxnDialogId(null)
          }}
          onCreated={handleTransactionCreated}
        />
      </div>
    </PermissionGate>
  )
}

// ============================================================================
// Section 1 — Summary cards
// ============================================================================

interface SummaryCardsProps {
  summary: PortfolioSummary | null
  loading: boolean
  error: string | null
}

function SummaryCards({ summary, loading, error }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || !summary) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          {error ?? "Tidak ada data ringkasan portfolio."}
        </CardContent>
      </Card>
    )
  }

  const returnIsPositive = summary.totalReturn >= 0
  const pctIsPositive = summary.returnPercentage >= 0
  const positiveClass = "text-emerald-600"
  const negativeClass = "text-red-600"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 w-fit">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <p className="text-xl font-bold tracking-tight tabular-nums">
              {formatRupiah(summary.totalPrincipal)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Total Dana Diinvestasikan
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <p className="text-xl font-bold tracking-tight tabular-nums">
              {formatRupiah(summary.totalCurrentValue)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">Nilai Sekarang</p>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`bg-gradient-to-br ${
          returnIsPositive
            ? "from-emerald-500/5 to-emerald-500/10"
            : "from-red-500/5 to-red-500/10"
        } border-0 shadow-sm`}
      >
        <CardContent className="p-5">
          <div
            className={`p-2.5 rounded-xl w-fit ${
              returnIsPositive
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {returnIsPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div className="mt-4">
            <p
              className={`text-xl font-bold tracking-tight tabular-nums ${
                returnIsPositive ? positiveClass : negativeClass
              }`}
            >
              {formatSignedRupiah(summary.totalReturn)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">Total Return</p>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`bg-gradient-to-br ${
          pctIsPositive
            ? "from-emerald-500/5 to-emerald-500/10"
            : "from-red-500/5 to-red-500/10"
        } border-0 shadow-sm`}
      >
        <CardContent className="p-5">
          <div
            className={`p-2.5 rounded-xl w-fit ${
              pctIsPositive
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {pctIsPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div className="mt-4">
            <p
              className={`text-xl font-bold tracking-tight tabular-nums ${
                pctIsPositive ? positiveClass : negativeClass
              }`}
            >
              {formatPercentage(summary.returnPercentage)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">Return %</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="mt-4 space-y-2">
          <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Section 2 — Allocation donut
// ============================================================================

interface AllocationCardProps {
  summary: PortfolioSummary | null
  loading: boolean
}

function AllocationCard({ summary, loading }: AllocationCardProps) {
  const slices = useMemo(
    () => (summary?.allocationByType ?? []).filter((a) => a.amount > 0),
    [summary],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alokasi per Instrumen</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <AllocationSkeleton />
        ) : slices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Briefcase className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Belum ada investasi untuk ditampilkan dalam alokasi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="amount"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {slices.map((s) => (
                      <Cell key={s.type} fill={TYPE_COLORS[s.type]} />
                    ))}
                  </Pie>
                  <Tooltip content={<AllocationTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {slices.map((s) => (
                <div key={s.type} className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: TYPE_COLORS[s.type] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{TYPE_LABELS[s.type]}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatRupiah(s.amount)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {s.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AllocationSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="h-[280px] flex items-center justify-center">
        <div className="w-56 h-56 rounded-full border-[28px] border-muted animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-12 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface SliceTooltipPayload {
  type: InstrumentType
  amount: number
  percentage: number
}

function AllocationTooltip(props: TooltipProps<number, string>) {
  const { active, payload } = props
  if (!active || !payload || payload.length === 0) return null
  const slice = payload[0]?.payload as SliceTooltipPayload | undefined
  if (!slice) return null

  return (
    <div className="rounded-lg border bg-background p-2.5 shadow-sm text-sm">
      <p className="font-medium mb-1">{TYPE_LABELS[slice.type]}</p>
      <p className="text-muted-foreground tabular-nums">{formatRupiah(slice.amount)}</p>
      <p className="text-muted-foreground tabular-nums">
        {slice.percentage.toFixed(2)}%
      </p>
    </div>
  )
}

// ============================================================================
// Section 3 — Filter bar
// ============================================================================

interface FilterBarProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  onAddClick: () => void
}

function FilterBar({ filters, onChange, onAddClick }: FilterBarProps) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 min-w-0">
            <Label className="text-sm">Instrumen</Label>
            <Select
              value={filters.instrumentType}
              onValueChange={(v) =>
                set("instrumentType", v as FilterState["instrumentType"])
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Instrumen</SelectItem>
                {(Object.keys(TYPE_LABELS) as InstrumentType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-0">
            <Label className="text-sm">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(v) => set("status", v as FilterState["status"])}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {(Object.keys(STATUS_LABELS) as InvestmentStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PermissionGate require={Permission.WRITE_PORTFOLIO}>
            <Button onClick={onAddClick} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Tambah Investasi
            </Button>
          </PermissionGate>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Section 4 — Investments table
// ============================================================================

interface InvestmentsTableProps {
  investments: Investment[]
  total: number
  page: number
  loading: boolean
  error: string | null
  expandedId: string | null
  transactionCache: Map<string, InvestmentTransaction[]>
  expansionLoading: Set<string>
  canEdit: boolean
  onToggleExpand: (id: string) => void
  onPageChange: (page: number) => void
  onEditClick: (name: string) => void
  onAddTransactionClick: (id: string) => void
}

function InvestmentsTable({
  investments,
  total,
  page,
  loading,
  error,
  expandedId,
  transactionCache,
  expansionLoading,
  canEdit,
  onToggleExpand,
  onPageChange,
  onEditClick,
  onAddTransactionClick,
}: InvestmentsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE))
  const rangeStart = total === 0 ? 0 : (page - 1) * TABLE_PAGE_SIZE + 1
  const rangeEnd = Math.min(page * TABLE_PAGE_SIZE, total)

  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="p-6 text-center text-sm text-destructive">{error}</div>
        ) : investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Briefcase className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Tidak ada instrumen</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Coba ubah filter atau tambahkan investasi baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/30">
                  <th className="w-10"></th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">
                    Nama Instrumen
                  </th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">
                    Jenis
                  </th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">
                    Institusi
                  </th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">
                    Dana Awal
                  </th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">
                    Nilai Sekarang
                  </th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">
                    Return %
                  </th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">
                    Tgl Beli
                  </th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <InvestmentRow
                    key={inv.id}
                    investment={inv}
                    isOpen={expandedId === inv.id}
                    transactions={transactionCache.get(inv.id) ?? null}
                    expansionLoading={expansionLoading.has(inv.id)}
                    canEdit={canEdit}
                    onToggle={() => onToggleExpand(inv.id)}
                    onEdit={() => onEditClick(inv.name)}
                    onAddTransaction={() => onAddTransactionClick(inv.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Menampilkan{" "}
            <span className="font-medium text-foreground">{rangeStart}</span>–
            <span className="font-medium text-foreground">{rangeEnd}</span> dari{" "}
            <span className="font-medium text-foreground">{total}</span> instrumen
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
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
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

interface InvestmentRowProps {
  investment: Investment
  isOpen: boolean
  transactions: InvestmentTransaction[] | null
  expansionLoading: boolean
  canEdit: boolean
  onToggle: () => void
  onEdit: () => void
  onAddTransaction: () => void
}

function InvestmentRow({
  investment,
  isOpen,
  transactions,
  expansionLoading,
  canEdit,
  onToggle,
  onEdit,
  onAddTransaction,
}: InvestmentRowProps) {
  const principal = toNumber(investment.principalAmount)
  const current = toNumber(investment.currentValue)
  const returnPct = calcReturnPercentage(investment.principalAmount, investment.currentValue)
  const positive = returnPct >= 0

  return (
    <>
      <tr
        className="border-b hover:bg-muted/40 cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-3 px-3 text-muted-foreground">
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </td>
        <td className="py-3 px-3 font-medium">{investment.name}</td>
        <td className="py-3 px-3 text-muted-foreground">
          {TYPE_LABELS[investment.instrumentType]}
        </td>
        <td className="py-3 px-3 text-muted-foreground">{investment.institution}</td>
        <td className="py-3 px-3 text-right tabular-nums">{formatRupiah(principal)}</td>
        <td className="py-3 px-3 text-right tabular-nums">{formatRupiah(current)}</td>
        <td
          className={`py-3 px-3 text-right tabular-nums font-medium ${
            positive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {formatPercentage(returnPct)}
        </td>
        <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
          {formatDate(investment.purchaseDate)}
        </td>
        <td className="py-3 px-3">
          <Badge className={`${STATUS_BADGE_CLASS[investment.status]} font-normal`}>
            {STATUS_LABELS[investment.status]}
          </Badge>
        </td>
        <td className="py-3 px-3">
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-8">
              <Eye className="w-4 h-4 mr-1" />
              Detail
            </Button>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-8">
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-b bg-muted/20">
          <td></td>
          <td colSpan={9} className="py-3 px-3">
            <ExpandedDetail
              investment={investment}
              transactions={transactions}
              loading={expansionLoading}
              canEdit={canEdit}
              onAddTransaction={onAddTransaction}
            />
          </td>
        </tr>
      )}
    </>
  )
}

interface ExpandedDetailProps {
  investment: Investment
  transactions: InvestmentTransaction[] | null
  loading: boolean
  canEdit: boolean
  onAddTransaction: () => void
}

function ExpandedDetail({
  investment,
  transactions,
  loading,
  canEdit,
  onAddTransaction,
}: ExpandedDetailProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <DetailField label="Tanggal Pembelian" value={formatDate(investment.purchaseDate)} />
        <DetailField
          label="Tanggal Jatuh Tempo"
          value={investment.maturityDate ? formatDate(investment.maturityDate) : "—"}
        />
        <DetailField
          label="Expected Return"
          value={
            investment.expectedReturnRate
              ? `${Number(investment.expectedReturnRate).toFixed(2)}% p.a.`
              : "—"
          }
        />
        <DetailField
          label="Realized Return"
          value={formatRupiah(toNumber(investment.actualReturnAmount))}
        />
      </div>

      {investment.notes && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
            Catatan
          </p>
          <p className="text-sm">{investment.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Histori Transaksi
        </p>
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={onAddTransaction}
            className="gap-2 h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Transaksi
          </Button>
        )}
      </div>
      <div>
        {/* Indented to keep the section header + button aligned with the
            transaction list below. */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat transaksi…
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Belum ada transaksi tercatat.
          </p>
        ) : (
          <div className="rounded-md border bg-background overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="py-2 px-3 font-medium text-muted-foreground">Tanggal</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">Jenis</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">
                    Jumlah
                  </th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="py-2 px-3 whitespace-nowrap">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="py-2 px-3">{TRANSACTION_LABELS[tx.transactionType]}</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {formatRupiah(toNumber(tx.amount))}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{tx.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground uppercase text-[0.65rem] tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Memuat instrumen…</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-md bg-muted/40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Section 5 — Tambah Investasi dialog
// ============================================================================

const INSTRUMENT_TYPES = ["reksa_dana", "sukuk", "deposito_syariah", "saham_syariah"] as const

const formSchema = z
  .object({
    name: z.string().trim().min(1, "Nama wajib diisi"),
    instrumentType: z.enum(INSTRUMENT_TYPES, {
      errorMap: () => ({ message: "Jenis wajib dipilih" }),
    }),
    institution: z.string().trim().min(1, "Institusi wajib diisi"),
    principalAmount: z.coerce
      .number({ invalid_type_error: "Harus berupa angka" })
      .min(0, "Minimal 0"),
    currentValue: z.coerce
      .number({ invalid_type_error: "Harus berupa angka" })
      .min(0, "Minimal 0"),
    purchaseDate: z.string().min(1, "Tanggal pembelian wajib diisi"),
    maturityDate: z.string().optional().or(z.literal("")),
    // Allow empty string from optional input; coerce to number only when present.
    expectedReturnRate: z
      .union([
        z.literal(""),
        z.coerce
          .number({ invalid_type_error: "Harus berupa angka" })
          .min(0, "Minimal 0")
          .max(100, "Maksimal 100"),
      ])
      .optional(),
    notes: z.string().optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    if (
      val.maturityDate &&
      val.maturityDate !== "" &&
      new Date(val.maturityDate) < new Date(val.purchaseDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maturityDate"],
        message: "Tanggal jatuh tempo tidak boleh sebelum tanggal pembelian",
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

interface CreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void | Promise<void>
}

function CreateInvestmentDialog({ open, onOpenChange, onCreated }: CreateDialogProps) {
  const { toast } = useToast()
  const userTouchedCurrent = useRef(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      instrumentType: undefined as unknown as FormValues["instrumentType"],
      institution: "",
      principalAmount: undefined as unknown as number,
      currentValue: undefined as unknown as number,
      purchaseDate: "",
      maturityDate: "",
      expectedReturnRate: "",
      notes: "",
    },
  })

  // Mirror principalAmount → currentValue while the user hasn't manually
  // edited the latter. As soon as they touch the field, stop overwriting.
  const principalRaw = watch("principalAmount")
  useEffect(() => {
    if (!userTouchedCurrent.current && principalRaw !== undefined && principalRaw !== null) {
      setValue("currentValue", principalRaw as FormValues["currentValue"])
    }
  }, [principalRaw, setValue])

  // Reset form + touch flag whenever the dialog closes so reopening is fresh.
  useEffect(() => {
    if (!open) {
      reset()
      userTouchedCurrent.current = false
    }
  }, [open, reset])

  async function onSubmit(values: FormValues) {
    try {
      const payload: Record<string, unknown> = {
        name: values.name.trim(),
        instrumentType: values.instrumentType,
        institution: values.institution.trim(),
        principalAmount: values.principalAmount,
        currentValue: values.currentValue,
        purchaseDate: values.purchaseDate,
      }
      if (values.maturityDate && values.maturityDate !== "") {
        payload.maturityDate = values.maturityDate
      }
      if (values.expectedReturnRate !== undefined && values.expectedReturnRate !== "") {
        payload.expectedReturnRate = values.expectedReturnRate
      }
      if (values.notes && values.notes.trim() !== "") {
        payload.notes = values.notes.trim()
      }

      await createInvestment(payload)
      await onCreated()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Gagal menambahkan investasi",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Investasi</DialogTitle>
          <DialogDescription>
            Catat instrumen investasi baru ke dalam portfolio. Semua nilai dalam IDR.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nama instrumen" error={errors.name?.message} required>
              <Input
                placeholder="mis. Reksa Dana Syariah Mandiri Seri 1"
                {...register("name")}
              />
            </Field>

            <Field label="Jenis instrumen" error={errors.instrumentType?.message} required>
              <Controller
                name="instrumentType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v as FormValues["instrumentType"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis…" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTRUMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field label="Institusi" error={errors.institution?.message} required>
            <Input
              placeholder="mis. Bank Mandiri Syariah, Pemerintah RI"
              {...register("institution")}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Dana awal (IDR)" error={errors.principalAmount?.message} required>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="100000000"
                {...register("principalAmount", { valueAsNumber: true })}
              />
            </Field>

            <Field
              label="Nilai sekarang (IDR)"
              error={errors.currentValue?.message}
              required
              hint="Default mengikuti dana awal sampai Anda mengubahnya"
            >
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="100000000"
                {...register("currentValue", {
                  valueAsNumber: true,
                  onChange: () => {
                    userTouchedCurrent.current = true
                  },
                })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tanggal pembelian" error={errors.purchaseDate?.message} required>
              <Input type="date" {...register("purchaseDate")} />
            </Field>

            <Field label="Tanggal jatuh tempo" error={errors.maturityDate?.message}>
              <Input type="date" {...register("maturityDate")} />
            </Field>
          </div>

          <Field
            label="Expected return rate (% p.a.)"
            error={errors.expectedReturnRate?.message as string | undefined}
            hint="Kosongkan jika instrumen tidak punya rate tetap (mis. saham)"
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="6.50"
              {...register("expectedReturnRate")}
            />
          </Field>

          <Field label="Catatan" error={errors.notes?.message}>
            <Textarea
              placeholder="Catatan tambahan (opsional)…"
              rows={3}
              {...register("notes")}
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface FieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, error, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ============================================================================
// Tambah Transaksi dialog
// ============================================================================

/**
 * Frontend exposes only the 4 user-facing transaction kinds — `purchase` is
 * implicit when an investment is created, so it isn't in the dropdown.
 */
const USER_TRANSACTION_TYPES = [
  "value_update",
  "return_received",
  "partial_liquidation",
  "full_liquidation",
] as const
type UserTransactionType = (typeof USER_TRANSACTION_TYPES)[number]

const USER_TRANSACTION_LABELS: Record<UserTransactionType, string> = {
  value_update: "Update Nilai",
  return_received: "Return Diterima",
  partial_liquidation: "Likuidasi Sebagian",
  full_liquidation: "Likuidasi Penuh",
}

/** Per-type label for the amount input — drives copy-clarity in the form. */
function amountLabelFor(type: UserTransactionType | undefined): string {
  switch (type) {
    case "value_update":
      return "Nilai Pasar Terkini (IDR)"
    case "return_received":
      return "Jumlah Return Diterima (IDR)"
    case "partial_liquidation":
    case "full_liquidation":
      return "Jumlah Dilikuidasi (IDR)"
    default:
      return "Jumlah (IDR)"
  }
}

const txnFormSchema = z.object({
  transactionType: z.enum(USER_TRANSACTION_TYPES, {
    errorMap: () => ({ message: "Jenis transaksi wajib dipilih" }),
  }),
  amount: z.coerce
    .number({ invalid_type_error: "Harus berupa angka" })
    .min(0, "Minimal 0"),
  transactionDate: z.string().min(1, "Tanggal transaksi wajib diisi"),
  notes: z.string().optional().or(z.literal("")),
})

type TxnFormValues = z.infer<typeof txnFormSchema>

interface AddTransactionDialogProps {
  /** Non-null = open, scoped to that investment id. */
  investmentId: string | null
  investmentName: string
  onOpenChange: (open: boolean) => void
  onCreated: (investmentId: string) => void | Promise<void>
}

function AddTransactionDialog({
  investmentId,
  investmentName,
  onOpenChange,
  onCreated,
}: AddTransactionDialogProps) {
  const { toast } = useToast()
  const isOpen = investmentId !== null

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TxnFormValues>({
    resolver: zodResolver(txnFormSchema),
    defaultValues: {
      transactionType: undefined as unknown as UserTransactionType,
      amount: undefined as unknown as number,
      transactionDate: todayISO(),
      notes: "",
    },
  })

  // Reset whenever the dialog closes so reopening on a different row starts
  // fresh. Use the open boolean (not investmentId) so a "switch row" — close
  // followed by open with a new id — also clears stale field values.
  useEffect(() => {
    if (!isOpen) {
      reset({
        transactionType: undefined as unknown as UserTransactionType,
        amount: undefined as unknown as number,
        transactionDate: todayISO(),
        notes: "",
      })
    }
  }, [isOpen, reset])

  const currentType = watch("transactionType") as UserTransactionType | undefined

  async function onSubmit(values: TxnFormValues) {
    if (!investmentId) return

    try {
      const payload: Record<string, unknown> = {
        transactionType: values.transactionType,
        amount: values.amount,
        transactionDate: values.transactionDate,
      }
      if (values.notes && values.notes.trim() !== "") {
        payload.notes = values.notes.trim()
      }

      await postTransaction(investmentId, payload)
      await onCreated(investmentId)
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Gagal mencatat transaksi",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
          <DialogDescription>
            {investmentName ? (
              <>
                Catat transaksi terhadap{" "}
                <span className="font-medium text-foreground">{investmentName}</span>.
              </>
            ) : (
              "Catat transaksi terhadap investasi ini."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label="Jenis transaksi"
            error={errors.transactionType?.message}
            required
          >
            <Controller
              name="transactionType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v as UserTransactionType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis transaksi…" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {USER_TRANSACTION_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label={amountLabelFor(currentType)}
            error={errors.amount?.message}
            required
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              {...register("amount", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Tanggal transaksi"
            error={errors.transactionDate?.message}
            required
          >
            <Input type="date" {...register("transactionDate")} />
          </Field>

          <Field label="Catatan" error={errors.notes?.message}>
            <Textarea
              placeholder="Catatan tambahan (opsional)…"
              rows={3}
              {...register("notes")}
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan Transaksi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
