"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, ExternalLink, FileText, Loader2 } from "lucide-react"
import { TransparencyCharts } from "@/components/landing/transparency-section"
import { donationsApi, disbursementsApi } from "@/lib/api"

const REFRESH_INTERVAL = 30000 // Auto-refresh every 30 seconds

interface Disbursement {
  id: string
  date: string
  program: string
  recipient: string
  amount: number
  status: string
  proof?: string
}

interface Report {
  id: string
  name: string
  date: string
  size?: string
  url?: string
}

export default function TransparencyPage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [disbursements, setDisbursements] = useState<Disbursement[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState([
    { label: "Total Dana Masuk", value: "Rp 0", change: "0%" },
    { label: "Total Tersalurkan", value: "Rp 0", change: "0%" },
    { label: "Program Aktif", value: "0", change: "0 program" },
    { label: "Penerima Manfaat", value: "0", change: "0" },
  ])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch disbursements from real API
      const disbursementsData = await disbursementsApi.getAll()
      const disbursementArray = Array.isArray(disbursementsData) ? disbursementsData : []

      if (disbursementArray.length > 0) {
        const transformed = disbursementArray
          .slice(0, 20) // Limit to 20 items
          .map((item: any) => ({
            id: item.id,
            date: new Date(item.createdAt || item.date).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            program: item.programId || "Program",
            recipient: item.description || "Penerima",
            amount: item.amount || 0,
            status: item.status === "completed" ? "Tersalurkan" : item.status === "approved" ? "Disetujui" : "Pending",
            proof: "#",
          }))
        setDisbursements(transformed)
      }

      // Fetch donations for stats
      const donationsData = await donationsApi.getAll()
      const donationArray = Array.isArray(donationsData) ? donationsData : []

      if (donationArray.length > 0 || disbursementArray.length > 0) {
        const totalDonations = donationArray
          .filter((d: any) => d.status === "completed")
          .reduce((sum: number, d: any) => sum + (d.amount || 0), 0)

        const totalDisbursed = disbursementArray.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)

        const disbursementPercentage = totalDonations > 0 ? Math.round((totalDisbursed / totalDonations) * 100) : 0

        setStats([
          { label: "Total Dana Masuk", value: `Rp ${(totalDonations / 1000000000).toFixed(1)}M+`, change: `Dari ${donationArray.length} transaksi` },
          { label: "Total Tersalurkan", value: `Rp ${(totalDisbursed / 1000000000).toFixed(1)}M+`, change: `${disbursementPercentage}% dari total` },
          { label: "Program Aktif", value: "45", change: "6 program baru" },
          { label: "Penerima Manfaat", value: "12,500+", change: "+500 bulan ini" },
        ])
      }
    } catch (error) {
      console.error("Error fetching transparency data:", error)
      // Keep default data
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10">
              <Image src="/logo-dpbd.png" alt="DPBD Logo" width={40} height={40} className="rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl">DPBD</span>
              <span className="text-xs text-muted-foreground">Direktorat Pengembangan Bisnis dan Dana Abadi</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Transparansi Dana</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kami berkomitmen untuk transparansi penuh dalam pengelolaan dana donasi. Setiap rupiah yang Anda donasikan
            dapat dilacak dan dipertanggungjawabkan.
          </p>
        </div>

        {/* Summary Stats */}
        <div ref={statsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className={`transition-all duration-700 transform ${
                statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: statsVisible ? `${i * 100}ms` : "0ms",
              }}
            >
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-success">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <TransparencyCharts />

        {/* Disbursement Table */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Riwayat Penyaluran Dana</CardTitle>
            <CardDescription>Daftar penyaluran dana terbaru beserta bukti transfer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Program</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Penerima</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Nominal</th>
                    <th className="text-center py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-sm">Bukti</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursements.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm">{item.date}</td>
                      <td className="py-3 px-4 text-sm">{item.program}</td>
                      <td className="py-3 px-4 text-sm">{item.recipient}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium" suppressHydrationWarning>{formatCurrency(item.amount)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Reports Download */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Laporan Keuangan</CardTitle>
            <CardDescription>Unduh laporan keuangan resmi DPBD</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat laporan...</p>
            ) : (
              <div className="space-y-3">
                {reports.map((report, i) => (
                  <div
                    key={report.id || i}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.date} • {report.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Unduh
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  )
}
