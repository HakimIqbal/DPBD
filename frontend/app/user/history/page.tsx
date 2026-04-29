'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Share2, Download, AlertCircle } from 'lucide-react'
import { donationsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Donation {
  id: string
  programId: string
  programName: string
  amount: number
  paymentMethod: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: string
  isAnonymous: boolean
}

const statusConfig = {
  pending: { icon: '⏳', color: 'bg-yellow-100', textColor: 'text-yellow-800', label: 'Menunggu Pembayaran' },
  completed: { icon: '✓', color: 'bg-green-100', textColor: 'text-green-800', label: 'Berhasil' },
  failed: { icon: '✗', color: 'bg-red-100', textColor: 'text-red-800', label: 'Gagal' },
  refunded: { icon: '↶', color: 'bg-blue-100', textColor: 'text-blue-800', label: 'Kembali Dana' },
}

export default function HistoryPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all')
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true)
        // `donationsApi.getAll()` is generically typed `T | null`; cast
        // through `unknown` to the array shape we expect.
        const data = (await donationsApi.getAll()) as Donation[] | null
        setDonations(data ?? [])
      } catch (error) {
        console.error('Error fetching donations:', error)
        toast({
          title: 'Error',
          description: 'Gagal memuat riwayat donasi',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [toast])

  const filteredDonations = statusFilter === 'all' 
    ? donations 
    : donations.filter(d => d.status === statusFilter)

  const totalCompleted = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0)

  const totalTransactions = donations.length

  const lastDonation = donations.length > 0 ? donations[0] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Riwayat Donasi</h1>
        <p className="text-gray-600">Lihat dan kelola semua donasi Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Berhasil</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {totalCompleted.toLocaleString('id-ID')}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Jumlah Transaksi</p>
          <p className="text-2xl font-bold">{totalTransactions}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Donasi Terakhir</p>
          <p className="text-2xl font-bold">
            {lastDonation ? new Date(lastDonation.createdAt).toLocaleDateString('id-ID') : '-'}
          </p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'completed', 'pending', 'failed', 'refunded'] as const).map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status === 'all' ? 'Semua' : statusConfig[status as keyof typeof statusConfig].label}
          </Button>
        ))}
      </div>

      {/* Donations List */}
      {filteredDonations.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tidak ada donasi saat ini.{' '}
            <Link href="/donate" className="text-blue-600 hover:underline font-semibold">
              Mulai berdonasi sekarang
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2">
          {filteredDonations.map(donation => {
            const config = statusConfig[donation.status]
            return (
              <Card
                key={donation.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => setSelectedDonation(donation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{donation.programName}</h3>
                      <Badge className={`${config.color} ${config.textColor} border-0`}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(donation.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rp {donation.amount.toLocaleString('id-ID')}</p>
                    <p className="text-sm text-gray-600">{donation.paymentMethod}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedDonation} onOpenChange={(open) => !open && setSelectedDonation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Donasi</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">ID Transaksi</p>
                <p className="font-mono text-sm">{selectedDonation.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Program</p>
                <p className="font-semibold">{selectedDonation.programName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nominal</p>
                <p className="text-lg font-bold">Rp {selectedDonation.amount.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Metode Pembayaran</p>
                <p>{selectedDonation.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={`${statusConfig[selectedDonation.status].color} ${statusConfig[selectedDonation.status].textColor} border-0`}>
                  {statusConfig[selectedDonation.status].label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal</p>
                <p>{new Date(selectedDonation.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              {selectedDonation.isAnonymous && (
                <Alert>
                  <AlertDescription>Donasi ini tercatat sebagai anonim</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1" disabled>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
