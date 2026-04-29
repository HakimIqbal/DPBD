"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, MapPin, Star, CheckCircle, Quote, MessageSquarePlus } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface Testimonial {
  id: string
  quote: string
  name: string
  role?: string
  location?: string
  image?: string
  rating?: number
}

const DEFAULT_IMPACT_STATS = [
  { icon: Users, value: "2.500+", label: "Penerima Manfaat" },
  { icon: MapPin, value: "34", label: "Provinsi Terjangkau" },
  { icon: Star, value: "4.9/5", label: "Kepuasan Penerima" },
  { icon: CheckCircle, value: "128", label: "Program Selesai" },
]

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote:
      "Berkat beasiswa dari DPBD, saya bisa melanjutkan studi S2 di Jerman tanpa beban biaya. Sekarang saya sudah bekerja dan siap berkontribusi balik.",
    name: "Andi Pratama",
    role: "Penerima Beasiswa",
    location: "Alumni TU Munich, Jerman",
    image: "/indonesian-male-entrepreneur-portrait.jpg",
  },
  {
    id: "2",
    quote:
      "Modal usaha dari DPBD membantu saya memulai bisnis katering sehat. Omzet kami sudah meningkat 3x lipat dalam setahun!",
    name: "Siti Rahayu",
    role: "Penerima Dana UMKM",
    location: "Jakarta, Indonesia",
    image: "/indonesian-female-student-portrait.jpg",
  },
  {
    id: "3",
    quote:
      "Sebagai donatur rutin, saya sangat terkesan dengan transparansi DPBD. Saya bisa melihat langsung dampak donasi saya setiap bulan.",
    name: "Dr. Budi Santoso",
    role: "Donatur Bulanan",
    location: "Sydney, Australia",
    image: "/indonesian-male-entrepreneur-portrait.jpg",
  },
  {
    id: "4",
    quote:
      "Program bantuan darurat DPBD sangat cepat merespon saat saya mengalami kesulitan. Mereka benar-benar peduli pada pelajar Indonesia.",
    name: "Maya Putri",
    role: "Penerima Bantuan Darurat",
    location: "Mahasiswa di Belanda",
    image: "/indonesian-female-professional-portrait.jpg",
  },
]

// Calculate indicator width based on number of testimonials
const getIndicatorWidth = (total: number): number => {
  if (total <= 4) return 32
  if (total <= 6) return 24
  if (total <= 10) return 16
  return 12
}

