"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Check, Building, CreditCard, Smartphone, QrCode, Loader2, AlertCircle } from "lucide-react"
import { useMidtrans } from "@/hooks/use-midtrans"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const paymentMethods = [
  {
    id: "va",
    name: "Virtual Account",
    icon: Building,
    options: [
      { id: "bca", name: "BCA Virtual Account", logo: "/generic-three-letter-logo.png" },
      { id: "bni", name: "BNI Virtual Account", logo: "/generic-business-networking-logo.png" },
      { id: "bri", name: "BRI Virtual Account", logo: "/bri-logo.jpg" },
      { id: "mandiri", name: "Mandiri Virtual Account", logo: "/mandiri-logo.jpg" },
    ],
  },
  {
    id: "qris",
    name: "QRIS",
    icon: QrCode,
    options: [{ id: "qris", name: "Scan QRIS", logo: "/qris-logo.jpg" }],
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    icon: Smartphone,
    options: [
      { id: "gopay", name: "GoPay", logo: "/gopay-logo.png" },
      { id: "ovo", name: "OVO", logo: "/ovo-logo.jpg" },
      { id: "dana", name: "DANA", logo: "/dana-logo.jpg" },
      { id: "shopeepay", name: "ShopeePay", logo: "/shopeepay-logo.jpg" },
    ],
  },
  {
    id: "cc",
    name: "Kartu Kredit/Debit",
    icon: CreditCard,
    options: [{ id: "cc", name: "Visa / Mastercard", logo: "/visa-mastercard-logo.jpg" }],
  },
]

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { createPayment, isLoading } = useMidtrans()

  const amount = Number.parseInt(searchParams.get("amount") || "100000")
  const programId = searchParams.get("program") || ""
  const programName = searchParams.get("programName") || "Program"
  const donorName = searchParams.get("name") || "Donatur"
  const isAnonymous = searchParams.get("anonymous") === "true"
  const donorEmail = searchParams.get("email") || ""

  const [selectedMethod, setSelectedMethod] = useState("")
  const [selectedOption, setSelectedOption] = useState("")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handlePay = async () => {
    if (!selectedMethod || !selectedOption) {
      toast({
        title: "Error",
        description: "Pilih metode pembayaran terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    if (!programId) {
      toast({
        title: "Error",
        description: "Program ID tidak ditemukan",
        variant: "destructive",
      })
      return
    }

    // Call Midtrans payment
    await createPayment(programId, amount, selectedMethod, isAnonymous, donorName, donorEmail)
  }

  const adminFee = selectedMethod === "cc" ? Math.round(amount * 0.029) : selectedMethod === "ewallet" ? 1500 : 0
  const total = amount + adminFee

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

      <main className="container mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: "Isi Donasi" },
              { num: 2, label: "Identitas" },
              { num: 3, label: "Pembayaran" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      s.num <= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.num < 3 ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-sm ${s.num <= 3 ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {i < 2 && <div className={`w-16 h-0.5 mx-4 ${s.num < 3 ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Metode Pembayaran</CardTitle>
                <CardDescription>Pilih metode yang paling nyaman untuk Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <div key={method.id} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          setSelectedMethod(method.id)
                          setSelectedOption(method.options[0].id)
                        }}
                        className={`w-full flex items-center gap-3 p-4 transition-colors ${
                          selectedMethod === method.id ? "bg-primary/5" : "hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{method.name}</span>
                      </button>

                      {selectedMethod === method.id && method.options.length > 1 && (
                        <div className="border-t p-4 bg-muted/30">
                          <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-2">
                            {method.options.map((option) => (
                              <label
                                key={option.id}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                                  selectedOption === option.id ? "border-primary bg-background" : "bg-background"
                                }`}
                              >
                                <RadioGroupItem value={option.id} />
                                <img
                                  src={option.logo || "/placeholder.svg"}
                                  alt={option.name}
                                  className="h-6 object-contain"
                                />
                                <span className="text-sm">{option.name}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Anda akan dialihkan ke sistem pembayaran Midtrans yang aman untuk menyelesaikan transaksi.
              </AlertDescription>
            </Alert>

            <Link href="/donate">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke form donasi
              </Button>
            </Link>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Ringkasan Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Program</span>
                    <span className="capitalize">{programName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Donatur</span>
                    <span>{isAnonymous ? "Anonim" : donorName}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nominal Donasi</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                  {adminFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Biaya Admin</span>
                      <span>{formatCurrency(adminFee)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Bayar</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePay}
                  disabled={!selectedMethod || isLoading}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Bayar Sekarang"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan donasi DPBD
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
