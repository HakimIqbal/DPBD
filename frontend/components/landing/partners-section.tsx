"use client"

import { useState, useEffect } from "react"

interface Partner {
  id: string
  name: string
  logo?: string
  website?: string
  isActive: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

const DEFAULT_PARTNERS: Partner[] = [
  { id: "1", name: "Bank BCA", logo: "/bca-bank-logo.jpg", website: "https://www.bca.co.id", isActive: true },
  { id: "2", name: "Bank BNI", logo: "/bni-bank-logo.jpg", website: "https://www.bni.co.id", isActive: true },
  { id: "3", name: "Bank Mandiri", logo: "/mandiri-bank-logo.jpg", website: "https://www.bankmandiri.co.id", isActive: true },
  { id: "4", name: "Bank BRI", logo: "/bri-bank-logo.jpg", website: "https://www.bri.co.id", isActive: true },
  { id: "5", name: "Tokopedia", logo: "/tokopedia-logo.png", website: "https://www.tokopedia.com", isActive: true },
  { id: "6", name: "Gojek", logo: "/gojek-logo.jpg", website: "https://www.gojek.com", isActive: true },
  { id: "7", name: "Telkomsel", logo: "/telkomsel-logo.png", website: "https://www.telkomsel.com", isActive: true },
  { id: "8", name: "Pertamina", logo: "/pertamina-logo.png", website: "https://www.pertamina.com", isActive: true },
]

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/partners`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        const activePartners = (Array.isArray(data) ? data : []).filter((p: any) => p.isActive === true)
        setPartners(activePartners.length > 0 ? activePartners : DEFAULT_PARTNERS)
      } catch (error) {
        console.error("Error fetching partners:", error)
        setPartners(DEFAULT_PARTNERS)
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Dipercaya Oleh</p>
            <h2 className="text-2xl font-bold text-gray-900">Mitra & Partner Kami</h2>
          </div>
          <div className="text-center text-gray-500 py-8">Memuat partner...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white border-t border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Dipercaya Oleh</p>
          <h2 className="text-2xl font-bold text-gray-900">Mitra & Partner Kami</h2>
        </div>

        {/* Scrolling logos */}
        <div className="relative overflow-hidden">
          <div className="flex items-center gap-12 animate-marquee">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
