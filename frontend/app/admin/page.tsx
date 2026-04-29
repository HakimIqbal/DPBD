"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MoreHorizontal,
  Activity,
  Target,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react"
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Link from "next/link"

// Default/fallback data if API fails
const DEFAULT_STATS = [
  {
    label: "Total Dana Masuk",
    value: "Rp 0",
    change: "0%",
    trend: "up",
    icon: ArrowDownToLine,
    color: "bg-emerald-500/10 text-emerald-600",
    bgGradient: "from-emerald-500/5 to-emerald-500/10",
  },
  {
    label: "Total Dana Keluar",
    value: "Rp 0",
    change: "0%",
    trend: "up",
    icon: ArrowUpFromLine,
    color: "bg-primary/10 text-primary",
    bgGradient: "from-primary/5 to-primary/10",
  },
  {
    label: "Saldo Tersedia",
    value: "Rp 0",
    change: "0%",
    trend: "up",
    icon: Wallet,
    color: "bg-amber-500/10 text-amber-600",
    bgGradient: "from-amber-500/5 to-amber-500/10",
  },
  {
    label: "Donatur Bulan Ini",
    value: "0",
    change: "0",
    trend: "up",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
    bgGradient: "from-blue-500/5 to-blue-500/10",
  },
]

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

// Custom tooltip component to fix label error
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium">{entry.name}</span>
              <span className="ml-auto font-mono text-sm font-medium">{formatRupiah(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [chartData, setChartData] = useState<any[]>([])
  const [distributionData, setDistributionData] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:3001/api/analytics/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("dpbd_token")}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const data = await response.json()

        // Format stats from API response
        if (data.statistics) {
          const newStats = [
            {
              ...DEFAULT_STATS[0],
              value: formatRupiah(data.statistics.totalIncome || 0),
              change: `+${data.statistics.incomeChange || 0}%`,
            },
            {
              ...DEFAULT_STATS[1],
              value: formatRupiah(data.statistics.totalOutcome || 0),
              change: `+${data.statistics.outcomeChange || 0}%`,
            },
            {
              ...DEFAULT_STATS[2],
              value: formatRupiah(data.statistics.balance || 0),
              change: `+${data.statistics.balanceChange || 0}%`,
            },
            {
              ...DEFAULT_STATS[3],
              value: String(data.statistics.donorCount || 0),
              change: `+${data.statistics.donorCountChange || 0}`,
            },
          ]
          setStats(newStats)
        }

        // Format chart data
        if (data.monthlyTrends) {
          setChartData(data.monthlyTrends)
        }

        // Format distribution data
        if (data.programDistribution) {
          setDistributionData(data.programDistribution)
        }

        // Format recent transactions
        if (data.recentDonations) {
          setRecentTransactions(data.recentDonations)
        }

        // Format activity log
        if (data.activityLog) {
          setActivityLog(data.activityLog)
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard data")
        // Keep using default/empty data on error
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">Ringkasan aktivitas donasi dan penyaluran dana DPBD</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Calendar className="w-4 h-4 mr-2" />
            Januari 2025
          </Button>
          <Button asChild size="sm" className="bg-primary">
            <Link href="/admin/reports">
              <Activity className="w-4 h-4 mr-2" />
              Laporan
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-0 shadow-sm`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <Badge
                  variant="secondary"
                  className={`${stat.trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"} border-0`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Arus Dana</CardTitle>
              <CardDescription>Dana masuk vs dana keluar per bulan</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              Lihat Detail <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5c1a1a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5c1a1a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000000}jt`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="masuk"
                    stroke="#22c55e"
                    fill="url(#colorMasuk)"
                    strokeWidth={2}
                    name="Dana Masuk"
                  />
                  <Area
                    type="monotone"
                    dataKey="keluar"
                    stroke="#5c1a1a"
                    fill="url(#colorKeluar)"
                    strokeWidth={2}
                    name="Dana Keluar"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribusi Program</CardTitle>
            <CardDescription>Persentase per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
            <CardDescription>5 transaksi donasi terakhir</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Tanggal</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Donatur</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Program</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Channel</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Gross</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Fee</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Net</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((trx) => (
                  <tr key={trx.id} className="border-b last:border-0">
                    <td className="py-3 text-sm">{trx.date}</td>
                    <td className="py-3 text-sm font-medium">{trx.donor}</td>
                    <td className="py-3 text-sm text-muted-foreground">{trx.program}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="font-normal">
                        {trx.channel}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-right">{formatRupiah(trx.gross)}</td>
                    <td className="py-3 text-sm text-right text-muted-foreground">{formatRupiah(trx.fee)}</td>
                    <td className="py-3 text-sm text-right font-medium">{formatRupiah(trx.net)}</td>
                    <td className="py-3">
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
                    <td className="py-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktivitas Terakhir</CardTitle>
          <CardDescription>Log aktivitas sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-16 text-sm text-muted-foreground">{log.time}</div>
                <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                <div>
                  <p className="text-sm">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
