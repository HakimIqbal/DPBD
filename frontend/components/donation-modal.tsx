"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Building2, QrCode, Copy, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const nominalOptions = [
  { value: "50000", label: "Rp 50.000" },
  { value: "100000", label: "Rp 100.000" },
  { value: "250000", label: "Rp 250.000" },
  { value: "500000", label: "Rp 500.000" },
  { value: "1000000", label: "Rp 1.000.000" },
]

const bankOptions = [
  { id: "bca", name: "BCA", logo: "/bca-bank-logo.jpg" },
  { id: "bni", name: "BNI", logo: "/bni-bank-logo.jpg" },
  { id: "bri", name: "BRI", logo: "/bri-bank-logo.jpg" },
  { id: "mandiri", name: "Mandiri", logo: "/mandiri-bank-logo.jpg" },
]

type Step = "amount" | "identity" | "payment" | "instruction" | "success"

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const [step, setStep] = useState<Step>("amount")
  const [selectedNominal, setSelectedNominal] = useState("")
  const [customNominal, setCustomNominal] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "qris">("bank")
  const [selectedBank, setSelectedBank] = useState("")
  const [copied, setCopied] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const finalAmount = customNominal || selectedNominal
  const formattedAmount = finalAmount ? `Rp ${Number.parseInt(finalAmount).toLocaleString("id-ID")}` : "Rp 0"

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setStep("amount")
    setSelectedNominal("")
    setCustomNominal("")
    setIsAnonymous(false)
    setPaymentMethod("bank")
    setSelectedBank("")
    setFormData({ name: "", email: "", phone: "", message: "" })
    onOpenChange(false)
  }

  const handleBack = () => {
    switch (step) {
      case "identity":
        setStep("amount")
        break
      case "payment":
        setStep("identity")
        break
      case "instruction":
        setStep("payment")
        break
      default:
        handleClose()
    }
  }

  const canProceedAmount = finalAmount && Number.parseInt(finalAmount) >= 10000
  const canProceedIdentity = isAnonymous || (formData.name && formData.email)
  const canProceedPayment = paymentMethod === "qris" || (paymentMethod === "bank" && selectedBank)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 border-b">
          <DialogHeader className="p-4">
            <div className="flex items-center gap-3">
              {step !== "amount" && step !== "success" && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-3 flex-1">
                <Image src="/logo-dpbd.png" alt="DPBD Logo" width={40} height={40} className="rounded-lg" />
                <div>
                  <DialogTitle className="text-left">Donasi ke DPBD</DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    {step === "amount" && "Pilih Nominal"}
                    {step === "identity" && "Isi data diri"}
                    {step === "payment" && "Pilih metode pembayaran"}
                    {step === "instruction" && "Instruksi pembayaran"}
                    {step === "success" && "Donasi berhasil"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Progress Steps */}
          {step !== "success" && (
            <div className="px-4 pb-3">
              <div className="flex gap-1">
                {["amount", "identity", "payment", "instruction"].map((s, i) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      ["amount", "identity", "payment", "instruction"].indexOf(step) >= i ? "bg-primary" : "bg-muted",
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Step 1: Amount */}
          {step === "amount" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Pilih Nominal</Label>
                <div className="grid grid-cols-3 gap-2">
                  {nominalOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedNominal(option.value)
                        setCustomNominal("")
                      }}
                      className={cn(
                        "p-3 rounded-lg border text-sm font-medium transition-all",
                        selectedNominal === option.value && !customNominal
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="custom" className="text-sm font-medium">
                  Atau masukkan nominal lain
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                  <Input
                    id="custom"
                    type="number"
                    placeholder="0"
                    className="pl-10"
                    value={customNominal}
                    onChange={(e) => {
                      setCustomNominal(e.target.value)
                      setSelectedNominal("")
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Minimal donasi Rp 10.000</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                  Donasi sebagai Anonim (nama tidak ditampilkan)
                </Label>
              </div>

              <div className="pt-2">
                <Button className="w-full" disabled={!canProceedAmount} onClick={() => setStep("identity")}>
                  Lanjutkan - {formattedAmount}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Identity */}
          {step === "identity" && (
            <div className="space-y-4">
              {!isAnonymous ? (
                <>
                  <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@contoh.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">No. WhatsApp (opsional)</Label>
                    <Input
                      id="phone"
                      placeholder="+62"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Anda akan berdonasi sebagai <strong>Anonim</strong>
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="message">Pesan / Doa (opsional)</Label>
                <textarea
                  id="message"
                  placeholder="Tulis pesan atau doa Anda..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1.5 w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="pt-2">
                <Button className="w-full" disabled={!canProceedIdentity} onClick={() => setStep("payment")}>
                  Pilih Metode Pembayaran
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === "payment" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nominal Donasi</span>
                  <span className="font-semibold">{formattedAmount}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Pilih Metode Pembayaran</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as "bank" | "qris")}
                  className="space-y-2"
                >
                  <label
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      paymentMethod === "bank"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <RadioGroupItem value="bank" />
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Transfer Bank (Virtual Account)</p>
                      <p className="text-xs text-muted-foreground">BCA, BNI, BRI, Mandiri</p>
                    </div>
                  </label>
                  <label
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      paymentMethod === "qris"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <RadioGroupItem value="qris" />
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">QRIS</p>
                      <p className="text-xs text-muted-foreground">Semua e-wallet & m-banking</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Bank Selection */}
              {paymentMethod === "bank" && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Pilih Bank</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {bankOptions.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-all",
                          selectedBank === bank.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <Image
                          src={bank.logo || "/placeholder.svg"}
                          alt={bank.name}
                          width={80}
                          height={32}
                          className="mx-auto mb-1"
                        />
                        <span className="text-xs font-medium">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button className="w-full" disabled={!canProceedPayment} onClick={() => setStep("instruction")}>
                  Bayar Sekarang
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Instruction */}
          {step === "instruction" && (
            <div className="space-y-4">
              {/* Timer */}
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <p className="text-sm text-destructive font-medium">Selesaikan pembayaran dalam</p>
                <p className="text-2xl font-bold text-destructive">23:59:45</p>
              </div>

              {/* Amount */}
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                <p className="text-2xl font-bold text-primary">{formattedAmount}</p>
              </div>

              {paymentMethod === "bank" ? (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Nomor Virtual Account {selectedBank.toUpperCase()}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-mono font-bold">8277 0812 3456 7890</p>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy("827708123456789")}>
                        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cara Pembayaran:</p>
                    <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                      <li>Buka aplikasi m-banking atau ATM {selectedBank.toUpperCase()}</li>
                      <li>Pilih menu Transfer ke Virtual Account</li>
                      <li>Masukkan nomor VA di atas</li>
                      <li>Konfirmasi nominal dan selesaikan pembayaran</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg flex flex-col items-center">
                    <p className="text-xs text-muted-foreground mb-3">Scan QR Code dengan aplikasi e-wallet</p>
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border">
                      <Image src="/qris-payment-qr-code.jpg" alt="QRIS QR Code" width={180} height={180} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cara Pembayaran:</p>
                    <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                      <li>Buka aplikasi e-wallet atau m-banking</li>
                      <li>Pilih menu Scan QR / QRIS</li>
                      <li>Scan QR code di atas</li>
                      <li>Konfirmasi nominal dan selesaikan pembayaran</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button className="w-full" onClick={() => setStep("success")}>
                  Saya Sudah Bayar
                </Button>
                <Button variant="ghost" className="w-full mt-2" onClick={handleClose}>
                  Batalkan
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <div className="space-y-4 text-center py-4">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-success" />
              </div>

              <div>
                <h3 className="text-xl font-bold">Terima Kasih!</h3>
                <p className="text-muted-foreground text-sm mt-1">Donasi Anda telah kami terima</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Transaksi</span>
                  <span className="font-mono">DON-2024-001234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nominal</span>
                  <span className="font-semibold">{formattedAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-success font-medium">Berhasil</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button className="w-full bg-transparent" variant="outline">
                  Download Bukti Donasi
                </Button>
                <Button className="w-full" onClick={handleClose}>
                  Selesai
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
