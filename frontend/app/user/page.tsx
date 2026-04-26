"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import {
  Heart,
  TrendingUp,
  FolderKanban,
  ArrowRight,
  GraduationCap,
  Briefcase,
  HeartPulse,
  Building2,
  Users,
  Award,
  Target,
  PieChart,
  FileText,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts"

// Personal donor stats
const personalStats = [
  { label: "Total Donasi", value: "Rp 5.500.000", icon: Heart, color: "bg-primary/10 text-primary" },
  { label: "Donasi Bulan Ini", value: "Rp 200.000", icon: TrendingUp, color: "bg-[#6B6B4B]/10 text-[#6B6B4B]" },
  { label: "Program Didukung", value: "4", icon: FolderKanban, color: "bg-[#D4C896]/20 text-[#5C1515]" },
]

// Company donor stats
const companyStats = [
  { label: "Total Kontribusi CSR", value: "Rp 125.000.000", icon: Building2, color: "bg-primary/10 text-primary" },
  { label: "Kontribusi Tahun Ini", value: "Rp 45.000.000", icon: TrendingUp, color: "bg-[#6B6B4B]/10 text-[#6B6B4B]" },
  { label: "Program Didukung", value: "8", icon: FolderKanban, color: "bg-[#D4C896]/20 text-[#5C1515]" },
  { label: "Karyawan Berpartisipasi", value: "156", icon: Users, color: "bg-[#B30000]/10 text-[#B30000]" },
]

const personalDonationHistory = [
  { month: "Jul", amount: 200000 },
  { month: "Agu", amount: 500000 },
  { month: "Sep", amount: 250000 },
  { month: "Okt", amount: 750000 },
  { month: "Nov", amount: 300000 },
  { month: "Des", amount: 500000 },
  { month: "Jan", amount: 200000 },
]

const companyDonationHistory = [
  { month: "Jul", amount: 15000000 },
  { month: "Agu", amount: 20000000 },
  { month: "Sep", amount: 18000000 },
  { month: "Okt", amount: 25000000 },
  { month: "Nov", amount: 22000000 },
  { month: "Des", amount: 30000000 },
  { month: "Jan", amount: 15000000 },
]

const companyImpactData = [
  { category: "Pendidikan", amount: 45000000 },
  { category: "UMKM", amount: 35000000 },
  { category: "Kesehatan", amount: 25000000 },
  { category: "Lingkungan", amount: 20000000 },
]

const suggestedPrograms = [
  {
    id: 1,
    name: "Beasiswa Pelajar Indonesia",
    category: "Pendidikan",
    icon: GraduationCap,
    progress: 78,
    target: 100000000,
    collected: 78500000,
    contributed: true,
  },
  {
    id: 2,
    name: "UMKM Diaspora",
    category: "UMKM",
    icon: Briefcase,
    progress: 60,
    target: 75000000,
    collected: 45200000,
    contributed: false,
  },
  {
    id: 3,
    name: "Kesehatan Masyarakat",
    category: "Kesehatan",
    icon: HeartPulse,
    progress: 100,
    target: 50000000,
    collected: 50000000,
    contributed: true,
  },
]

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

