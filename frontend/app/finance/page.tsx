"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp, Wallet, ArrowRight, FileText, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const stats = [
  {
    title: "Pending Approval",
    value: "8",
    subtitle: "Menunggu proses",
    icon: Clock,
    color: "bg-amber-500/10 text-amber-600",
    bgGradient: "from-amber-500/5 to-amber-500/10",
  },
  {
    title: "Total Pending",
    value: "Rp 45.5M",
    subtitle: "Dari 8 penyaluran",
    icon: Wallet,
    color: "bg-blue-500/10 text-blue-600",
    bgGradient: "from-blue-500/5 to-blue-500/10",
  },
  {
    title: "Selesai Hari Ini",
    value: "12",
    subtitle: "+3 dari kemarin",
    icon: CheckCircle,
    color: "bg-emerald-500/10 text-emerald-600",
    bgGradient: "from-emerald-500/5 to-emerald-500/10",
    trend: "+33%",
  },
  {
    title: "Perlu Perhatian",
    value: "2",
    subtitle: "Verifikasi ulang",
    icon: AlertTriangle,
    color: "bg-red-500/10 text-red-600",
    bgGradient: "from-red-500/5 to-red-500/10",
  },
]

export default function FinanceOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Dashboard Finance
          </h1>
          <p className="text-muted-foreground">Monitor dan proses pencairan dana donasi</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="bg-transparent">
            <Link href="/finance/reconciliation">
              <FileText className="w-4 h-4 mr-2" />
              Rekonsiliasi
            </Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/finance/pending">
              <Clock className="w-4 h-4 mr-2" />
              Proses Pending
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-0 shadow-sm`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.trend && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-foreground/80">{stat.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Disbursements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Pending Disbursements</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Penyaluran dana yang menunggu proses</p>
            </div>
            <Button variant="outline" size="sm" asChild className="bg-transparent">
              <Link href="/finance/pending">
                Lihat Semua
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                id: "D-001",
                program: "Beasiswa Pendidikan",
                recipient: "Yayasan Pendidikan Indonesia",
                amount: "Rp 15.000.000",
                status: "waiting_transfer",
                date: "15 Jan 2025",
              },
              {
                id: "D-002",
                program: "UMKM Pelajar",
                recipient: "Koperasi Pelajar Jerman",
                amount: "Rp 8.500.000",
                status: "waiting_transfer",
                date: "14 Jan 2025",
              },
              {
                id: "D-003",
                program: "Kesehatan & Kesejahteraan",
                recipient: "Klinik Sosial Jakarta",
                amount: "Rp 12.000.000",
                status: "admin_approved",
                date: "13 Jan 2025",
              },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 hover:border-primary/20 transition-colors group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{item.id}</p>
                    <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                      {item.program}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.recipient}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold">{item.amount}</p>
                  <Badge 
                    className={
                      item.status === "admin_approved" 
                        ? "bg-emerald-500/10 text-emerald-600 border-0" 
                        : "bg-amber-500/10 text-amber-600 border-0"
                    }
                  >
                    {item.status === "admin_approved" ? "Siap Proses" : "Menunggu Transfer"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                action: "Transfer completed",
                detail: "D-045 - Rp 10.000.000 to Beasiswa Pendidikan",
                time: "10 menit yang lalu",
              },
              {
                action: "Proof uploaded",
                detail: "D-044 - Bukti transfer berhasil diunggah",
                time: "25 menit yang lalu",
              },
              {
                action: "Disbursement approved",
                detail: "D-046 - Admin menyetujui pencairan",
                time: "1 jam yang lalu",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border-l-2 border-primary/20 pl-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
