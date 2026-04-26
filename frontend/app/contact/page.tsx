"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

const contactItems = [
  {
    icon: Mail,
    label: "Email",
    value: "info@dpbd.org",
    href: "mailto:info@dpbd.org",
  },
  {
    icon: Phone,
    label: "Telepon / WhatsApp",
    value: "+62 21 1234 5678",
    href: "https://wa.me/62211234567",
  },
  {
    icon: MapPin,
    label: "Alamat",
    value: "Sekretariat DPBD, Jakarta, Indonesia",
    href: null,
  },
  {
    icon: Clock,
    label: "Jam Operasional",
    value: "Senin – Jumat, 09.00 – 17.00 WIB",
    href: null,
  },
]

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setSent(true)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#5C1515] to-[#8B2020] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">Hubungi Kami</h1>
          <p className="text-white/80 max-w-xl">Ada pertanyaan atau butuh bantuan? Tim kami siap membantu Anda.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Kontak</h2>
            <div className="space-y-4">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#5C1515]/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-[#5C1515]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-gray-800 hover:text-[#5C1515] transition-colors font-medium">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-[#5C1515]/5 border border-[#5C1515]/10">
              <p className="text-sm text-gray-700 leading-relaxed">
                Untuk pertanyaan mengenai donasi, penyaluran dana, atau kerjasama program, silakan hubungi kami melalui form di samping atau via email/WhatsApp.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-6">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Pesan Terkirim!</h3>
                  <p className="text-sm text-gray-600 mb-6">Tim kami akan menghubungi Anda dalam 1x24 jam kerja.</p>
                  <Button variant="outline" className="bg-transparent" onClick={() => setSent(false)}>
                    Kirim Pesan Lain
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Kirim Pesan</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nama</Label>
                      <Input id="name" placeholder="Nama Anda" required className="h-10 rounded-xl bg-gray-50 border-gray-200" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="email@anda.com" required className="h-10 rounded-xl bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input id="subject" placeholder="Topik pesan Anda" required className="h-10 rounded-xl bg-gray-50 border-gray-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      placeholder="Tulis pesan Anda di sini..."
                      required
                      rows={5}
                      className="rounded-xl bg-gray-50 border-gray-200 resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-[#5C1515] hover:bg-[#8B2020]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
