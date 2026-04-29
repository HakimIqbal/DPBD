'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wallet, TrendingUp, CheckCircle, Clock, DollarSign, Users, BarChart3, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { donationsApi, disbursementsApi, usersApi } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

interface Donation {
  id: string
  userId: string
  programId: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: string
  createdAt: string
}

interface Disbursement {
  id: string
  programId: string
  amount: number
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  description: string
  createdAt: string
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [donations, setDonations] = useState<Donation[]>([])
  const [disbursements, setDisbursements] = useState<Disbursement[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch donations with fallback
        const donationData = await donationsApi.getAll()
        setDonations(Array.isArray(donationData) ? donationData : [])

        // Fetch disbursements with fallback
        const disbursementData = await disbursementsApi.getAll()
        setDisbursements(Array.isArray(disbursementData) ? disbursementData : [])

        // Fetch users with fallback
        const userData = await usersApi.getAll()
        setUsers(Array.isArray(userData) ? userData : [])
      } catch (error) {
        console.warn('Error fetching report data, using empty data:', error)
        // Continue with empty arrays instead of showing error toast
        setDonations([])
        setDisbursements([])
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Calculate statistics
  const totalDonations = donations.reduce((sum, d) => (d.status === 'completed' ? sum + d.amount : sum), 0)
  const completedDonations = donations.filter((d) => d.status === 'completed').length
  const pendingDonations = donations.filter((d) => d.status === 'pending').length
  const failedDonations = donations.filter((d) => d.status === 'failed').length

  const totalDisbursements = disbursements.reduce((sum, d) => sum + d.amount, 0)
  const approvedDisbursements = disbursements.filter((d) => d.status === 'approved').length
  const completedDisbursements = disbursements.filter((d) => d.status === 'completed').length
  const pendingDisbursements = disbursements.filter((d) => d.status === 'pending').length

  const donorCount = new Set(donations.map((d) => d.userId)).size
  const activeUsers = users.filter((u) => u.status === 'active').length

  // Group donations by date for chart
  const getDonationsByDate = () => {
    const grouped = donations
      .filter((d) => d.status === 'completed')
      .reduce(
        (acc, d) => {
          const date = new Date(d.createdAt).toLocaleDateString('id-ID', { month: '2-digit', day: '2-digit' })
          acc[date] = (acc[date] || 0) + d.amount
          return acc
        },
        {} as Record<string, number>
      )

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    return {
      labels: sortedDates.slice(-10),
      data: sortedDates.slice(-10).map((d) => grouped[d]),
    }
  }

  // Group disbursements by status
  const getDisbursementsByStatus = () => {
    return {
      labels: ['Pending', 'Approved', 'Completed', 'Rejected'],
      data: [
        disbursements.filter((d) => d.status === 'pending').length,
        disbursements.filter((d) => d.status === 'approved').length,
        disbursements.filter((d) => d.status === 'completed').length,
        disbursements.filter((d) => d.status === 'rejected').length,
      ],
    }
  }

  const donationChartData = getDonationsByDate()
  const disbursementChartData = getDisbursementsByStatus()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
        <p className="text-muted-foreground">Dashboard lengkap untuk monitoring donasi dan penyaluran dana</p>
      </div>

      {/* No Data Notice */}
      {donations.length === 0 && disbursements.length === 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Catatan:</strong> Untuk melihat laporan dengan data real donasi dan penyaluran, pastikan backend API sedang berjalan. Saat ini menampilkan status kosong karena belum ada data.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Donasi</p>
                <p className="text-2xl font-bold">{formatRupiah(totalDonations)}</p>
                <p className="text-xs text-muted-foreground mt-2">{completedDonations} donasi selesai</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Penyaluran</p>
                <p className="text-2xl font-bold">{formatRupiah(totalDisbursements)}</p>
                <p className="text-xs text-muted-foreground mt-2">{completedDisbursements} selesai</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Jumlah Donor</p>
                <p className="text-2xl font-bold">{donorCount}</p>
                <p className="text-xs text-muted-foreground mt-2">Dari {activeUsers} user aktif</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Donasi</p>
                <p className="text-2xl font-bold">{pendingDonations}</p>
                <p className="text-xs text-muted-foreground mt-2">{failedDonations} gagal</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Donasi</CardTitle>
            <CardDescription>Ringkasan status donasi saat ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Selesai</span>
              </div>
              <span className="font-semibold">{completedDonations}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span>Pending</span>
              </div>
              <span className="font-semibold">{pendingDonations}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-500" />
                <span>Gagal</span>
              </div>
              <span className="font-semibold">{failedDonations}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{donations.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disbursement Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Penyaluran</CardTitle>
            <CardDescription>Ringkasan status penyaluran dana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Selesai</span>
              </div>
              <span className="font-semibold">{completedDisbursements}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span>Disetujui</span>
              </div>
              <span className="font-semibold">{approvedDisbursements}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span>Pending</span>
              </div>
              <span className="font-semibold">{pendingDisbursements}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{disbursements.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Donasi (10 Hari Terakhir)</CardTitle>
            <CardDescription>Perkembangan jumlah donasi selesai</CardDescription>
          </CardHeader>
          <CardContent>
            {donationChartData.labels.length > 0 ? (
              <Line
                data={{
                  labels: donationChartData.labels,
                  datasets: [
                    {
                      label: 'Jumlah Donasi',
                      data: donationChartData.data,
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { callback: (value) => formatRupiah(value as number) },
                    },
                  },
                }}
              />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-muted-foreground">Data donasi tidak tersedia</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disbursement Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Penyaluran</CardTitle>
            <CardDescription>Distribusi status penyaluran dana</CardDescription>
          </CardHeader>
          <CardContent>
            {disbursementChartData.data.some((v) => v > 0) ? (
              <Doughnut
                data={{
                  labels: disbursementChartData.labels,
                  datasets: [
                    {
                      data: disbursementChartData.data,
                      backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f87171'],
                      borderColor: ['#fff', '#fff', '#fff', '#fff'],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-muted-foreground">Data penyaluran tidak tersedia</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Donasi Terbaru</CardTitle>
            <CardDescription>Daftar donasi terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            {donations.length > 0 ? (
              <div className="space-y-3">
                {donations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{formatRupiah(donation.amount)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(donation.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <Badge
                      className={
                        donation.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : donation.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                      }
                    >
                      {donation.status === 'completed' ? 'Selesai' : donation.status === 'pending' ? 'Pending' : 'Gagal'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>Belum ada donasi yang tercatat</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Recent Disbursements */}
        <Card>
          <CardHeader>
            <CardTitle>Penyaluran Terbaru</CardTitle>
            <CardDescription>Daftar penyaluran dana terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            {disbursements.length > 0 ? (
              <div className="space-y-3">
                {disbursements.slice(0, 5).map((disburse) => (
                  <div key={disburse.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{formatRupiah(disburse.amount)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(disburse.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <Badge
                      className={
                        disburse.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : disburse.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : disburse.status === 'pending'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                      }
                    >
                      {disburse.status === 'completed'
                        ? 'Selesai'
                        : disburse.status === 'approved'
                          ? 'Disetujui'
                          : disburse.status === 'pending'
                            ? 'Pending'
                            : 'Ditolak'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>Belum ada penyaluran yang tercatat</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
