"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ArrowRight, Calendar, User } from "lucide-react"

interface NewsItem {
  id: string
  title: string
  content: string
  image?: string
  publishedAt: string
  author?: { name: string }
  authorId?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/news`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        // Get published news only, sorted by recent, max 3 for landing
        const publishedNews = (Array.isArray(data) ? data : [])
          .filter((n: any) => n.isPublished === true)
          .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 3)
        setNews(publishedNews)
      } catch (error) {
        console.error("Error fetching news:", error)
        setNews([])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  return (
    <>
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-[#B30000] uppercase tracking-widest">Berita & Update</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">Cerita Berdampak</h2>
              <p className="mt-3 text-gray-500 max-w-xl">
                Kisah nyata dan update terbaru dari program-program yang telah berjalan
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="hidden md:flex rounded-full border-2 border-[#5C1515] text-[#5C1515] hover:bg-[#5C1515] hover:text-white transition-all duration-300 bg-transparent"
            >
              <Link href="/berita">
                Lihat Semua
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* News Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse text-gray-500">Memuat berita...</div>
            </div>
          ) : news.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {news.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-200">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/students-receiving-scholarship.jpg"
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-[#5C1515] text-white border-0 text-xs">
                      Berita
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#5C1515] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {item.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.author?.name || "Tim DPBD"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.publishedAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">Belum ada berita yang tersedia</div>
          )}

          {/* Mobile view all */}
          <div className="text-center mt-8 md:hidden">
            <Button
              variant="outline"
              asChild
              className="rounded-full border-2 border-[#5C1515] text-[#5C1515] hover:bg-[#5C1515] hover:text-white transition-all duration-300 bg-transparent"
            >
              <Link href="/berita">
                Lihat Semua Cerita
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* News Detail Modal */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selectedNews && (
            <>
              {/* Hero Image */}
              <div className="relative h-64 overflow-hidden rounded-t-lg bg-gray-200">
                {selectedNews.image && (
                  <Image
                    src={selectedNews.image}
                    alt={selectedNews.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/students-receiving-scholarship.jpg"
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge className="bg-[#5C1515] text-white border-0 mb-3">Berita</Badge>
                  <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                    {selectedNews.title}
                  </h2>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6 md:p-8">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {selectedNews.author?.name || "Tim DPBD"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedNews.publishedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>

                {/* Body */}
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                  {selectedNews.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="mb-4 text-sm md:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
