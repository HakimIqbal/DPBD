/**
 * Shared types + fetchers for the role-specific admin dashboards. Most
 * dashboards hydrate from the existing public endpoints
 * `/api/analytics/endowment` (corpus + return + allocation, no auth) and
 * `/api/analytics/public-stats` (donor count, donation total, active
 * program count, no auth). The Risk Manager dashboard pulls
 * `/api/risk/alerts` (auth, READ_RISK).
 *
 * Field names mirror the backend interfaces verbatim — keep in sync with
 * `backend/src/analytics/analytics.service.ts` (PublicStats,
 * EndowmentSummary).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export type InstrumentType = "reksa_dana" | "sukuk" | "deposito_syariah" | "saham_syariah"

export interface EndowmentAllocation {
  type: InstrumentType
  amount: number
  percentage: number
}

/** Mirrors backend `EndowmentSummary` (analytics.service.ts). */
export interface EndowmentSummary {
  totalCorpus: number
  totalCurrentValue: number
  totalImbalHasil: number
  totalDisalurkan: number
  returnPercentage: number
  activeInvestments: number
  allocationByType: EndowmentAllocation[]
  lastUpdated: string
}

/** Mirrors backend `PublicStats` (analytics.service.ts). */
export interface PublicStats {
  totalDonatur: number
  totalDonasi: number
  totalProgram: number
  lastUpdated: string
}

export interface InvestmentTransaction {
  id: string
  investmentId: string
  transactionType:
    | "purchase"
    | "return_received"
    | "partial_liquidation"
    | "full_liquidation"
    | "value_update"
  amount: string
  transactionDate: string
  notes: string | null
  recordedBy: string | null
  createdAt: string
}

export interface RiskAlert {
  id: string
  thresholdId: string
  triggeredValue: string
  message: string
  severity: "info" | "warning" | "critical"
  isResolved: boolean
  resolvedAt: string | null
  resolvedBy: string | null
  createdAt: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const TYPE_LABELS: Record<InstrumentType, string> = {
  reksa_dana: "Reksa Dana",
  sukuk: "Sukuk",
  deposito_syariah: "Deposito Syariah",
  saham_syariah: "Saham Syariah",
}

export const TYPE_COLORS: Record<InstrumentType, string> = {
  reksa_dana: "#1D9E75",
  sukuk: "#378ADD",
  deposito_syariah: "#BA7517",
  saham_syariah: "#D85A30",
}

const TXN_LABELS: Record<InvestmentTransaction["transactionType"], string> = {
  purchase: "Pembelian",
  return_received: "Return Diterima",
  partial_liquidation: "Likuidasi Parsial",
  full_liquidation: "Likuidasi Penuh",
  value_update: "Update Nilai",
}

export function transactionLabel(t: InvestmentTransaction["transactionType"]): string {
  return TXN_LABELS[t]
}

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
    if (Array.isArray(m)) return m.map(String).join(", ")
    return String(m)
  }
  return `HTTP ${res.status}`
}

export async function fetchEndowment(): Promise<EndowmentSummary> {
  const res = await fetch(`${API_BASE_URL}/analytics/endowment`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as EndowmentSummary
}

export async function fetchPublicStats(): Promise<PublicStats> {
  const res = await fetch(`${API_BASE_URL}/analytics/public-stats`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as PublicStats
}

export async function fetchRecentInvestmentTransactions(
  limit = 5,
): Promise<InvestmentTransaction[]> {
  const res = await fetch(
    `${API_BASE_URL}/investments/transactions/recent?limit=${limit}`,
    { headers: authHeaders() },
  )
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as InvestmentTransaction[]
}

export async function fetchActiveAlerts(): Promise<Paginated<RiskAlert>> {
  const params = new URLSearchParams({ isResolved: "false", limit: "200" })
  const res = await fetch(`${API_BASE_URL}/risk/alerts?${params.toString()}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as Paginated<RiskAlert>
}

/** Mirrors backend `DisbursementListItem` (disbursements.service.ts). */
export interface PendingDisbursement {
  id: string
  status: "pending" | "approved" | "rejected" | "process" | "completed"
  amount: number
  recipient: string
  description: string | null
  programId: string
  programName: string
  requestedById: string | null
  requestedByName: string | null
  requestedByEmail: string | null
  requestedAt: string | null
  reviewedById: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export async function fetchPendingDisbursements(): Promise<PendingDisbursement[]> {
  const res = await fetch(`${API_BASE_URL}/disbursements/pending`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return (await res.json()) as PendingDisbursement[]
}

export async function approveDisbursement(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/disbursements/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error(await readApiError(res))
}

export async function rejectDisbursement(id: string, reason: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/disbursements/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  })
  if (!res.ok) throw new Error(await readApiError(res))
}
