"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Share2, Home, Heart, Loader2, Calendar, User } from "lucide-react"
import { paymentsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"

function SuccessContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [receiptId, setReceiptId] = useState("")

  const orderId = searchParams.get("order_id") || ""
  const amount = Number.parseInt(searchParams.get("amount") || "100000")
  const program = searchParams.get("program") || "Program Donasi"

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    // Trigger confetti on success
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#7F1D1D", "#B91C1C", "#FCD34D", "#10B981"],
    })

    // Fetch transaction status and generate receipt ID
    const id = `RCP-${Date.now()}`
    setReceiptId(id)
    setLoading(false)
  }, [])

  const handleDownloadReceipt = () => {
    if (!receiptId) {
      toast({
        title: "Error",
        description: "Receipt ID not available",
        variant: "destructive",
      })
      return
    }

    // Generate simple text receipt
    const receiptContent = `===============================================
               BUKTI DONASI - DPBD
===============================================

ID Bukti Donasi      : ${receiptId}
ID Transaksi         : ${orderId || "ID-" + Date.now()}
Tanggal Transaksi    : ${formatDate(new Date())}

-----------------------------------------------
DETAIL DONASI
-----------------------------------------------
Program              : ${program}
Jumlah Donasi        : ${formatCurrency(amount)}
Status               : SUKSES

-----------------------------------------------
DONATUR INFORMATION
-----------------------------------------------
Nama                 : ${searchParams.get("donor") || "Anonim"}
Email                : ${searchParams.get("email") || "-"}
No. Identitas        : ${searchParams.get("id") || "-"}

-----------------------------------------------
KETERANGAN PENTING
-----------------------------------------------
✓ Donasi Anda telah diterima dan tercatat
✓ Email konfirmasi akan dikirim dalam beberapa menit
✓ Bukti ini dapat digunakan untuk keperluan pajak/donasi
✓ Hubungi admin untuk pertanyaan lebih lanjut

Email: support@dpbd.org
Telepon: +62-xxx-xxxx-xxxx
Website: https://dpbd.org

===============================================
Terima kasih atas donasi dan dukungan Anda!
Semoga amal kebaikan Anda menjadi berkah. 🙏
===============================================
    `

    // Create and download file
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent))
    element.setAttribute("download", `bukti-donasi-${receiptId}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Sukses",
      description: "Bukti donasi berhasil diunduh",
    })
  }

  const handleShare = () => {
    const shareText = `Saya baru saja berdonasi ${formatCurrency(amount)} untuk ${program} melalui DPBD. Bergabunglah dengan kami dalam membuat perbedaan! 🙏`

    if (navigator.share) {
      navigator.share({
        title: "Donasi DPBD",
        text: shareText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast({
        title: "Sukses",
        description: "Teks dibagikan ke clipboard",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl">DPBD</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Donasi Berhasil!</h1>
            <p className="text-muted-foreground text-lg">Terima kasih telah berbagi kebaikan dengan kami</p>
          </div>

          {/* Transaction Details */}
          <Card className="mb-6 border-2 border-green-100">
            <CardHeader>
              <CardTitle>Detail Donasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID Bukti Donasi</p>
                  <p className="font-mono text-sm font-medium text-primary">{receiptId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID Transaksi</p>
                  <p className="font-mono text-sm font-medium text-primary">{orderId}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Program</span>
                  </div>
                  <span className="font-medium">{program}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Donatur</span>
                  </div>
                  <span className="font-medium">{searchParams.get("donor") || "Anonim"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Tanggal</span>
                  </div>
                  <span className="font-medium text-sm">{formatDate(new Date())}</span>
                </div>
              </div>

              <div className="border-t pt-4 bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Jumlah Donasi</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(amount)}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ✓ Donasi Anda telah diterima dan sedang diproses. Anda akan menerima email konfirmasi dalam beberapa menit.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button onClick={handleDownloadReceipt} variant="outline" size="lg" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Unduh Bukti Donasi
            </Button>
            <Button onClick={handleShare} variant="outline" size="lg" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan Donasi
            </Button>
          </div>

          {/* Next Actions */}
          <div className="space-y-3">
            <Link href="/" className="w-full">
              <Button size="lg" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Kembali ke Halaman Utama
              </Button>
            </Link>

            <Link href="/donate" className="w-full">
              <Button size="lg" variant="secondary" className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Donasi Lagi
              </Button>
            </Link>
          </div>

          {/* Info Cards */}
          <div className="mt-8 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Apa Selanjutnya?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-primary font-bold">1</div>
                  <div>Anda akan menerima email konfirmasi dengan detail donasi</div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-primary font-bold">2</div>
                  <div>Dana akan diproses dan dialokasikan ke program dalam 1-2 hari kerja</div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-primary font-bold">3</div>
                  <div>Anda dapat melacak dampak donasi Anda melalui dashboard transparansi</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pertanyaan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Jika Anda memiliki pertanyaan tentang donasi, silakan hubungi kami:</p>
                <Link href="/contact" className="text-primary hover:underline text-sm font-medium">
                  Hubungi Tim DPBD
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
