"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ArrowLeft, Calendar, User, Clock, Search, Filter } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Default news data - fallback if API is unavailable
const DEFAULT_NEWS_ITEMS = [
  {
    title: "Penyaluran Beasiswa Semester Genap 2024 untuk 150 Mahasiswa",
    excerpt: "DPBD berhasil menyalurkan beasiswa kepada 150 mahasiswa Indonesia yang sedang menempuh pendidikan di berbagai negara.",
    content: `DPBD berhasil menyalurkan beasiswa kepada 150 mahasiswa Indonesia yang sedang menempuh pendidikan di berbagai negara pada semester genap 2024. Program beasiswa ini merupakan bagian dari komitmen DPBD untuk mendukung pendidikan diaspora Indonesia di seluruh dunia.

Penerima beasiswa berasal dari 23 negara yang berbeda, mencakup mahasiswa S1, S2, hingga S3 di universitas-universitas terkemuka dunia. Total dana yang disalurkan mencapai Rp 4,2 miliar yang bersumber dari donasi masyarakat dan korporasi.

"Kami sangat bersyukur atas kepercayaan para donatur yang memungkinkan kami mewujudkan impian ratusan pelajar Indonesia," ujar Direktur Program DPBD. Program seleksi dilakukan secara ketat dengan mempertimbangkan prestasi akademik, keterbatasan ekonomi, dan komitmen untuk berkontribusi kembali kepada Indonesia.

Para penerima beasiswa juga mendapatkan mentoring dari alumni dan profesional Indonesia di luar negeri, membentuk jaringan yang kuat untuk pengembangan karir mereka ke depan.`,
    category: "Beasiswa",
    author: "Tim DPBD",
    date: "15 Des 2025",
    readTime: "4 menit",
    image: "/students-receiving-scholarship.jpg",
    slug: "penyaluran-beasiswa-semester-genap-2024",
  },
  {
    title: "Program UMKM Diaspora: 25 Usaha Baru Berhasil Didanai",
    excerpt: "Program pemberdayaan ekonomi berhasil mendanai 25 usaha baru yang dirintis oleh diaspora Indonesia di Eropa.",
    content: `Program pemberdayaan ekonomi DPBD berhasil mendanai 25 usaha baru yang dirintis oleh diaspora Indonesia di Eropa. Ini merupakan batch ketiga dari program UMKM Diaspora yang telah berjalan sejak 2022.

Usaha-usaha yang didanai mencakup berbagai sektor mulai dari kuliner, fashion, teknologi, hingga jasa konsultasi. Masing-masing penerima mendapat modal awal antara Rp 15 juta hingga Rp 50 juta, disertai pendampingan bisnis selama 6 bulan.

Salah satu penerima, Budi Hartono yang berbasis di Amsterdam, berhasil mengembangkan startup kuliner Indonesia yang kini melayani lebih dari 500 pelanggan per minggu. "Modal dari DPBD bukan hanya uang, tapi juga kepercayaan dan jaringan yang sangat berharga," katanya.

Program ini terbuka untuk diaspora Indonesia berusia 21-45 tahun yang telah tinggal di luar negeri minimal 2 tahun dan memiliki ide bisnis yang konkret dan berkelanjutan.`,
    category: "UMKM",
    author: "Tim DPBD",
    date: "12 Des 2025",
    readTime: "3 menit",
    image: "/small-business-entrepreneur.jpg",
    slug: "program-umkm-diaspora-25-usaha",
  },
  {
    title: "Bantuan Darurat: Respon Cepat untuk Korban Bencana Alam",
    excerpt: "Tim tanggap darurat DPBD menyalurkan bantuan kepada korban bencana alam di Indonesia Timur dalam 48 jam.",
    content: `Tim tanggap darurat DPBD berhasil menyalurkan bantuan kepada korban bencana alam di Indonesia Timur hanya dalam waktu 48 jam setelah bencana terjadi. Kecepatan respons ini dimungkinkan berkat sistem dana darurat yang telah disiapkan sebelumnya.

Total bantuan yang disalurkan mencapai Rp 850 juta, mencakup kebutuhan pangan, air bersih, obat-obatan, dan perlengkapan darurat untuk lebih dari 2.000 keluarga terdampak. Distribusi dilakukan bekerja sama dengan relawan lokal dan organisasi kemanusiaan setempat.

Koordinator Tanggap Darurat DPBD menyatakan bahwa sistem early warning dan jaringan relawan yang kuat menjadi kunci keberhasilan respon cepat ini. "Kami memiliki jaringan di hampir semua provinsi yang siap bergerak kapan pun dibutuhkan."

DPBD mengajak masyarakat untuk terus mendukung program bantuan darurat ini agar kapasitas respons dapat terus ditingkatkan di masa mendatang.`,
    category: "Bantuan Darurat",
    author: "Tim DPBD",
    date: "10 Des 2025",
    readTime: "3 menit",
    image: "/disaster-relief-aid.jpg",
    slug: "bantuan-darurat-bencana-alam",
  },
  {
    title: "Kolaborasi dengan Universitas Terkemuka untuk Program Mentoring",
    excerpt: "DPBD menjalin kerjasama dengan 15 universitas di Eropa untuk program mentoring pelajar Indonesia.",
    content: `DPBD resmi menjalin kerjasama dengan 15 universitas terkemuka di Eropa untuk mengembangkan program mentoring bagi pelajar Indonesia. Program ini bertujuan membantu mahasiswa Indonesia beradaptasi dan sukses dalam studi mereka di luar negeri.

Program mentoring mencakup bimbingan akademik, pengembangan karir, dan dukungan psikososial. Setiap mentor adalah alumni Indonesia yang telah berhasil dalam karir mereka di berbagai bidang.

"Program ini lahir dari pengalaman kami sendiri sebagai mahasiswa di luar negeri," kata salah satu penggagas program. "Kami tahu betapa pentingnya memiliki seseorang untuk berbagi pengalaman dan memberikan panduan."

Hingga saat ini, lebih dari 200 mahasiswa telah terdaftar dalam program mentoring, dan feedback yang diterima sangat positif.`,
    category: "Pendidikan",
    author: "Tim DPBD",
    date: "5 Des 2025",
    readTime: "3 menit",
    image: "/diverse-group-of-indonesian-students-studying-abro.jpg",
    slug: "kolaborasi-universitas-mentoring",
  },
  {
    title: "Laporan Transparansi Keuangan Q4 2025 Telah Dirilis",
    excerpt: "DPBD merilis laporan keuangan kuartal keempat 2025 dengan tingkat penyaluran dana mencapai 94%.",
    content: `DPBD dengan bangga mengumumkan rilis laporan transparansi keuangan untuk kuartal keempat 2025. Laporan ini menunjukkan tingkat penyaluran dana yang mencapai 94%, tertinggi sepanjang sejarah organisasi.

Total dana yang berhasil dikumpulkan pada Q4 2025 mencapai Rp 8,5 miliar, dengan 94% atau Rp 8 miliar telah disalurkan ke berbagai program. Sisanya 6% dialokasikan untuk biaya operasional yang efisien.

"Kami berkomitmen untuk menjaga transparansi sebagai fondasi kepercayaan donatur," ujar Ketua DPBD. "Setiap rupiah yang didonasikan tercatat dan dapat dilacak penggunaannya."

Laporan lengkap dapat diakses melalui halaman transparansi di website DPBD.`,
    category: "Transparansi",
    author: "Tim DPBD",
    date: "1 Des 2025",
    readTime: "2 menit",
    image: "/students-receiving-scholarship.jpg",
    slug: "laporan-transparansi-q4-2025",
  },
  {
    title: "Workshop Kewirausahaan untuk Diaspora di 5 Kota Eropa",
    excerpt: "DPBD mengadakan workshop kewirausahaan di Berlin, Amsterdam, Paris, London, dan Madrid.",
    content: `DPBD sukses menggelar rangkaian workshop kewirausahaan di lima kota besar Eropa: Berlin, Amsterdam, Paris, London, dan Madrid. Workshop ini diikuti oleh lebih dari 300 peserta dari kalangan diaspora Indonesia.

Materi workshop mencakup pengenalan bisnis, manajemen keuangan, pemasaran digital, dan akses permodalan. Narasumber adalah pengusaha sukses diaspora Indonesia yang telah membangun bisnis di Eropa.

"Workshop ini membuka mata saya tentang peluang bisnis yang ada," kata salah satu peserta dari Berlin. "Saya sekarang punya rencana konkret untuk memulai usaha sendiri."

DPBD berencana memperluas program ini ke kota-kota lain di tahun depan.`,
    category: "UMKM",
    author: "Tim DPBD",
    date: "25 Nov 2025",
    readTime: "3 menit",
    image: "/small-business-entrepreneur.jpg",
    slug: "workshop-kewirausahaan-eropa",
  },
]

