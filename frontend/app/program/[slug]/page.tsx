'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Share2, MapPin, Calendar, Users, CheckCircle2, Loader2 } from "lucide-react"
import { programsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Program {
  id: string
  title: string
  description: string
  category: string
  targetAmount: number
  raisedAmount: number
  imageUrl?: string
  location?: string
  deadline?: string
  status: string
}

interface Stats {
  totalDonors: number
  totalDonations: number
  averageDonation: number
}

export default function ProgramDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { toast } = useToast()

  const [program, setProgram] = useState<Program | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgram()
  }, [slug])

  const fetchProgram = async () => {
    setLoading(true)
    try {
      // Try to fetch by slug (ID)
      const programData = await programsApi.getById(slug)
      setProgram(programData)

      // Fetch stats
      const statsData = await programsApi.getStats(slug)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching program:', error)
      toast({
        title: "Error",
        description: "Gagal memuat program. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat program...</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Program Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-4">Program yang Anda cari tidak tersedia.</p>
          <Link href="/program">
            <Button>Kembali ke Daftar Program</Button>
          </Link>
        </div>
      </div>
    )
  }

  const progress = (program.raisedAmount / program.targetAmount) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl">DPBD</span>
          </Link>
          <Link href="/program">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Semua Program
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Image */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
          {program.imageUrl ? (
            <img
              src={program.imageUrl}
              alt={program.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Tidak ada gambar</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Badge className="mb-3">{program.category}</Badge>
                  <h1 className="text-2xl md:text-3xl font-bold mb-4">{program.title}</h1>

                  {/* Quick Stats */}
                  {(program.location || program.deadline) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {program.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{program.location}</span>
                        </div>
                      )}
                      {program.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{program.deadline}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">{program.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Donation Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-2xl font-bold text-primary">{formatCurrency(program.raisedAmount)}</span>
                    </div>
                    <Progress value={progress} className="h-3 mb-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{Math.round(progress)}% tercapai</span>
                      <span>Target: {formatCurrency(program.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  {stats && (
                    <div className="grid grid-cols-2 gap-4 py-4 border-y">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{stats.totalDonors}</p>
                        <p className="text-sm text-muted-foreground">Donatur</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{formatCurrency(stats.averageDonation)}</p>
                        <p className="text-sm text-muted-foreground">Rata-rata</p>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <Link href={`/donate?program=${program.id}`}>
                    <Button className="w-full" size="lg">
                      <Heart className="w-4 h-4 mr-2" />
                      Donasi Sekarang
                    </Button>
                  </Link>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Share2 className="w-4 h-4 mr-2" />
                    Bagikan
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Dana disalurkan 100% transparan melalui DPBD
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-16" />
      </main>
    </div>
  )
}
