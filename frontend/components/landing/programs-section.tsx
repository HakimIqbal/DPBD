"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Program {
  id: string
  title: string
  description: string
  image?: string
  status: string
  targetAmount?: number
  collectedAmount?: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Card component
function ProgramCard({ program }: { program: Program }) {
  const image = program.image || "/students-receiving-scholarship.jpg"

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      {/* Program Image */}
      <div className="relative h-44 overflow-hidden bg-gray-200">
        <Image
          src={image}
          alt={program.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/students-receiving-scholarship.jpg"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-[#5C1515]">
          <span className="text-lg">📚</span>
        </div>
      </div>
      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#5C1515] transition-colors">
          {program.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{program.description}</p>
        {program.targetAmount && (
          <div className="mt-3 text-xs text-gray-400">
            Terkumpul: Rp {(program.collectedAmount || 0).toLocaleString("id-ID")} / Rp{" "}
            {program.targetAmount.toLocaleString("id-ID")}
          </div>
        )}
      </div>
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-[#5C1515]" />
    </div>
  )
}

export function ProgramsSection() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/programs`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        // Get only active/draft programs, max 3 for preview
        const activePrograms = (Array.isArray(data) ? data : [])
          .filter((p: any) => p.status === "active" || p.status === "draft")
          .slice(0, 3)
        setPrograms(activePrograms)
      } catch (error) {
        console.error("Error fetching programs:", error)
        setPrograms([])
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  return (
    <>
      <section id="program" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm font-semibold text-[#B30000] uppercase tracking-widest">Program Kami</span>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Berbagai program yang dapat Anda dukung sesuai dengan nilai dan kepedulian Anda.
            </p>
          </div>

          {/* Programs Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse text-gray-500">Memuat program...</div>
            </div>
          ) : programs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">Belum ada program yang tersedia</div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              href="/program"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-[#5C1515] text-[#5C1515] hover:bg-[#5C1515] hover:text-white transition-all duration-300 bg-transparent font-semibold"
            >
              Lihat Semua Program
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
