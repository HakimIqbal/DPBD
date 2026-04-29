"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Heart, GraduationCap, Check, User, Building2, UserX, Loader2 } from "lucide-react"
import { programsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

/**
 * Hybrid Program shape — accommodates both the canonical API response
 * (`title`, `image`, `targetAmount`, `collectedAmount`) AND the legacy
 * display-side aliases the JSX in this page reads (`name`, `icon`,
 * `target`, `raised`). The API doesn't currently emit the display
 * aliases, so the destructured calls below all use null-coalescing
 * fallbacks to bridge the two shapes.
 */
import type { LucideIcon } from "lucide-react"

interface Program {
  id: string
  // API-canonical fields
  title?: string
  image?: string
  targetAmount?: number
  collectedAmount?: number
  category?: string
  status?: string
  // Display-side aliases (may be missing from the API response)
  name?: string
  icon?: LucideIcon
  target?: number
  raised?: number
  donors?: number
}

const nominalOptions = [
  { value: 50000, label: "Rp 50.000" },
  { value: 100000, label: "Rp 100.000" },
  { value: 250000, label: "Rp 250.000" },
  { value: 500000, label: "Rp 500.000" },
  { value: 1000000, label: "Rp 1.000.000" },
]

function DonateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const programId = searchParams.get("program")

  const [step, setStep] = useState(1)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    programId: programId || "",
    nominal: 100000,
    customNominal: "",
    frequency: "once",
    anonymous: false,
    message: "",
    donorType: "guest",
    name: "",
    email: "",
    phone: "",
    country: "Indonesia",
  })

  // Fetch programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        // `programsApi.getAll()` is generic-typed `T | null` and we
        // know the shape — cast through `unknown` to satisfy strict
        // mode without using `any`. Empty array on null keeps the
        // null-check ergonomics minimal.
        const data = (await programsApi.getAll()) as Program[] | null
        const activePrograms = (data ?? []).filter(
          (p) => p.status === "active" || p.status === "draft",
        )
        setPrograms(activePrograms)
      } catch (error) {
        console.error('Error fetching programs:', error)
        toast({
          title: "Error",
          description: "Gagal memuat daftar program",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrograms()
  }, [toast])

  const selectedProgram = programs.find((p) => p.id === formData.programId)
  const displayNominal = formData.customNominal ? Number.parseInt(formData.customNominal) : formData.nominal

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
    else {
      const params = new URLSearchParams({
        program: formData.programId,
        programName: selectedProgram?.title || "Program",
        amount: displayNominal.toString(),
        frequency: formData.frequency,
        anonymous: formData.anonymous.toString(),
        name: formData.anonymous ? "Anonymous" : formData.name,
        email: formData.email,
      })
      router.push(`/donate/payment?${params.toString()}`)
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return formData.programId && displayNominal >= 10000
    }
    if (step === 2) {
      if (formData.donorType === "guest") {
        return formData.name && formData.email
      }
      return true
    }
    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat program...</p>
        </div>
      </div>
    )
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
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
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
                      step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-sm ${step >= s.num ? "font-medium" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className={`w-16 h-0.5 mx-4 ${step > s.num ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            {step === 1 && (
              <>
                {/* Program Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pilih Program</CardTitle>
                    <CardDescription>Pilih program yang ingin Anda dukung</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.programId}
                      onValueChange={(value) => setFormData({ ...formData, programId: value })}
                      className="space-y-3"
                    >
                      {programs.map((program) => {
                        // The API returns canonical fields (title/image/
                        // targetAmount/collectedAmount); the legacy aliases
                        // (name/icon/raised/target) are missing. Fall back
                        // to canonical fields so the UI renders meaningfully
                        // either way. `GraduationCap` is a reasonable
                        // generic icon for an unrecognised program.
                        const Icon = program.icon ?? GraduationCap
                        const raised = program.raised ?? program.collectedAmount ?? 0
                        const target = program.target ?? program.targetAmount ?? 0
                        const displayName = program.name ?? program.title ?? "Program"
                        const progress = target > 0 ? (raised / target) * 100 : 0
                        return (
                          <label
                            key={program.id}
                            className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                              formData.programId === program.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={program.id} className="mt-1" />
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{displayName}</p>
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Terkumpul</span>
                                  <span className="font-medium">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatCurrency(raised)} dari {formatCurrency(target)}
                                </p>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Nominal */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nominal Donasi</CardTitle>
                    <CardDescription>Pilih atau masukkan nominal donasi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {nominalOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, nominal: option.value, customNominal: "" })}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            formData.nominal === option.value && !formData.customNominal
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Atau masukkan nominal lain</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          placeholder="Minimal 10.000"
                          className="pl-10"
                          value={formData.customNominal}
                          onChange={(e) => setFormData({ ...formData, customNominal: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Frequency */}
                <Card>
                  <CardHeader>
                    <CardTitle>Frekuensi Donasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                      className="flex gap-4"
                    >
                      <label
                        className={`flex-1 flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
                          formData.frequency === "once" ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <RadioGroupItem value="once" />
                        <div>
                          <p className="font-medium">Sekali</p>
                          <p className="text-sm text-muted-foreground">Donasi satu kali</p>
                        </div>
                      </label>
                      <label
                        className={`flex-1 flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
                          formData.frequency === "monthly" ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <RadioGroupItem value="monthly" />
                        <div>
                          <p className="font-medium">Bulanan</p>
                          <p className="text-sm text-muted-foreground">Donasi rutin tiap bulan</p>
                        </div>
                      </label>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Opsi Tambahan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="anonymous"
                        checked={formData.anonymous}
                        onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked as boolean })}
                      />
                      <Label htmlFor="anonymous" className="cursor-pointer">
                        Tampil sebagai Anonymous (Hamba Allah)
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Pesan / Doa (Opsional)</Label>
                      <Textarea
                        placeholder="Tulis pesan atau doa untuk penerima manfaat..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Identitas Donatur</CardTitle>
                  <CardDescription>Pilih cara Anda berdonasi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Donor Type Selection */}
                  <RadioGroup
                    value={formData.donorType}
                    onValueChange={(value) => setFormData({ ...formData, donorType: value })}
                    className="grid grid-cols-3 gap-3"
                  >
                    <label
                      className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer ${
                        formData.donorType === "guest" ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value="guest" className="sr-only" />
                      <UserX className="w-6 h-6" />
                      <span className="text-sm font-medium">Tanpa Login</span>
                    </label>
                    <label
                      className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer ${
                        formData.donorType === "personal" ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value="personal" className="sr-only" />
                      <User className="w-6 h-6" />
                      <span className="text-sm font-medium">Personal</span>
                    </label>
                    <label
                      className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer ${
                        formData.donorType === "company" ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value="company" className="sr-only" />
                      <Building2 className="w-6 h-6" />
                      <span className="text-sm font-medium">Company</span>
                    </label>
                  </RadioGroup>

                  {formData.donorType === "guest" && (
                    <div className="space-y-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Isi data berikut untuk melanjutkan donasi sebagai tamu.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nama Lengkap *</Label>
                          <Input
                            placeholder="Masukkan nama"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>No. Telepon (Opsional)</Label>
                          <Input
                            placeholder="+62..."
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Negara</Label>
                          <Input
                            placeholder="Indonesia"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(formData.donorType === "personal" || formData.donorType === "company") && (
                    <div className="space-y-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Silakan login atau daftar untuk melanjutkan.</p>
                      <div className="flex gap-3">
                        <Link href="/auth/login" className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            Login
                          </Button>
                        </Link>
                        <Link href={`/auth/register/${formData.donorType}`} className="flex-1">
                          <Button className="w-full">Daftar</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Ringkasan Donasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProgram ? (
                  (() => {
                    // Same alias-fallback pattern as the program list above.
                    const SidebarIcon = selectedProgram.icon ?? GraduationCap
                    const sidebarName = selectedProgram.name ?? selectedProgram.title ?? "Program"
                    const sidebarTarget = selectedProgram.target ?? selectedProgram.targetAmount ?? 0
                    return (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <SidebarIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sidebarName}</p>
                          <p className="text-xs text-muted-foreground">
                            Target: {formatCurrency(sidebarTarget)}
                          </p>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">Pilih program terlebih dahulu</p>
                )}

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nominal</span>
                    <span className="font-medium">{formatCurrency(displayNominal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frekuensi</span>
                    <span>{formData.frequency === "once" ? "Sekali" : "Bulanan"}</span>
                  </div>
                  {formData.anonymous && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tampil sebagai</span>
                      <span>Anonymous</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(displayNominal)}</span>
                  </div>
                </div>

                <Button onClick={handleNext} disabled={!canProceed()} className="w-full" size="lg">
                  {step === 2 ? "Lanjut ke Pembayaran" : "Lanjut"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {step === 2 && (
                  <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <DonateContent />
    </Suspense>
  )
}