// Personal Dashboard Component
function PersonalDashboard({ userName }: { userName: string }) {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">Halo, {userName}!</h1>
        <p className="text-muted-foreground">Terima kasih telah menjadi bagian dari perubahan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personalStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Riwayat Donasi</CardTitle>
            <CardDescription>12 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={personalDonationHistory}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#5C1515"
                    strokeWidth={2}
                    dot={{ fill: "#5C1515", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-[#D4C896] hover:bg-[#D4C896]/90 text-[#0A0A0A]">
              <Link href="/donate">
                <Heart className="w-4 h-4 mr-2" />
                Donasi Sekarang
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/user/history">Lihat Riwayat Donasi</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/user/reports">Download Laporan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Programs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Program Rekomendasi</CardTitle>
            <CardDescription>Program yang mungkin Anda minati</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/user/programs">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedPrograms.map((program) => (
              <div key={program.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <program.icon className="w-5 h-5 text-primary" />
                  </div>
                  {program.contributed && (
                    <Badge className="bg-[#6B6B4B]/10 text-[#6B6B4B] hover:bg-[#6B6B4B]/20">Sudah Donasi</Badge>
                  )}
                </div>
                <h3 className="font-medium text-sm mb-1">{program.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{program.category}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{program.progress}%</span>
                    <span className="text-muted-foreground">{formatRupiah(program.target)}</span>
                  </div>
                  <Progress value={program.progress} className="h-1.5" />
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                  disabled={program.progress >= 100}
                >
                  {program.progress >= 100 ? "Target Tercapai" : "Donasi"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Company Dashboard Component
function CompanyDashboard({ companyName }: { companyName: string }) {
  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{companyName}</h1>
            <Badge className="bg-[#D4C896]/20 text-[#5C1515] border border-[#D4C896]">Corporate Partner</Badge>
          </div>
          <p className="text-muted-foreground">Dashboard CSR (Corporate Social Responsibility)</p>
        </div>
        <Button asChild className="bg-[#D4C896] hover:bg-[#D4C896]/90 text-[#0A0A0A]">
          <Link href="/donate">
            <Heart className="w-4 h-4 mr-2" />
            Donasi CSR
          </Link>
        </Button>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {companyStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSR Contribution Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tren Kontribusi CSR</CardTitle>
            <CardDescription>7 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={companyDonationHistory}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000000}jt`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#5C1515"
                    strokeWidth={2}
                    dot={{ fill: "#5C1515", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Impact Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Dampak CSR</CardTitle>
            <CardDescription>Per kategori program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyImpactData} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000000}jt`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5" }}
                  />
                  <Bar dataKey="amount" fill="#5C1515" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSR Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CSR Impact Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4C896]" />
              Dampak Sosial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Penerima Beasiswa</span>
              <span className="font-semibold">45 orang</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">UMKM Dibantu</span>
              <span className="font-semibold">23 usaha</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Wilayah Terjangkau</span>
              <span className="font-semibold">12 provinsi</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Program Selesai</span>
              <span className="font-semibold">6 program</span>
            </div>
          </CardContent>
        </Card>

        {/* Employee Giving Program */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6B6B4B]" />
              Employee Giving
            </CardTitle>
            <CardDescription>Program donasi karyawan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-[#6B6B4B]/5 border border-[#6B6B4B]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Partisipasi Karyawan</span>
                <span className="text-sm font-bold text-[#6B6B4B]">78%</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">156 dari 200 karyawan</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">Rp 12.500.000</p>
              <p className="text-sm text-muted-foreground">Total donasi karyawan bulan ini</p>
            </div>
            <Button variant="outline" className="w-full bg-transparent" size="sm">
              Kelola Program
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/user/reports">
                <FileText className="w-4 h-4 mr-2" />
                Download Laporan CSR
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/user/history">
                <Calendar className="w-4 h-4 mr-2" />
                Riwayat Kontribusi
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/user/programs">
                <PieChart className="w-4 h-4 mr-2" />
                Lihat Semua Program
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/user/profile">
                <Building2 className="w-4 h-4 mr-2" />
                Edit Profil Perusahaan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent CSR Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Aktivitas CSR Terbaru</CardTitle>
            <CardDescription>Donasi dan penyaluran terakhir</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/user/history">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "15 Jan 2025", program: "Beasiswa Pelajar Indonesia", amount: 15000000, type: "donation" },
              { date: "10 Jan 2025", program: "UMKM Diaspora", amount: 10000000, type: "donation" },
              { date: "5 Jan 2025", program: "Kesehatan Masyarakat", amount: 8000000, type: "donation" },
              { date: "28 Des 2024", program: "Bantuan Bencana Alam", amount: 12000000, type: "donation" },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#6B6B4B]/10">
                    <Heart className="w-4 h-4 text-[#6B6B4B]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.program}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatRupiah(activity.amount)}</p>
                  <Badge variant="outline" className="text-xs">
                    Berhasil
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UserDashboardPage() {
  const { user } = useAuth()
  const isCompany = user?.role === "company"

  if (isCompany) {
    return <CompanyDashboard companyName={user?.companyName || user?.name || "Perusahaan"} />
  }

  return <PersonalDashboard userName={user?.name?.split(" ")[0] || "Donatur"} />
}
