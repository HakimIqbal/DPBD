"use client"

import type React from "react"
import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)

export default function FinanceProcessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Baca data REQ dari query params yang dikirim oleh pending page
  const reqId = searchParams.get("id")
  const category = searchParams.get("category")
  const recipient = searchParams.get("recipient")
  const bank = searchParams.get("bank")
  const amount = searchParams.get("amount") ? Number(searchParams.get("amount")) : null

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setUploading(false)
    setDone(true)
    setTimeout(() => router.push("/finance/completed"), 1500)
  }

  // Jika tidak ada query param (akses langsung tanpa dari pending page)
  if (!reqId) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Upload Bukti Transfer</h1>
          <p className="text-muted-foreground">Unggah bukti transfer setelah melakukan pencairan dana</p>
        </div>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Tidak ada pengajuan yang dipilih</p>
              <p className="text-sm text-amber-700 mt-1">
                Silakan buka halaman Pengajuan Penyaluran dan klik tombol "Upload Bukti" pada pengajuan yang sudah disetujui Admin.
              </p>
              <Button asChild size="sm" className="mt-4" variant="outline">
                <Link href="/finance/pending">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Pengajuan
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold">Bukti Transfer Berhasil Diunggah!</h2>
        <p className="text-muted-foreground text-sm">Penyaluran {reqId} telah selesai diproses.</p>
        <p className="text-xs text-muted-foreground">Mengalihkan ke halaman Selesai...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/finance/pending">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload Bukti Transfer</h1>
          <p className="text-muted-foreground text-sm">Unggah bukti transfer setelah melakukan pencairan dana</p>
        </div>
      </div>

      {/* Alur Status */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-muted/50 border text-xs">
        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <CheckCircle className="w-3.5 h-3.5" /> Finance Ajukan
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <CheckCircle className="w-3.5 h-3.5" /> Admin Setujui
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="flex items-center gap-1.5 text-primary font-semibold">
          <Upload className="w-3.5 h-3.5" /> Upload Bukti Transfer
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="text-muted-foreground">Selesai</span>
      </div>

      {/* Info Pengajuan - data dari query params */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Detail Pengajuan yang Disetujui</CardTitle>
            <Badge className="bg-blue-500/10 text-blue-600 border-0">{reqId}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Kategori Program</p>
              <p className="font-medium">{category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Nominal Transfer</p>
              <p className="text-xl font-bold text-primary">{amount ? formatRupiah(amount) : "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Penerima</p>
              <p className="font-medium">{recipient}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Rekening Tujuan</p>
              <p className="font-medium">{bank}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Upload Bukti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Form Upload Bukti Transfer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reference">Nomor Referensi / Transaksi ID</Label>
              <Input id="reference" placeholder="Contoh: TRF20240115001" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transfer-date">Tanggal & Waktu Transfer</Label>
              <Input id="transfer-date" type="datetime-local" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proof">Bukti Transfer (PDF/JPG/PNG)</Label>
              <Input
                id="proof"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-emerald-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  File dipilih: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
              <Textarea id="notes" placeholder="Tambahkan catatan jika diperlukan..." rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/finance/pending">Batal</Link>
              </Button>
              <Button type="submit" disabled={uploading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Konfirmasi & Upload Bukti
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
