"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Search,
  Filter,
  Download,
  Settings,
  Webhook,
  Key,
  Activity,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const webhookLogs = [
  {
    id: 1,
    timestamp: "2024-01-15 14:32:15",
    orderId: "DPBD-2024-001234",
    transactionId: "txn_abc123def456",
    midtransStatus: "settlement",
    internalStatus: "success",
    synced: true,
    amount: 500000,
    paymentType: "bank_transfer",
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:28:45",
    orderId: "DPBD-2024-001233",
    transactionId: "txn_xyz789ghi012",
    midtransStatus: "settlement",
    internalStatus: "success",
    synced: true,
    amount: 1000000,
    paymentType: "qris",
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:15:30",
    orderId: "DPBD-2024-001232",
    transactionId: "txn_mno345pqr678",
    midtransStatus: "settlement",
    internalStatus: "pending",
    synced: false,
    amount: 250000,
    paymentType: "bank_transfer",
  },
  {
    id: 4,
    timestamp: "2024-01-15 13:55:12",
    orderId: "DPBD-2024-001231",
    transactionId: "txn_stu901vwx234",
    midtransStatus: "expire",
    internalStatus: "expired",
    synced: true,
    amount: 750000,
    paymentType: "bank_transfer",
  },
  {
    id: 5,
    timestamp: "2024-01-15 13:42:08",
    orderId: "DPBD-2024-001230",
    transactionId: "txn_yza567bcd890",
    midtransStatus: "deny",
    internalStatus: "failed",
    synced: true,
    amount: 2000000,
    paymentType: "credit_card",
  },
]

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

