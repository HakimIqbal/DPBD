"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Clock, CheckCircle, XCircle, Upload, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"

// Kategori aktif dari admin/programs
const disbursementCategories = [
  "Beasiswa Pelajar Indonesia",
  "UMKM Diaspora",
  "Kesehatan Masyarakat",
  "Bantuan Darurat Gaza",
  "Infrastruktur Pendidikan",
  "Lingkungan Hijau",
]

const initialRequests = [
  {
    id: "REQ-001",
    category: "Beasiswa Pelajar Indonesia",
    recipient: "Yayasan Pendidikan Indonesia",
    recipientBank: "BCA 1234567890 a.n. Yayasan Pendidikan",
    amount: 15000000,
    notes: "Penyaluran beasiswa semester genap 2024 - Batch 1",
    status: "approved",
    submittedAt: "15 Jan 2025, 09:00",
    reviewedAt: "15 Jan 2025, 11:30",
    reviewedBy: "Admin DPBD",
    proofFile: null,
  },
  {
    id: "REQ-002",
    category: "UMKM Diaspora",
    recipient: "Koperasi Pelajar Jerman",
    recipientBank: "Mandiri 9876543210 a.n. Koperasi Pelajar",
    amount: 8500000,
    notes: "Bantuan modal usaha 5 pelaku UMKM",
    status: "pending",
    submittedAt: "16 Jan 2025, 08:15",
    reviewedAt: null,
    reviewedBy: null,
    proofFile: null,
  },
  {
    id: "REQ-003",
    category: "Kesehatan Masyarakat",
    recipient: "Klinik Sosial Jakarta",
    recipientBank: "BNI 5566778899 a.n. Klinik Sosial",
    amount: 12000000,
    notes: "Operasional klinik bulan Januari",
    status: "rejected",
    submittedAt: "14 Jan 2025, 14:00",
    reviewedAt: "14 Jan 2025, 16:00",
    reviewedBy: "Admin DPBD",
    proofFile: null,
  },
  {
    id: "REQ-004",
    category: "Bantuan Darurat Gaza",
    recipient: "Palang Merah Indonesia",
    recipientBank: "BCA 1122334455 a.n. PMI",
    amount: 50000000,
    notes: "Bantuan kemanusiaan tahap 4",
    status: "completed",
    submittedAt: "10 Jan 2025, 10:00",
    reviewedAt: "10 Jan 2025, 12:00",
    reviewedBy: "Admin DPBD",
    proofFile: "bukti_transfer_REQ004.pdf",
  },
]

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu Approval", color: "bg-amber-500/10 text-amber-600 border-0", icon: Clock },
  approved: { label: "Disetujui Admin", color: "bg-blue-500/10 text-blue-600 border-0", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "bg-red-500/10 text-red-600 border-0", icon: XCircle },
  completed: { label: "Selesai", color: "bg-emerald-500/10 text-emerald-600 border-0", icon: CheckCircle },
}

import type React from "react"

export default function FinancePendingPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [form, setForm] = useState({
    category: "",
    recipient: "",
    recipientBank: "",
    amount: "",
    notes: "",
  })

  const filteredRequests = requests.filter((r) => {
    if (searchQuery && !r.recipient.toLowerCase().includes(searchQuery.toLowerCase()) && !r.category.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    return true
  })

  const handleSubmit = () => {
    if (!form.category || !form.recipient || !form.amount) return
    const newReq = {
      id: `REQ-00${requests.length + 1}`,
      category: form.category,
      recipient: form.recipient,
      recipientBank: form.recipientBank,
      amount: Number(form.amount),
      notes: form.notes,
      status: "pending" as const,
      submittedAt: new Date().toLocaleString("id-ID"),
      reviewedAt: null,
      reviewedBy: null,
      proofFile: null,
    }
    setRequests((prev) => [newReq, ...prev])
    setForm({ category: "", recipient: "", recipientBank: "", amount: "", notes: "" })
    setIsCreateOpen(false)
  }

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    completed: requests.filter((r) => r.status === "completed").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pengajuan Penyaluran</h1>
          <p className="text-muted-foreground">Ajukan penyaluran dana ke penerima manfaat untuk disetujui Admin</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajukan Penyaluran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajukan Penyaluran Dana</DialogTitle>
              <DialogDescription>
                Pengajuan akan dikirim ke Admin untuk disetujui sebelum proses transfer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Kategori Program</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori distribusi" />
                  </SelectTrigger>
                  <SelectContent>
                    {disbursementCategories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nama Penerima / Lembaga</Label>
                <Input
                  placeholder="Contoh: Yayasan Pendidikan Indonesia"
                  value={form.recipient}
                  onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Rekening Tujuan</Label>
                <Input
                  placeholder="Contoh: BCA 1234567890 a.n. Yayasan..."
                  value={form.recipientBank}
                  onChange={(e) => setForm((f) => ({ ...f, recipientBank: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nominal (Rp)</Label>
                <Input
                  type="number"
                  placeholder="15000000"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Textarea
                  placeholder="Jelaskan tujuan penyaluran ini..."
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={!form.category || !form.recipient || !form.amount}>
                Kirim Pengajuan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alur Info */}
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl bg-muted/50 border text-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-bold">1</div>
          <span className="font-medium">Finance Ajukan</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
          <span className="font-medium">Admin Approve</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center text-xs font-bold">3</div>
          <span className="font-medium">Finance Transfer</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold">4</div>
          <span className="font-medium">Upload Bukti</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold">5</div>
          <span className="font-medium">Selesai</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Menunggu Approval</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Disetujui - Perlu Transfer</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari penerima atau program..."
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
            <SelectItem value="pending">Menunggu Approval</SelectItem>
            <SelectItem value="approved">Disetujui - Perlu Transfer</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredRequests.map((req) => {
          const cfg = statusConfig[req.status]
          const StatusIcon = cfg.icon
          return (
            <Card key={req.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{req.id}</span>
                      <Badge className={cfg.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {cfg.label}
                      </Badge>
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
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Rekening: </span>
                        <span>{req.recipientBank}</span>
                      </div>
                      {req.notes && (
                        <div className="col-span-2 text-muted-foreground text-xs">{req.notes}</div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Diajukan: {req.submittedAt}</p>
                    {req.reviewedAt && (
                      <p className="text-xs text-muted-foreground">
                        Direview oleh {req.reviewedBy} pada {req.reviewedAt}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {req.status === "approved" && !req.proofFile && (
                      <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href={`/finance/process?id=${req.id}&category=${encodeURIComponent(req.category)}&recipient=${encodeURIComponent(req.recipient)}&bank=${encodeURIComponent(req.recipientBank)}&amount=${req.amount}`}>
                          <Upload className="w-4 h-4 mr-1" />
                          Upload Bukti
                        </Link>
                      </Button>
                    )}
                    {req.status === "completed" && req.proofFile && (
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Lihat Bukti
                      </Button>
                    )}
                    {req.status === "pending" && (
                      <span className="text-xs text-muted-foreground italic self-center">Menunggu review Admin...</span>
                    )}
                    {req.status === "rejected" && (
                      <span className="text-xs text-red-500 italic self-center">Pengajuan ditolak Admin</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
