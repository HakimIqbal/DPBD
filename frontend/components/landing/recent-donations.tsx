"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart } from "lucide-react"

interface Donation {
  id: string
  amount: number
  isAnonymous: boolean
  userId?: string
  user?: { name: string }
  createdAt: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}Jt`
  }
  return `Rp ${(value / 1000).toFixed(0)}rb`
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "baru saja"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

export function RecentDonations() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch recent donations from API
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/donations`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        // Get completed donations, sorted by recent, max 8
        const completedDonations = (Array.isArray(data) ? data : [])
          .filter((d: any) => d.status === "completed")
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8)
        setDonations(completedDonations)
      } catch (error) {
        console.error("Error fetching donations:", error)
        setDonations([])
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [])

  // Auto-rotate donations
  useEffect(() => {
    if (donations.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % donations.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [donations.length])

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-gray-500">Memuat donasi terkini...</div>
        </div>
      </section>
    )
  }

  if (donations.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-gray-400">Belum ada donasi yang tercatat</div>
        </div>
      </section>
    )
  }

  const visibleDonations = [
    donations[currentIndex],
    donations[(currentIndex + 1) % donations.length],
    donations[(currentIndex + 2) % donations.length],
    donations[(currentIndex + 3) % donations.length],
  ].filter(Boolean)

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#B30000] mb-3">
            <Heart className="w-5 h-5 fill-current" />
            <span className="text-sm font-medium uppercase tracking-wider">Donasi Terkini</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Terima Kasih Para Donatur</h2>
          <p className="mt-2 text-gray-600">Donasi real-time dari para dermawan yang telah berkontribusi</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleDonations.map((donation, index) => (
            <Card
              key={`${donation.id}-${index}`}
              className="p-4 border-gray-100 hover:border-[#D4C896] hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-[#5C1515]/10 shrink-0">
                  <AvatarFallback className="text-[#5C1515] text-sm font-medium">
                    {donation.isAnonymous ? "?" : (donation.user?.name || "A").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {donation.isAnonymous ? "Anonim" : donation.user?.name || "Donatur"}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[#5C1515]">{formatCurrency(donation.amount)}</span>
                    <span className="text-xs text-gray-400">{timeAgo(donation.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live - Diperbarui secara real-time
        </div>
      </div>
    </section>
  )
}
