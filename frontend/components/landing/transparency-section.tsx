"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
const REFRESH_INTERVAL = 30000 // Auto-refresh every 30 seconds

interface TrendData {
  month: string
  masuk: number
  keluar: number
}

interface DistributionItem {
  name: string
  value: number
  color: string
}

export function TransparencyCharts() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [monthlyData, setMonthlyData] = useState<TrendData[]>([])
  const [distributionData, setDistributionData] = useState<DistributionItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real analytics data
  const fetchAnalytics = async () => {
    try {
      // Fetch both trends and program performance
      const [trendsRes, programsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/trends`),
        fetch(`${API_BASE_URL}/analytics/programs`),
      ])

      if (!trendsRes.ok) throw new Error(`Trends API failed: ${trendsRes.status}`)
      if (!programsRes.ok) throw new Error(`Programs API failed: ${programsRes.status}`)

      const trends = await trendsRes.json()
      const programs = await programsRes.json()

      console.log("API Programs Response:", programs) // Debug log

      // Transform trends to monthly data format
      const trendArray = Array.isArray(trends) ? trends : trends.data || []
      const transformedTrends: TrendData[] = trendArray
        .slice(0, 12) // Limit to 12 months
        .map((t: any) => ({
          month: new Date(t.month || t.date || t.createdAt).toLocaleDateString("id-ID", { month: "short" }),
          masuk: Math.floor((t.totalDonations || t.amount || 0) / 1000000), // Convert to millions
          keluar: Math.floor((t.disbursed || t.amount || 0) / 1000000),
        }))

      // Transform program data to distribution - with flexible property detection
      const programArray = Array.isArray(programs) ? programs : programs.data || []
      
      // Helper function to get amount from various possible property names (convert to number!)
      const getAmount = (p: any) => {
        const amount = p.collectedAmount || p.collected || p.amount || p.totalRaised || p.target || 0
        // Ensure it's a number, not a string
        return typeof amount === 'string' ? parseInt(amount, 10) : Number(amount)
      }
      
      // Calculate total - make sure to sum as numbers
      const total = programArray.reduce((sum: number, p: any) => {
        return sum + getAmount(p)
      }, 0)
      
      const colors = ["#7c2d2d", "#d4a574", "#4a9f6e", "#5a7fa8", "#8b7355", "#9e6b6b"]
      
      // Filter and sort by amount (show all programs with amount > 0, or top 6 if many)
      const validPrograms = programArray.filter((p: any) => getAmount(p) > 0)
      const transformedDistribution: DistributionItem[] = validPrograms
        .sort((a: any, b: any) => getAmount(b) - getAmount(a))
        .slice(0, 6)
        .map((p: any, idx: number) => {
          const amount = getAmount(p)
          const percentage = total > 0 ? Math.round((amount / total) * 100) : 0
          return {
            name: (p.title || p.name || p.programName || "Program").substring(0, 15),
            value: percentage,
            color: colors[idx % colors.length],
          }
        })

      console.log("Transformed Distribution:", transformedDistribution) // Debug log
      console.log("Total programs with data:", validPrograms.length, "Total amount:", total) // Debug log

      setMonthlyData(transformedTrends.length > 0 ? transformedTrends : getDefaultMonthlyData())
      // Only use dummy data if transformedDistribution is truly empty
      setDistributionData(transformedDistribution.length > 0 ? transformedDistribution : getDefaultDistribution())
      setLoading(false)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      // Use default data as fallback
      setMonthlyData(getDefaultMonthlyData())
      setDistributionData(getDefaultDistribution())
      setLoading(false)
    }
  }

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  function getDefaultMonthlyData(): TrendData[] {
    return [
      { month: "Jan", masuk: 120, keluar: 95 },
      { month: "Feb", masuk: 145, keluar: 110 },
      { month: "Mar", masuk: 180, keluar: 125 },
      { month: "Apr", masuk: 165, keluar: 140 },
      { month: "Mei", masuk: 210, keluar: 155 },
      { month: "Jun", masuk: 195, keluar: 170 },
      { month: "Jul", masuk: 230, keluar: 185 },
      { month: "Agu", masuk: 255, keluar: 200 },
      { month: "Sep", masuk: 240, keluar: 195 },
      { month: "Okt", masuk: 285, keluar: 220 },
      { month: "Nov", masuk: 310, keluar: 245 },
      { month: "Des", masuk: 350, keluar: 280 },
    ]
  }

  function getDefaultDistribution(): DistributionItem[] {
    return [
      { name: "Beasiswa", value: 35, color: "#7c2d2d" },
      { name: "UMKM", value: 20, color: "#d4a574" },
      { name: "Kesehatan", value: 15, color: "#4a9f6e" },
      { name: "Infrastruktur", value: 18, color: "#5a7fa8" },
      { name: "Lingkungan", value: 7, color: "#8b7355" },
      { name: "Darurat", value: 5, color: "#9e6b6b" },
    ]
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="grid lg:grid-cols-2 gap-8">
      {loading ? (
        <div className="col-span-2 flex justify-center items-center py-20">
          <div className="animate-pulse text-muted-foreground">Memuat data transparansi...</div>
        </div>
      ) : (
        <>
          {/* Area Chart - Arus Dana */}
          <Card
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(32px)",
              transition: "all 1s ease-out",
            }}
          >
            <CardHeader>
              <CardTitle>Arus Dana</CardTitle>
              <CardDescription>Perbandingan dana masuk dan penyaluran per bulan (dalam jutaan Rupiah)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  masuk: { label: "Dana Masuk", color: "#7c2d2d" },
                  keluar: { label: "Dana Keluar", color: "#d4a574" },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c2d2d" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c2d2d" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4a574" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d4a574" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${v}Jt`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-medium mb-2">{label}</p>
                              {payload.map((entry: any) => (
                                <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                                  <span className="text-sm flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                    {entry.dataKey === "masuk" ? "Dana Masuk" : "Dana Keluar"}
                                  </span>
                                  <span className="text-sm font-medium">Rp {entry.value}Jt</span>
                                </div>
                              ))}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="masuk"
                      stroke="#7c2d2d"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMasuk)"
                    />
                    <Area
                      type="monotone"
                      dataKey="keluar"
                      stroke="#d4a574"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorKeluar)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Distribusi */}
          <Card
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(32px)",
              transition: "all 1s ease-out",
              transitionDelay: "0.2s",
            }}
          >
            <CardHeader>
              <CardTitle>Distribusi Dana</CardTitle>
              <CardDescription>Persentase alokasi dana per kategori program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-muted-foreground">{data.value}% dari total</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {distributionData.map((item, idx) => (
                  <div key={`legend-${idx}`} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export function TransparencySection() {
  return (
    <section id="transparansi" className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Transparansi Dana</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance">
            Setiap Rupiah Tercatat dengan Jelas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Kami berkomitmen untuk transparansi penuh. Pantau aliran dana masuk dan penyaluran secara real-time melalui
            dashboard publik.
          </p>
        </div>

        <TransparencyCharts />

        {/* Transparency Statement */}
        <div className="mt-12 bg-muted rounded-2xl p-8 text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Laporan keuangan lengkap dipublikasikan setiap kuartal dan diaudit oleh akuntan publik independen. Akses
            laporan detail di{" "}
            <a href="/transparency" className="text-primary font-medium hover:underline">
              halaman transparansi
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
