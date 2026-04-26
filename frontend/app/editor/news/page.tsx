"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, Newspaper, Calendar, User, Eye, EyeOff, ExternalLink } from "lucide-react"

type NewsItem = {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  date: string
  image: string
  slug: string
  isPublished: boolean
}

const initialNews: NewsItem[] = [
  {
    id: "1",
    title: "Penyaluran Beasiswa Semester Genap 2024 untuk 150 Mahasiswa",
    excerpt: "DPBD berhasil menyalurkan beasiswa kepada 150 mahasiswa Indonesia yang sedang menempuh pendidikan di berbagai negara.",
    content: "DPBD berhasil menyalurkan beasiswa kepada 150 mahasiswa Indonesia...",
    category: "Beasiswa",
    author: "Tim DPBD",
    date: "15 Des 2025",
    image: "/students-receiving-scholarship.jpg",
    slug: "penyaluran-beasiswa-semester-genap-2024",
    isPublished: true,
  },
  {
    id: "2",
    title: "Program UMKM Diaspora: 25 Usaha Baru Berhasil Didanai",
    excerpt: "Program pemberdayaan ekonomi berhasil mendanai 25 usaha baru yang dirintis oleh diaspora Indonesia di Eropa.",
    content: "Program pemberdayaan ekonomi DPBD berhasil mendanai 25 usaha baru...",
    category: "UMKM",
    author: "Tim DPBD",
    date: "12 Des 2025",
    image: "/small-business-entrepreneur.jpg",
    slug: "program-umkm-diaspora-25-usaha",
    isPublished: true,
  },
  {
    id: "3",
    title: "Bantuan Darurat: Respon Cepat untuk Korban Bencana Alam",
    excerpt: "Tim tanggap darurat DPBD menyalurkan bantuan kepada korban bencana alam di Indonesia Timur dalam 48 jam.",
    content: "Tim tanggap darurat DPBD berhasil menyalurkan bantuan...",
    category: "Bantuan Darurat",
    author: "Tim DPBD",
    date: "10 Des 2025",
    image: "/disaster-relief-aid.jpg",
    slug: "bantuan-darurat-bencana-alam",
    isPublished: true,
  },
]

const categories = ["Beasiswa", "UMKM", "Bantuan Darurat", "Pendidikan", "Transparansi", "Umum"]

export default function NewsEditorPage() {
  const [news, setNews] = useState<NewsItem[]>(initialNews)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Umum",
    author: "Tim DPBD",
    image: "",
    isPublished: true,
  })

  const filteredNews = news.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenDialog = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item)
      setFormData({
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        category: item.category,
        author: item.author,
        image: item.image,
        isPublished: item.isPublished,
      })
    } else {
      setEditingNews(null)
      setFormData({ title: "", excerpt: "", content: "", category: "Umum", author: "Tim DPBD", image: "", isPublished: true })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    if (editingNews) {
      setNews(news.map((n) => (n.id === editingNews.id ? { ...n, ...formData, slug } : n)))
    } else {
      const newItem: NewsItem = {
        id: Date.now().toString(),
        ...formData,
        slug,
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      }
      setNews([newItem, ...news])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus berita ini?")) {
      setNews(news.filter((n) => n.id !== id))
    }
  }

  const togglePublish = (id: string) => {
    setNews(news.map((n) => (n.id === id ? { ...n, isPublished: !n.isPublished } : n)))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            Kelola Berita & Update
          </h1>
          <p className="text-muted-foreground">Kelola artikel berita yang ditampilkan di halaman Cerita Berdampak</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="bg-transparent">
            <a href="/berita" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              Lihat Halaman
            </a>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Berita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Edit Berita" : "Tambah Berita Baru"}</DialogTitle>
                <DialogDescription>
                  {editingNews ? "Perbarui konten berita" : "Buat artikel berita baru"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Berita</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Judul yang menarik perhatian..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Ringkasan</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Ringkasan singkat untuk preview..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Konten</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Tulis konten lengkap berita..."
                    rows={8}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Penulis</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">URL Gambar</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/path/to/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.isPublished ? "published" : "draft"} onValueChange={(value) => setFormData({ ...formData, isPublished: value === "published" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Dipublikasikan</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent">
                  Batal
                </Button>
                <Button onClick={handleSave} className="bg-primary">
                  {editingNews ? "Simpan Perubahan" : "Publikasikan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{news.length}</p>
            <p className="text-sm text-muted-foreground">Total Berita</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{news.filter((n) => n.isPublished).length}</p>
            <p className="text-sm text-muted-foreground">Dipublikasikan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{news.filter((n) => !n.isPublished).length}</p>
            <p className="text-sm text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Kategori</p>
          </CardContent>
        </Card>
      </div>

      {/* News List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Berita</CardTitle>
          <CardDescription>
            Menampilkan {filteredNews.length} dari {news.length} berita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                className={`flex gap-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors ${!item.isPublished ? "opacity-60" : ""}`}
              >
                <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                      {item.category}
                    </Badge>
                    {!item.isPublished && (
                      <Badge variant="outline" className="text-xs">Draft</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold truncate mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => togglePublish(item.id)}
                  >
                    {item.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredNews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tidak ada berita ditemukan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