export default function MidtransPage() {
  const [showServerKey, setShowServerKey] = useState(false)
  const [showClientKey, setShowClientKey] = useState(false)
  const [selectedLog, setSelectedLog] = useState<(typeof webhookLogs)[0] | null>(null)
  const [isSandbox, setIsSandbox] = useState(true)

  const getStatusBadge = (midtransStatus: string, synced: boolean) => {
    if (!synced) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Mismatch
        </Badge>
      )
    }
    switch (midtransStatus) {
      case "settlement":
        return (
          <Badge className="bg-success/10 text-success hover:bg-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Settlement
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
            <Activity className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "expire":
        return (
          <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      case "deny":
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        )
      default:
        return <Badge variant="outline">{midtransStatus}</Badge>
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Midtrans & Rekonsiliasi</h1>
          <p className="text-muted-foreground">Kelola integrasi payment gateway dan sinkronisasi transaksi</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export Log
        </Button>
      </div>

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status" className="gap-2">
            <Settings className="w-4 h-4" />
            Status API
          </TabsTrigger>
          <TabsTrigger value="webhook" className="gap-2">
            <Webhook className="w-4 h-4" />
            Webhook Log
          </TabsTrigger>
          <TabsTrigger value="keys" className="gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="mt-6 space-y-6">
          {/* Integration Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status Koneksi</p>
                    <p className="text-2xl font-bold text-success">Terhubung</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Environment</p>
                    <p className="text-2xl font-bold">{isSandbox ? "Sandbox" : "Production"}</p>
                  </div>
                  <Badge variant={isSandbox ? "secondary" : "default"}>{isSandbox ? "Testing" : "Live"}</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaksi Hari Ini</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <div className="text-sm text-success">+12% dari kemarin</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Transaksi (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                  <p className="text-sm text-muted-foreground">Settlement</p>
                  <p className="text-2xl font-bold text-success">156</p>
                  <p className="text-xs text-success">Rp 245.5 Juta</p>
                </div>
                <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">12</p>
                  <p className="text-xs text-yellow-600">Rp 18.2 Juta</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-muted-foreground">8</p>
                  <p className="text-xs text-muted-foreground">Rp 6.5 Juta</p>
                </div>
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <p className="text-sm text-muted-foreground">Failed/Denied</p>
                  <p className="text-2xl font-bold text-destructive">3</p>
                  <p className="text-xs text-destructive">Rp 4.0 Juta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status Metode Pembayaran</CardTitle>
              <CardDescription>Metode pembayaran yang aktif di Midtrans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Bank Transfer (VA)", status: "active", icon: "🏦" },
                  { name: "QRIS", status: "active", icon: "📱" },
                  { name: "Credit Card", status: "active", icon: "💳" },
                  { name: "GoPay", status: "inactive", icon: "💚" },
                ].map((method) => (
                  <div
                    key={method.name}
                    className={`p-4 rounded-lg border ${method.status === "active" ? "bg-success/5 border-success/20" : "bg-muted/50"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{method.icon}</span>
                      <Badge variant={method.status === "active" ? "default" : "secondary"}>
                        {method.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{method.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhook Log Tab */}
        <TabsContent value="webhook" className="mt-6 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Cari Order ID atau Transaction ID..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="settlement">Settlement</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expire">Expired</SelectItem>
                    <SelectItem value="deny">Denied</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sync Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="synced">Synced</SelectItem>
                    <SelectItem value="mismatch">Mismatch</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Logs Table */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Waktu</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment Type</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Midtrans Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sync</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {webhookLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4 text-sm text-muted-foreground">{log.timestamp}</td>
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{log.orderId}</code>
                      </td>
                      <td className="p-4 text-sm capitalize">{log.paymentType.replace("_", " ")}</td>
                      <td className="p-4 text-right font-medium text-sm">{formatRupiah(log.amount)}</td>
                      <td className="p-4">{getStatusBadge(log.midtransStatus, log.synced)}</td>
                      <td className="p-4">
                        {log.synced ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                            Detail
                          </Button>
                          {!log.synced && (
                            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                              <RefreshCw className="w-3 h-3" />
                              Re-sync
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi API Keys</CardTitle>
              <CardDescription>Kelola kredensial Midtrans untuk integrasi pembayaran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Environment Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Environment Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {isSandbox ? "Sandbox mode untuk testing" : "Production mode untuk transaksi nyata"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={isSandbox ? "text-muted-foreground" : "font-medium"}>Production</span>
                  <Switch checked={isSandbox} onCheckedChange={setIsSandbox} />
                  <span className={isSandbox ? "font-medium" : "text-muted-foreground"}>Sandbox</span>
                </div>
              </div>

              {/* Server Key */}
              <div className="space-y-2">
                <Label>Server Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showServerKey ? "text" : "password"}
                      value="SB-Mid-server-xxxxxxxxxxxxxxxxxxxxx"
                      readOnly
                      className="pr-20 font-mono text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                      onClick={() => setShowServerKey(!showServerKey)}
                    >
                      {showServerKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard("SB-Mid-server-xxx")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gunakan di server-side untuk autentikasi API Midtrans. Jangan expose di client.
                </p>
              </div>

              {/* Client Key */}
              <div className="space-y-2">
                <Label>Client Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showClientKey ? "text" : "password"}
                      value="SB-Mid-client-xxxxxxxxxxxxxxxxxxxxx"
                      readOnly
                      className="pr-20 font-mono text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                      onClick={() => setShowClientKey(!showClientKey)}
                    >
                      {showClientKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard("SB-Mid-client-xxx")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Gunakan di client-side untuk Snap.js integration.</p>
              </div>

              {/* Webhook URL */}
              <div className="space-y-2">
                <Label>Webhook Notification URL</Label>
                <div className="flex gap-2">
                  <Input value="https://dpbd.org/api/midtrans/webhook" readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard("https://dpbd.org/api/midtrans/webhook")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Masukkan URL ini di Midtrans Dashboard {">"} Settings {">"} Configuration {">"} Payment Notification
                  URL
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button>Simpan Perubahan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Webhook Log</DialogTitle>
            <DialogDescription>Informasi lengkap callback dari Midtrans</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{selectedLog.orderId}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{selectedLog.transactionId}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatRupiah(selectedLog.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <p className="font-medium capitalize">{selectedLog.paymentType.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Midtrans Status</p>
                  {getStatusBadge(selectedLog.midtransStatus, selectedLog.synced)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Internal Status</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedLog.internalStatus}
                  </Badge>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Raw Payload</p>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40">
                  {JSON.stringify(
                    {
                      order_id: selectedLog.orderId,
                      transaction_id: selectedLog.transactionId,
                      transaction_status: selectedLog.midtransStatus,
                      payment_type: selectedLog.paymentType,
                      gross_amount: selectedLog.amount,
                      transaction_time: selectedLog.timestamp,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
              {!selectedLog.synced && (
                <Button className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Re-sync Transaksi Ini
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
