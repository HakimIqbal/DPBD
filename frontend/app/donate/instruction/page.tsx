"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Clock, Check, QrCode, Home, Loader2 } from "lucide-react"

function InstructionContent() {
  const searchParams = useSearchParams()
  const method = searchParams.get("method")
  const bank = searchParams.get("bank")
  const amount = Number.parseInt(searchParams.get("amount") || "100000")

  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60) // 24 hours in seconds

  // Generate mock VA number
  const vaNumber = `8277${Math.random().toString().slice(2, 14)}`

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const bankNames: Record<string, string> = {
    bca: "BCA",
    bni: "BNI",
    bri: "BRI",
    mandiri: "Mandiri",
  }

  return (
    <div className="min-h-screen bg-muted/30">
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Timer Warning */}
        <Card className="mb-6 border-warning bg-warning/10">
          <CardContent className="flex items-center gap-4 py-4">
            <Clock className="w-8 h-8 text-warning" />
            <div>
              <p className="font-medium">Selesaikan pembayaran dalam</p>
              <p className="text-2xl font-bold text-warning">{formatTime(timeLeft)}</p>
            </div>
          </CardContent>
        </Card>

        {method === "va" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                Transfer ke Virtual Account {bankNames[bank || "bca"]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* VA Number */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Nomor Virtual Account</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold">{vaNumber}</span>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(vaNumber)}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{formatCurrency(amount)}</span>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(amount.toString())}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pastikan transfer sesuai nominal untuk verifikasi otomatis
                </p>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-medium mb-3">Cara Pembayaran:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">1.</span>
                    Buka aplikasi {bankNames[bank || "bca"]} Mobile atau Internet Banking
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">2.</span>
                    Pilih menu Transfer {">"} Virtual Account
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">3.</span>
                    Masukkan nomor Virtual Account di atas
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">4.</span>
                    Periksa detail pembayaran, pastikan nama dan nominal sesuai
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">5.</span>
                    Konfirmasi dan selesaikan pembayaran
                  </li>
                </ol>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Pembayaran akan diverifikasi otomatis dalam 1-5 menit setelah transfer berhasil.
                </p>
                <div className="flex gap-3">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Home className="w-4 h-4 mr-2" />
                      Ke Beranda
                    </Button>
                  </Link>
                  <Link href={`/donate/success?amount=${amount}`} className="flex-1">
                    <Button className="w-full">Cek Status Pembayaran</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {method === "qris" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Scan QRIS untuk Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <img src="/qr-code-payment.png" alt="QRIS Code" className="w-64 h-64" />
                </div>
              </div>

              {/* Amount */}
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                <span className="text-2xl font-bold text-primary">{formatCurrency(amount)}</span>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-medium mb-3">Cara Pembayaran:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">1.</span>
                    Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">2.</span>
                    Pilih menu Scan / Bayar dengan QRIS
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">3.</span>
                    Arahkan kamera ke QR Code di atas
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">4.</span>
                    Periksa detail pembayaran dan konfirmasi
                  </li>
                </ol>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Home className="w-4 h-4 mr-2" />
                    Ke Beranda
                  </Button>
                </Link>
                <Link href={`/donate/success?amount=${amount}`} className="flex-1">
                  <Button className="w-full">Cek Status</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function InstructionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <InstructionContent />
    </Suspense>
  )
}