export function ImpactSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS)
  const [impactStats, setImpactStats] = useState(DEFAULT_IMPACT_STATS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [loading, setLoading] = useState(true)
  const indicatorWidth = getIndicatorWidth(testimonials.length)

  // Fetch impact stats from /api/analytics/dashboard. Testimonials stay
  // hardcoded — `/api/feedback` was removed because there is no backend
  // module behind it (the call was always 404'ing and silently falling
  // back to defaults). When a real feedback module is built later, this
  // is the place to wire it back in.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${API_BASE_URL}/analytics/dashboard`)
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData) {
            setImpactStats([
              { icon: Users, value: `${statsData.totalDonors || 2500}+`, label: "Donor Aktif" },
              { icon: MapPin, value: statsData.programsActive || "34", label: "Program Berjalan" },
              { icon: Star, value: "4.9/5", label: "Kepuasan Penerima" },
              { icon: CheckCircle, value: statsData.programsCompleted || "128", label: "Program Selesai" },
            ])
          }
        }
        // /analytics/dashboard is currently RBAC-locked to admin/finance, so
        // an anonymous landing visitor will hit 401 here. That's pre-existing
        // behaviour — the section degrades gracefully to DEFAULT_IMPACT_STATS
        // until either the endpoint is opened up or a public-stats variant
        // is added.
      } catch (error) {
        console.error("Error fetching impact data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const goToSlide = useCallback((index: number) => {
    setIsVisible(false)
    setTimeout(() => {
      setDisplayIndex(index)
      setProgress(0)
      setTimeout(() => setIsVisible(true), 50)
    }, 400)
  }, [])

  const nextTestimonial = useCallback(() => {
    const nextIndex = (displayIndex + 1) % testimonials.length
    setCurrentIndex(nextIndex)
    goToSlide(nextIndex)
  }, [displayIndex, goToSlide, testimonials.length])

  // Auto-switch testimonials every 5 seconds
  useEffect(() => {
    if (isPaused || !isVisible || loading) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextTestimonial()
          return 0
        }
        return prev + 1.67 // ~6 seconds total
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isPaused, isVisible, nextTestimonial, loading])

  const handleDotClick = (index: number) => {
    if (index === displayIndex) return
    setCurrentIndex(index)
    goToSlide(index)
  }

  const handlePauseStart = () => setIsPaused(true)
  const handlePauseEnd = () => setIsPaused(false)

  return (
    <section id="dampak" className="py-20 md:py-28 bg-[#5C1515]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-[#D4C896] uppercase tracking-wider">Dampak Nyata</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Bersama Menciptakan Perubahan</h2>
          <p className="mt-4 text-lg text-white/70">
            Setiap donasi Anda telah membantu ribuan pelajar dan keluarga Indonesia meraih impian mereka.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat) => (
            <div key={stat.label} className="text-center bg-white/10 backdrop-blur rounded-2xl p-6">
              <stat.icon className="w-10 h-10 text-[#D4C896] mx-auto mb-4" />
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl text-center">
              <p className="text-gray-600">Memuat testimonial...</p>
            </div>
          ) : (
            <div 
              className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl cursor-pointer select-none"
              onMouseDown={handlePauseStart}
              onMouseUp={handlePauseEnd}
              onMouseLeave={handlePauseEnd}
              onTouchStart={handlePauseStart}
              onTouchEnd={handlePauseEnd}
            >
              <div 
                className={`flex flex-col md:flex-row gap-8 items-center transition-all duration-500 ease-out ${
                  isVisible 
                    ? "opacity-100 translate-y-0 scale-100" 
                    : "opacity-0 translate-y-4 scale-[0.98]"
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#D4C896] shadow-lg">
                    <Image
                      src={testimonials[displayIndex]?.image || "/placeholder.svg"}
                      alt={testimonials[displayIndex]?.name || "Testimoni"}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <Quote className="w-10 h-10 text-[#D4C896] mb-4 mx-auto md:mx-0 opacity-50" />
                  <blockquote className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonials[displayIndex]?.quote || ""}"
                  </blockquote>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{testimonials[displayIndex]?.name}</p>
                    <p className="text-sm text-[#5C1515] font-medium">{testimonials[displayIndex]?.role}</p>
                    <p className="text-sm text-gray-500">{testimonials[displayIndex]?.location}</p>
                  </div>
                </div>
              </div>

              {/* Navigation - Dynamic width indicators */}
              <div className="flex items-center justify-center mt-8 pt-6 border-t border-gray-100">
                <div className="flex gap-1.5">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className="relative h-1.5 rounded-full bg-gray-200 overflow-hidden transition-all duration-300 hover:bg-gray-300"
                      style={{ width: `${indicatorWidth}px` }}
                    >
                      {index === displayIndex ? (
                        <div
                          className="absolute inset-y-0 left-0 bg-[#5C1515] rounded-full"
                          style={{ 
                            width: isPaused ? '100%' : `${progress}%`,
                            transition: isPaused ? 'none' : 'width 100ms linear'
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 rounded-full bg-gray-200" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CTA to share story */}
          <div className="text-center mt-10">
            <p className="text-white/70 mb-4">Punya cerita dampak dari DPBD? Bagikan pengalaman Anda!</p>
            <Button
              asChild
              variant="outline"
              className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full"
            >
              <Link href="/feedback">
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Bagikan Cerita Anda
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