const categories = ["Semua", "Beasiswa", "UMKM", "Bantuan Darurat", "Pendidikan", "Transparansi"]

type NewsItem = {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  author?: string
  date: string
  readTime?: string
  image?: string
  slug: string
}

export default function BeritaPage() {
  const [allNewsItems, setAllNewsItems] = useState<NewsItem[]>(DEFAULT_NEWS_ITEMS)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState(["Semua", "Beasiswa", "UMKM", "Bantuan Darurat", "Pendidikan", "Transparansi"])

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/news?isPublished=true`)
        if (response.ok) {
          const data = await response.json()
          const newsArray = Array.isArray(data) ? data : data.data || []
          
          // Transform API data to match component format
          const transformedNews = newsArray
            .filter((item: any) => item.isPublished !== false)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              excerpt: item.excerpt || item.summary || "",
              content: item.content || item.description || "",
              category: item.category || "Berita",
              author: item.author?.name || item.author || "Tim DPBD",
              date: new Date(item.publishedAt || item.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              readTime: "3 menit",
              image: item.image || item.thumbnail || "/news-placeholder.jpg",
              slug: item.slug || item.title?.toLowerCase().replace(/\s+/g, "-"),
            }))

          if (transformedNews.length > 0) {
            setAllNewsItems(transformedNews)
            
            // Extract unique categories
            const uniqueCategories = ["Semua", ...new Set(transformedNews.map((n: NewsItem) => n.category))]
            setCategories(uniqueCategories)
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        // Use default news items
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const filteredNews = allNewsItems.filter((news) => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         news.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Semua" || news.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#5C1515] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Cerita Berdampak</h1>
            <p className="text-white/80 max-w-2xl">
              Kumpulan berita dan cerita inspiratif dari program-program DPBD yang telah memberikan dampak nyata bagi masyarakat.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat 
                    ? "bg-[#5C1515] hover:bg-[#5C1515]/90" 
                    : "bg-white hover:bg-gray-50"}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-gray-500 mb-6">
              Menampilkan {filteredNews.length} dari {allNewsItems.length} berita
            </p>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Memuat berita...</p>
            </div>
          ) : (
            <>
              {/* News Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => (
              <button
                key={news.slug}
                onClick={() => setSelectedNews(news)}
                className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-[#5C1515] text-white border-0 text-xs">
                    {news.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#5C1515] transition-colors leading-snug">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{news.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {news.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {news.date}
                    </span>
                    <span className="flex items-center gap-1 ml-auto text-[#5C1515] font-medium">
                      <Clock className="w-3 h-3" />
                      {news.readTime}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">Tidak ada berita yang ditemukan.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setSearchQuery(""); setSelectedCategory("Semua"); }}
              >
                Reset Filter
              </Button>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* News Detail Modal */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selectedNews && (
            <>
              {/* Hero Image */}
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <Image
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge className="bg-[#5C1515] text-white border-0 mb-3">{selectedNews.category}</Badge>
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
                    {selectedNews.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {selectedNews.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {selectedNews.readTime} baca
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
