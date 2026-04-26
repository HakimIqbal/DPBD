"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Heart, ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"

export default function RegisterCompanyPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    companyName: "",
    npwp: "",
    picName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyAddress: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    if (!agreedTerms) {
      setError("Anda harus menyetujui syarat dan ketentuan")
      return
    }

    setIsLoading(true)
    const result = await register({
      email: formData.email,
      password: formData.password,
      name: formData.companyName,
      type: "company",
      companyName: formData.companyName,
      npwp: formData.npwp,
      picName: formData.picName,
      companyAddress: formData.companyAddress,
    })
    setIsLoading(false)

    if (result.success) {
      router.push("/user")
    } else {
      setError(result.error || "Terjadi kesalahan")
    }
  }

  return (
    <>
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-primary">DPBD</span>
        </Link>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-1">
          <Link
            href="/auth/login"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke login
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Daftar Akun Perusahaan</CardTitle>
              <CardDescription>Bergabung sebagai corporate donor</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>
            )}

            <div className="space-y-4 pb-4 border-b">
              <h3 className="text-sm font-medium text-muted-foreground">Informasi Perusahaan</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nama Perusahaan</Label>
                <Input
                  id="companyName"
                  placeholder="PT Nama Perusahaan"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npwp">NPWP (Opsional)</Label>
                <Input
                  id="npwp"
                  placeholder="XX.XXX.XXX.X-XXX.XXX"
                  value={formData.npwp}
                  onChange={(e) => handleChange("npwp", e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Alamat Perusahaan</Label>
                <Textarea
                  id="companyAddress"
                  placeholder="Alamat lengkap perusahaan"
                  value={formData.companyAddress}
                  onChange={(e) => handleChange("companyAddress", e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-4 pb-4 border-b">
              <h3 className="text-sm font-medium text-muted-foreground">Person in Charge (PIC)</h3>
              <div className="space-y-2">
                <Label htmlFor="picName">Nama PIC</Label>
                <Input
                  id="picName"
                  placeholder="Nama penanggung jawab"
                  value={formData.picName}
                  onChange={(e) => handleChange("picName", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email PIC</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="pic@perusahaan.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Keamanan Akun</h3>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreedTerms}
                onCheckedChange={(checked) => setAgreedTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                Saya menyetujui{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Kebijakan Privasi
                </Link>
              </Label>
            </div>
            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                "Daftar Perusahaan"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  )
}
