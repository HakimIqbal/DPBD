"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye, TrendingUp, Users, Target, ChevronDown, Play, PiggyBank, Sparkles } from "lucide-react"
import { DonationModal } from "@/components/donation-modal"

// Stat shape used by the hero counter cards. `subtitle` is optional —
// only the corpus card uses it, to reinforce the endowment principle
// at first glance.
interface HeroStat {
  icon: typeof TrendingUp
  value: number
  label: string
  displayValue: string
  subtitle?: string
}

const DEFAULT_STATS: HeroStat[] = [
  {
    // First stat is the endowment corpus (fed by /api/analytics/endowment).
    // The remaining three are fed by /api/analytics/public-stats — both
    // are public endpoints so anonymous landing visitors see real numbers
    // instead of zeros. The previous /analytics/dashboard endpoint is
    // RBAC-locked to admin/finance and was 401'ing for visitors.
    icon: PiggyBank,
    value: 0,
    label: "Total Dana Abadi (Corpus)",
    displayValue: "Rp 0",
    subtitle: "diinvestasikan, tidak pernah dibelanjakan",
  },
  {
    icon: Users,
    value: 0,
    label: "Donatur",
    displayValue: "0+",
  },
  {
    icon: Target,
    value: 0,
    label: "Program Aktif",
    displayValue: "0+",
  },
  {
    icon: TrendingUp,
    value: 0,
    label: "Total Donasi",
    displayValue: "Rp 0",
  },
]

export function HeroSection() {
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [donationOpen, setDonationOpen] = useState(false)

  useEffect(() => {
    /**
     * Compact rupiah formatter for hero stat cards.
     *
     * Picks the largest unit that produces a value ≥ 1 — `Rp 1,57M+` reads
     * cleaner than `Rp 1570Jt+`, and the actual unit (Triliun / Miliar /
     * Juta) is always identifiable from the suffix. Indonesian decimal
     * convention uses comma; we replace `.` with `,` post-fixed.
     *
     * Note: the `M+` here means **Miliar** (10^9), not "Million" (English).
     * That's the correct Indonesian convention; the previous version of
     * this file conflated the two.
     */
    const formatRupiah = (num: number): string => {
      if (!Number.isFinite(num) || num <= 0) return "Rp 0"
      if (num >= 1_000_000_000_000) {
        return `Rp ${(num / 1_000_000_000_000).toFixed(1).replace(".", ",")}T+`
      }
      if (num >= 1_000_000_000) {
        return `Rp ${(num / 1_000_000_000).toFixed(2).replace(".", ",")}M+`
      }
      if (num >= 1_000_000) {
        return `Rp ${Math.floor(num / 1_000_000)}Jt+`
      }
      return `Rp ${num.toLocaleString("id-ID")}`
    }

    /**
     * Two parallel public fetches:
     *   - `/api/analytics/endowment`     → first stat card (Total Dana Abadi).
     *   - `/api/analytics/public-stats`  → stats 2-4 (Donatur, Program Aktif,
     *                                       Total Donasi).
     *
     * Both endpoints are public, no auth required. Each is awaited
     * independently with `Promise.allSettled` so a partial outage (e.g.
     * endowment 200 but public-stats 500) still updates the half that
     * succeeded — visitors never see four zeros because of one failed
     * upstream.
     */
    const fetchStats = async () => {
      const [endowmentRes, publicRes] = await Promise.allSettled([
        fetch("http://localhost:3001/api/analytics/endowment"),
        fetch("http://localhost:3001/api/analytics/public-stats"),
      ])

      // Start from defaults and patch in whatever each fetch produces.
      const next: HeroStat[] = [...DEFAULT_STATS]

      try {
        if (endowmentRes.status === "fulfilled" && endowmentRes.value.ok) {
          const data = await endowmentRes.value.json()
          const corpus = Number(data?.totalCorpus ?? 0)
          next[0] = {
            ...next[0],
            value: corpus,
            displayValue: formatRupiah(corpus),
          }
        }
      } catch (err) {
        console.error("Error parsing endowment stats:", err)
      }

      try {
        if (publicRes.status === "fulfilled" && publicRes.value.ok) {
          const data = await publicRes.value.json()
          const donatur = Number(data?.totalDonatur ?? 0)
          const program = Number(data?.totalProgram ?? 0)
          const donasi = Number(data?.totalDonasi ?? 0)

          next[1] = {
            ...next[1],
            value: donatur,
            // Indonesian thousand separator (dot) — `1.234+` reads better
            // for non-trivial counts; small counts keep the simple `12+`.
            displayValue: `${donatur.toLocaleString("id-ID")}+`,
          }
          next[2] = {
            ...next[2],
            value: program,
            displayValue: `${program.toLocaleString("id-ID")}+`,
          }
          next[3] = {
            ...next[3],
            value: donasi,
            displayValue: formatRupiah(donasi),
          }
        }
      } catch (err) {
        console.error("Error parsing public stats:", err)
      }

      setStats(next)
    }

    void fetchStats()
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
            <p className="text-lg md:text-xl text-white/70 mb-4 max-w-2xl mx-auto leading-relaxed">
              Dukung program pendidikan, UMKM, dan kesejahteraan diaspora Indonesia di seluruh dunia.
              Setiap rupiah tercatat, setiap dampak terukur.
            </p>
            {/*
              Endowment-model one-liner. Visually distinct from the
              general subtitle (gold tint, slightly smaller) so it reads as
              "the differentiator", not as more marketing copy. Mirrors the
              EndowmentSection's gold tagline color exactly.
            */}
            <p className="text-base md:text-lg text-[#D4C896]/90 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Donasimu diinvestasikan secara syariah. Hanya imbal hasilnya yang membiayai program — dana pokokmu utuh selamanya.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
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

            {/*
              Tertiary discoverability link. Lighter visual weight than the
              two CTAs above so the primary "Mulai Berdonasi" stays the
              dominant action — but visible enough that visitors curious
              about the model have an obvious next click. Targets the
              EndowmentSection's id from the section above (#dana-abadi).
            */}
            <div className="mb-16 flex justify-center">
              <Link
                href="#dana-abadi"
                className="group inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-[#D4C896] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden />
                <span>Pelajari cara kerja Dana Abadi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
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
                    <p className="text-2xl md:text-3xl font-bold text-white mb-1 tabular-nums">{stat.displayValue}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                    {stat.subtitle && (
                      <p className="text-[11px] text-white/40 italic mt-1.5 leading-snug">
                        {stat.subtitle}
                      </p>
                    )}
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
