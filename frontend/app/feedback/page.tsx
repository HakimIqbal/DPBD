"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, MessageSquare, Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  "Kemudahan Donasi",
  "Transparansi Dana",
  "Tampilan Website",
  "Pelayanan Tim",
  "Program & Dampak",
  "Lainnya",
]

export default function FeedbackPage() {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [category, setCategory] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setSent(true)
  }

  const ratingLabels = ["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#5C1515] to-[#8B2020] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">Feedback</h1>
          <p className="text-white/80 max-w-xl">Pendapat Anda membantu kami terus berkembang dan memberikan pelayanan terbaik.</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {sent ? (
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Terima Kasih!</h2>
              <p className="text-gray-600 mb-6">Feedback Anda sangat berarti bagi kami untuk terus meningkatkan layanan DPBD.</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="bg-transparent" onClick={() => { setSent(false); setRating(0); setCategory(""); setMessage("") }}>
                  Kirim Feedback Lagi
                </Button>
                <Button asChild className="bg-[#5C1515] hover:bg-[#8B2020]">
                  <Link href="/">Kembali ke Beranda</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Rating */}
                <div>
                  <Label className="text-base font-semibold text-gray-900">Seberapa puas Anda dengan DPBD?</Label>
                  <div className="flex items-center gap-2 mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={cn("w-9 h-9 transition-colors", (hovered || rating) >= star ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />
                      </button>
                    ))}
                  </div>
                  {(hovered || rating) > 0 && (
                    <p className="text-sm text-[#5C1515] font-medium mt-2">{ratingLabels[hovered || rating]}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label className="text-base font-semibold text-gray-900">Aspek yang ingin Anda beri masukan</Label>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm border transition-all",
                          category === cat
                            ? "bg-[#5C1515] text-white border-[#5C1515]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#5C1515]/50 hover:text-[#5C1515]"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="feedback-msg" className="text-base font-semibold text-gray-900">Ceritakan pengalaman Anda</Label>
                  <Textarea
                    id="feedback-msg"
                    placeholder="Tulis masukan, saran, atau keluhan Anda di sini..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-xl bg-gray-50 border-gray-200 resize-none"
                  />
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="feedback-name" className="text-base font-semibold text-gray-900">Nama</Label>
                  <input
                    id="feedback-name"
                    type="text"
                    placeholder="Siapa nama Anda?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C1515]/20 focus:border-[#5C1515]"
                  />
                </div>

                {/* Email optional */}
                <div className="space-y-1.5">
                  <Label htmlFor="feedback-email" className="text-base font-semibold text-gray-900">Email (opsional)</Label>
                  <input
                    id="feedback-email"
                    type="email"
                    placeholder="Isi jika ingin kami menghubungi Anda kembali"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C1515]/20 focus:border-[#5C1515]"
                  />
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl bg-[#5C1515] hover:bg-[#8B2020]" disabled={isLoading || rating === 0 || !name.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Kirim Feedback
                    </>
                  )}
                </Button>
                {rating === 0 && (
                  <p className="text-xs text-center text-gray-400">Pilih rating bintang terlebih dahulu</p>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
