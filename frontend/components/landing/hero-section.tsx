"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye, TrendingUp, Users, Target, ChevronDown, Play } from "lucide-react"
import { DonationModal } from "@/components/donation-modal"

const DEFAULT_STATS = [
  {
    icon: TrendingUp,
    value: 0,
    label: "Total Dana Terkumpul",
    displayValue: "Rp 0",
  },
  {
    icon: Users,
    value: 0,
    label: "Donatur Aktif",
    displayValue: "0+",
  },
  {
    icon: Target,
    value: 0,
    label: "Program Aktif",
    displayValue: "0+",
  },
  {
    icon: Eye,
    value: 0,
    label: "Tingkat Transparansi",
    displayValue: "0%",
  },
]

export function HeroSection() {
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [donationOpen, setDonationOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/analytics/dashboard")
        if (response.ok) {
          const data = await response.json()
          if (data.statistics) {
            const stats = data.statistics
            const formatRupiah = (num: number) => {
              const millions = num / 1000000
              if (millions >= 1000) {
                return `Rp ${(millions / 1000).toFixed(1)}T+`
              }
              return `Rp ${Math.floor(millions)}M+`
            }
            
            const newStats = [
              {
                icon: TrendingUp,
                value: stats.totalIncome || 0,
                label: "Total Dana Terkumpul",
                displayValue: formatRupiah(stats.totalIncome || 0),
              },
              {
                icon: Users,
                value: stats.donorCount || 0,
                label: "Donatur Aktif",
                displayValue: `${stats.donorCount || 0}+`,
              },
              {
                icon: Target,
                value: stats.programCount || 0,
                label: "Program Aktif",
                displayValue: `${stats.programCount || 0}+`,
              },
              {
                icon: Eye,
                value: stats.transparencyScore || 0,
                label: "Tingkat Transparansi",
                displayValue: `${stats.transparencyScore || 0}%`,
              },
            ]
            setStats(newStats)
          }
        }
      } catch (error) {
        console.error("Error fetching hero stats:", error)
        // Keep default stats on error
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#D4C896]/20 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#B30000]/20 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              Platform Donasi Transparan & Terpercaya
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Membangun Masa Depan
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4C896] to-[#f0e6c8]">
                Melalui Donasi Berkelanjutan
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Dukung program pendidikan, UMKM, dan kesejahteraan diaspora Indonesia di seluruh dunia. 
              Setiap rupiah tercatat, setiap dampak terukur.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                className="text-base px-8 py-6 bg-gradient-to-r from-[#B30000] to-[#8a0000] hover:from-[#8a0000] hover:to-[#6d0000] text-white shadow-xl shadow-[#B30000]/30 rounded-full transition-all duration-300 hover:scale-105"
                onClick={() => setDonationOpen(true)}
              >
                Mulai Berdonasi
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 rounded-full transition-all duration-300"
                asChild
              >
                <Link href="#transparansi">
                  <Eye className="mr-2 w-5 h-5" />
                  Lihat Transparansi
                </Link>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4C896]/20 mb-4">
                      <stat.icon className="w-6 h-6 text-[#D4C896]" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.displayValue}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40">
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </div>
      </section>

      <DonationModal open={donationOpen} onOpenChange={setDonationOpen} />
    </>
  )
}
