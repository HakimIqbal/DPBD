"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, User } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    setIsLoading(false)

    if (result.success && result.redirectTo) {
      router.push(result.redirectTo)
    } else if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Terjadi kesalahan")
    }
  }

  return (
    <>
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden">
            <Image src="/logo-dpbd.png" alt="DPBD" fill className="object-cover" />
          </div>
          <span className="text-2xl font-bold text-primary">DPBD</span>
        </Link>
      </div>

      <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold">Selamat Datang Kembali</CardTitle>
          <CardDescription>Masukkan kredensial Anda untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl pr-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
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
            <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-muted-foreground">Belum punya akun?</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 w-full">
            <Button variant="outline" asChild className="h-11 rounded-xl bg-transparent border-gray-200 hover:bg-gray-50 hover:border-primary/30 transition-colors">
              <Link href="/auth/register/personal" className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Daftar Sebagai Personal
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
