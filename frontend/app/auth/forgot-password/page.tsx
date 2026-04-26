"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Heart, ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <>
        <div className="lg:hidden flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">DPBD</span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold mb-2">Email Terkirim!</h2>
            <p className="text-muted-foreground mb-6">
              Kami telah mengirim instruksi reset password ke <strong>{email}</strong>. Silakan cek inbox atau folder
              spam Anda.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/auth/login">Kembali ke Login</Link>
              </Button>
              <Button variant="ghost" onClick={() => setIsSubmitted(false)} className="w-full">
                Kirim ulang email
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
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
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Lupa Password?</CardTitle>
          <CardDescription>
            Masukkan email yang terdaftar dan kami akan mengirimkan instruksi untuk reset password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Instruksi Reset"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
