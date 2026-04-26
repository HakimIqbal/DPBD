"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Search, Eye, CheckCircle, FileText, TrendingDown } from "lucide-react"

const completedDisbursements = [
  {
    id: "REQ-004",
    category: "Bantuan Darurat Gaza",
    recipient: "Palang Merah Indonesia",
    recipientBank: "BCA 1122334455 a.n. PMI",
    amount: 50000000,
    transferDate: "10 Jan 2025, 14:23",
    reference: "TRF20250110001",
    proofFile: "bukti_transfer_REQ004.pdf",
    notes: "Bantuan kemanusiaan tahap 4",
    processedBy: "Finance DPBD",
    approvedBy: "Admin DPBD",
  },
  {
    id: "REQ-007",
    category: "Beasiswa Pelajar Indonesia",
    recipient: "Yayasan Bintang Harapan",
    recipientBank: "Mandiri 9988776655 a.n. YBH",
    amount: 10000000,
    transferDate: "8 Jan 2025, 10:05",
    reference: "TRF20250108002",
    proofFile: "bukti_transfer_REQ007.pdf",
    notes: "Beasiswa semester genap batch 2",
    processedBy: "Finance DPBD",
    approvedBy: "Admin DPBD",
  },
  {
    id: "REQ-005",
    category: "UMKM Diaspora",
    recipient: "Koperasi Mahasiswa Eropa",
    recipientBank: "BNI 5544332211 a.n. KME",
    amount: 7500000,
    transferDate: "5 Jan 2025, 09:30",
    reference: "TRF20250105001",
    proofFile: "bukti_transfer_REQ005.pdf",
    notes: "Modal usaha batch 2",
    processedBy: "Finance DPBD",
    approvedBy: "Admin DPBD",
  },
]

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)

export default function FinanceCompletedPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [detailItem, setDetailItem] = useState<(typeof completedDisbursements)[0] | null>(null)

  const categories = [...new Set(completedDisbursements.map((d) => d.category))]

  const filtered = completedDisbursements.filter((d) => {
    if (search && !d.recipient.toLowerCase().includes(search.toLowerCase()) && !d.id.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false
    return true
  })

  const totalCompleted = completedDisbursements.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Penyaluran Selesai</h1>
          <p className="text-muted-foreground">Riwayat penyaluran dana yang sudah ditransfer dan diverifikasi</p>
        </div>
        <Button variant="outline" className="bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Export Riwayat
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedDisbursements.length}</p>
              <p className="text-xs text-muted-foreground">Total Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 md:col-span-2">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <TrendingDown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatRupiah(totalCompleted)}</p>
              <p className="text-xs text-muted-foreground">Total Dana Tersalurkan</p>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{item.id}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Selesai
                    </Badge>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Penerima: </span>
                      <span className="font-medium">{item.recipient}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nominal: </span>
                      <span className="font-bold text-primary">{formatRupiah(item.amount)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tanggal: </span>
                      <span>{item.transferDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ref: </span>
                      <span className="font-mono text-xs">{item.reference}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diproses oleh {item.processedBy} &middot; Disetujui oleh {item.approvedBy}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() => setDetailItem(item)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detail
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <FileText className="w-4 h-4 mr-1" />
                    Bukti
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Penyaluran {detailItem?.id}</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="font-bold">{detailItem.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kategori</p>
                    <p className="font-medium">{detailItem.category}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Penerima</p>
                    <p className="font-medium">{detailItem.recipient}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Rekening</p>
                    <p>{detailItem.recipientBank}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nominal</p>
                    <p className="font-bold text-primary text-base">{formatRupiah(detailItem.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Transfer</p>
                    <p>{detailItem.transferDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Nomor Referensi</p>
                    <p className="font-mono">{detailItem.reference}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Keterangan</p>
                    <p>{detailItem.notes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Diproses Oleh</p>
                    <p>{detailItem.processedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disetujui Oleh</p>
                    <p>{detailItem.approvedBy}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700">
                  Penyaluran ini telah selesai dan bukti transfer tersimpan sebagai <span className="font-mono font-medium">{detailItem.proofFile}</span>
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
