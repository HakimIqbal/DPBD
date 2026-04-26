"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Wallet,
  ArrowUpFromLine,
  Loader2,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// Default general fund data if API fails
const DEFAULT_GENERAL_FUND = {
  totalCollected: 0,
  totalDisbursed: 0,
  balance: 0,
}

// Pengajuan dari Finance yang menunggu review Admin
const DEFAULT_REQUESTS: any[] = []

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu Review", color: "bg-amber-500/10 text-amber-600 border-0" },
  approved: { label: "Disetujui", color: "bg-blue-500/10 text-blue-600 border-0" },
  rejected: { label: "Ditolak", color: "bg-red-500/10 text-red-600 border-0" },
  completed: { label: "Selesai", color: "bg-emerald-500/10 text-emerald-600 border-0" },
}

export default function DisbursementsPage() {
  const [generalFund, setGeneralFund] = useState(DEFAULT_GENERAL_FUND)
  const [requests, setRequests] = useState<any[]>(DEFAULT_REQUESTS)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReq, setSelectedReq] = useState<any | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDisbursementData = async () => {
      setLoading(true)
      try {
        // Fetch general fund info
        const fundResponse = await fetch("http://localhost:3001/api/analytics/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })

        if (fundResponse.ok) {
          const fundData = await fundResponse.json()
          if (fundData.statistics) {
            setGeneralFund({
              totalCollected: fundData.statistics.totalIncome || 0,
              totalDisbursed: fundData.statistics.totalOutcome || 0,
              balance: (fundData.statistics.totalIncome || 0) - (fundData.statistics.totalOutcome || 0),
            })
          }
        }

        // Fetch disbursement requests (if endpoint exists)
        try {
          const requestsResponse = await fetch("http://localhost:3001/api/disbursements", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          })

          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json()
            setRequests(Array.isArray(requestsData) ? requestsData : requestsData.data || [])
          }
        } catch (err) {
          console.log("Disbursements endpoint not yet available")
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching disbursement data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchDisbursementData()
  }, [])

  const filteredRequests = requests.filter((r) => {
    if (searchQuery && !r.recipient.toLowerCase().includes(searchQuery.toLowerCase()) && !r.id.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    return true
  })

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved", reviewedAt: new Date().toLocaleString("id-ID") } : r
      )
    )
    setReviewOpen(false)
    setSelectedReq(null)
  }

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "rejected", reviewedAt: new Date().toLocaleString("id-ID") } : r
      )
    )
    setReviewOpen(false)
    setSelectedReq(null)
    setRejectReason("")
  }

  const openReview = (req: any) => {
    setSelectedReq(req)
    setReviewOpen(true)
  }

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    completed: requests.filter((r) => r.status === "completed").length,
    totalCompleted: requests.filter((r) => r.status === "completed").reduce((s, r) => s + (r.amount || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data pengajuan penyaluran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Review Pengajuan Penyaluran</h1>
        <p className="text-muted-foreground">
          Finance mengajukan penyaluran — Admin mereview dan menyetujui atau menolak
        </p>
      </div>

      {/* General Fund Balance */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Dana Terkumpul (General Fund)</p>
                <p className="text-2xl font-bold">{formatRupiah(generalFund.totalCollected)}</p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Disalurkan</p>
                <p className="text-xl font-bold text-primary">{formatRupiah(generalFund.totalDisbursed)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
                <p className="text-xl font-bold text-emerald-600">{formatRupiah(generalFund.balance)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress Penyaluran</span>
              <span>{Math.round((generalFund.totalDisbursed / generalFund.totalCollected) * 100)}%</span>
            </div>
            <Progress value={(generalFund.totalDisbursed / generalFund.totalCollected) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10"><Clock className="w-5 h-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Perlu Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10"><CheckCircle className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Disetujui</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10"><ArrowUpFromLine className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10"><Wallet className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-sm font-bold">{formatRupiah(stats.totalCompleted)}</p>
              <p className="text-xs text-muted-foreground">Total Selesai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari ID atau penerima..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu Review</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredRequests.map((req) => {
          const cfg = statusConfig[req.status]
          return (
            <Card key={req.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{req.id}</span>
                      <Badge className={cfg.color}>{cfg.label}</Badge>
                      <Badge variant="outline" className="text-xs">{req.category}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Penerima: </span>
                        <span className="font-medium">{req.recipient}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nominal: </span>
                        <span className="font-bold text-primary">{formatRupiah(req.amount)}</span>
                      </div>
                      <div className="col-span-2 text-xs text-muted-foreground">{req.recipientBank}</div>
                      {req.notes && <div className="col-span-2 text-xs text-muted-foreground">{req.notes}</div>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Diajukan oleh {req.submittedBy} — {req.submittedAt}
                    </p>
                    {req.reviewedAt && (
                      <p className="text-xs text-muted-foreground">Direview pada {req.reviewedAt}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {req.status === "pending" && (
                      <Button size="sm" onClick={() => openReview(req)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    )}
                    {req.status === "completed" && req.proofFile && (
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Bukti
                      </Button>
                    )}
                    {req.status === "approved" && (
                      <span className="text-xs text-blue-600 italic self-center">Menunggu Finance transfer...</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Pengajuan {selectedReq?.id}</DialogTitle>
            <DialogDescription>Periksa detail pengajuan penyaluran dari Finance</DialogDescription>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Kategori Program</p>
                    <p className="font-medium">{selectedReq.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nominal</p>
                    <p className="font-bold text-primary text-base">{formatRupiah(selectedReq.amount)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Penerima</p>
                    <p className="font-medium">{selectedReq.recipient}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Rekening Tujuan</p>
                    <p>{selectedReq.recipientBank}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Keterangan</p>
                    <p>{selectedReq.notes}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Saldo General Fund Tersedia</p>
                    <p className="font-bold text-emerald-600">{formatRupiah(generalFund.balance)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alasan Penolakan (isi jika menolak)</Label>
                <Textarea
                  placeholder="Opsional jika disetujui..."
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Batal</Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              onClick={() => selectedReq && handleReject(selectedReq.id)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Tolak
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => selectedReq && handleApprove(selectedReq.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
