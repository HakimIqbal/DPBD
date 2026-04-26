import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { GraduationCap, Heart, Users } from "lucide-react"

const features = [
  { icon: GraduationCap, label: "Beasiswa Pelajar", desc: "Mendukung pendidikan diaspora" },
  { icon: Heart, label: "Bantuan Darurat", desc: "Respon cepat saat dibutuhkan" },
  { icon: Users, label: "Pemberdayaan UMKM", desc: "Modal usaha untuk diaspora" },
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#5C1515] via-[#7A2020] to-[#8B2828] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-[#D4C896] rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-80 h-80 bg-[#D4C896] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg group-hover:border-[#D4C896]/50 transition-colors">
              <Image src="/logo-dpbd.png" alt="DPBD" fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">DPBD</span>
              <span className="text-xs text-white/60">Direktorat Pengembangan Bisnis dan Dana Abadi</span>
            </div>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight text-balance">
              Bersama Membangun
              <span className="block text-[#D4C896]">Masa Depan Diaspora</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md leading-relaxed">
              Bergabunglah dengan ribuan donatur yang telah membantu mewujudkan mimpi pelajar Indonesia di seluruh dunia.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#D4C896]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#D4C896]" />
                </div>
                <div>
                  <p className="font-medium text-white">{feature.label}</p>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl xl:text-3xl font-bold text-[#D4C896]">Rp 50M+</p>
              <p className="text-white/60 text-xs mt-1">Total Donasi</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl xl:text-3xl font-bold text-[#D4C896]">1.200+</p>
              <p className="text-white/60 text-xs mt-1">Donatur Aktif</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl xl:text-3xl font-bold text-[#D4C896]">45+</p>
              <p className="text-white/60 text-xs mt-1">Program</p>
            </div>
          </div>
        </div>

      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-gray-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
