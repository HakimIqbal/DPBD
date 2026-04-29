"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Download, Filter, Eye, Calendar, ArrowDownToLine, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"

const DEFAULT_DONATIONS: any[] = []

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>(DEFAULT_DONATIONS)
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof donations)[0] | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [channelFilter, setChannelFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:3001/api/donations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("dpbd_token")}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch donations")
        }

        const data = await response.json()
        setDonations(Array.isArray(data) ? data : data.data || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching donations:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch donations")
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [])

  const filteredDonations = donations.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false
    if (channelFilter !== "all" && !d.channel.toLowerCase().includes(channelFilter.toLowerCase())) return false
    return true
  })

  const stats = {
    total: donations.reduce((sum, d) => sum + (d.status === "success" ? d.net : 0), 0),
    success: donations.filter((d) => d.status === "success").length,
    pending: donations.filter((d) => d.status === "pending").length,
    failed: donations.filter((d) => d.status === "failed").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data donasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Donasi Masuk</h1>
          <p className="text-muted-foreground">Kelola semua transaksi donasi yang masuk</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <ArrowDownToLine className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Berhasil</p>
              <p className="text-lg font-bold">{formatRupiah(stats.total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sukses</p>
              <p className="text-lg font-bold">{stats.success} Transaksi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-lg font-bold">{stats.pending} Transaksi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gagal</p>
              <p className="text-lg font-bold">{stats.failed} Transaksi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Cari donatur, order ID..." className="pl-10" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Calendar className="w-4 h-4" />
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="success">Sukses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Channel</SelectItem>
                  <SelectItem value="va">Virtual Account</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="gopay">GoPay</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter Lainnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tanggal</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Donatur</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Program</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Channel</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Gross</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Net</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((trx) => (
                  <tr key={trx.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4 text-sm">{trx.date}</td>
                    <td className="p-4 text-sm font-mono text-xs">{trx.orderId}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium">{trx.donor}</p>
                        <p className="text-xs text-muted-foreground">{trx.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{trx.program}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-normal">
                        {trx.channel}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-right">{formatRupiah(trx.gross)}</td>
                    <td className="p-4 text-sm text-right font-medium">{formatRupiah(trx.net)}</td>
                    <td className="p-4">
                      <Badge
                        className={
                          trx.status === "success"
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : trx.status === "pending"
                              ? "bg-warning/10 text-warning hover:bg-warning/20"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        }
                      >
                        {trx.status === "success" ? "Sukses" : trx.status === "pending" ? "Pending" : "Gagal"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(trx)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>Order ID: {selectedTransaction?.orderId}</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={
                      selectedTransaction.status === "success"
                        ? "bg-success/10 text-success mt-1"
                        : selectedTransaction.status === "pending"
                          ? "bg-warning/10 text-warning mt-1"
                          : "bg-destructive/10 text-destructive mt-1"
                    }
                  >
                    {selectedTransaction.status === "success"
                      ? "Sukses"
                      : selectedTransaction.status === "pending"
                        ? "Pending"
                        : "Gagal"}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Donasi</p>
                  <p className="text-xl font-bold">{formatRupiah(selectedTransaction.gross)}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Donatur</p>
                  <p className="font-medium">{selectedTransaction.donor}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipe</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {selectedTransaction.donorType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-medium">{selectedTransaction.program}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Channel Pembayaran</p>
                  <p className="font-medium">{selectedTransaction.channel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Biaya (Fee)</p>
                  <p className="font-medium">{formatRupiah(selectedTransaction.fee)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Amount</p>
                  <p className="font-medium text-success">{formatRupiah(selectedTransaction.net)}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-sm font-medium mb-3">Timeline</p>
                <div className="space-y-3">
                  {selectedTransaction.timeline.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.status === "settled" || item.status === "paid"
                            ? "bg-success"
                            : item.status === "expired"
                              ? "bg-destructive"
                              : "bg-muted-foreground"
                        }`}
                      />
                      <span className="text-sm text-muted-foreground w-20">{item.time}</span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
