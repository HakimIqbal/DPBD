import Image from "next/image"
import { CheckCircle } from "lucide-react"

const highlights = [
  "Pengembangan Bisnis",
  "Literasi Keuangan",
  "Dana Abadi & Keuangan Strategis",
  "Marketing, Komunikasi & Desain",
  "IT & Data",
]

export function AboutSection() {
  return (
    <section id="tentang" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <span className="text-sm font-medium text-[#B30000] uppercase tracking-wider">Tentang DPBD</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Direktorat Pengembangan Bisnis dan Dana Abadi
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              DPBD adalah salah satu direktorat di bawah PPI Dunia yang berfokus pada pengembangan potensi bisnis dan keuangan global mahasiswa Indonesia. Bersama lima bidang utamanya, kami bergerak untuk menciptakan ekosistem bisnis dan keuangan yang lebih kuat bagi mahasiswa Indonesia di seluruh dunia.
            </p>

            {/* 5 Bidang Utama Section */}
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">5 Bidang Utama</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#5C1515]/5 to-transparent hover:from-[#5C1515]/10 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-[#5C1515] flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Image & Stats */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/diverse-group-of-indonesian-students-studying-abro.jpg"
                alt="Pelajar Indonesia di luar negeri"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <p className="text-3xl font-bold text-[#5C1515]">10+</p>
              <p className="text-sm text-gray-600">Tahun Pengalaman</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
