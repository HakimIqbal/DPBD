"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, HelpCircle, ChevronDown, ChevronUp, GripVertical, Eye, EyeOff } from "lucide-react"

type FAQItem = {
  id: string
  question: string
  answer: string
  category: "donation" | "program" | "account" | "payment" | "general"
  order: number
  isPublished: boolean
}

const initialFAQs: FAQItem[] = [
  {
    id: "1",
    question: "Bagaimana cara berdonasi di DPBD?",
    answer: "Anda dapat berdonasi dengan memilih program yang ingin didukung, kemudian klik tombol 'Donasi'. Pilih metode pembayaran yang tersedia (Transfer Bank, QRIS, E-Wallet, atau Kartu Kredit) dan ikuti instruksi pembayaran yang diberikan.",
    category: "donation",
    order: 1,
    isPublished: true,
  },
  {
    id: "2",
    question: "Apakah donasi saya akan dipotong biaya admin?",
    answer: "DPBD berkomitmen untuk transparansi. Biaya admin payment gateway sekitar 1-3% tergantung metode pembayaran. Selain itu, tidak ada potongan lain dari donasi Anda.",
    category: "donation",
    order: 2,
    isPublished: true,
  },
  {
    id: "3",
    question: "Bagaimana cara mendaftar akun?",
    answer: "Klik tombol 'Masuk' di pojok kanan atas, lalu pilih 'Daftar'. Anda bisa mendaftar sebagai donatur personal atau akun perusahaan untuk CSR. Isi data yang diperlukan dan verifikasi email Anda.",
    category: "account",
    order: 3,
    isPublished: true,
  },
  {
    id: "4",
    question: "Apakah saya bisa mendapatkan bukti donasi untuk laporan pajak?",
    answer: "Ya! Setiap donasi akan mendapatkan bukti donasi digital yang dapat diunduh melalui dashboard akun Anda. Untuk donasi perusahaan, kami juga menyediakan kwitansi resmi yang sah untuk keperluan perpajakan.",
    category: "payment",
    order: 4,
    isPublished: true,
  },
  {
    id: "5",
    question: "Program apa saja yang dapat saya dukung?",
    answer: "DPBD memiliki berbagai program seperti Beasiswa Pendidikan, Pemberdayaan UMKM, Bantuan Kesehatan & Darurat, Infrastruktur Pendidikan, Program Lingkungan, dan Bantuan Bencana. Setiap program memiliki detail dan target yang dapat Anda lihat di halaman Program.",
    category: "program",
    order: 5,
    isPublished: true,
  },
  {
    id: "6",
    question: "Bagaimana cara menghubungi tim DPBD?",
    answer: "Anda dapat menghubungi kami melalui email info@dpbd.org, telepon +62 21 1234 5678, atau melalui formulir kontak di website. Tim kami akan merespons dalam 1-2 hari kerja.",
    category: "general",
    order: 6,
    isPublished: true,
  },
]

const categoryLabels = {
  donation: { label: "Donasi", color: "bg-emerald-100 text-emerald-700" },
  program: { label: "Program", color: "bg-blue-100 text-blue-700" },
  account: { label: "Akun", color: "bg-purple-100 text-purple-700" },
  payment: { label: "Pembayaran", color: "bg-amber-100 text-amber-700" },
  general: { label: "Umum", color: "bg-gray-100 text-gray-700" },
}

export default function FAQEditorPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general" as FAQItem["category"],
    isPublished: true,
  })

  const filteredFAQs = faqs
    .filter((faq) => {
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === "all" || faq.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => a.order - b.order)

  const handleOpenDialog = (faq?: FAQItem) => {
    if (faq) {
      setEditingFAQ(faq)
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        isPublished: faq.isPublished,
      })
    } else {
      setEditingFAQ(null)
      setFormData({ question: "", answer: "", category: "general", isPublished: true })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingFAQ) {
      setFaqs(faqs.map((f) => (f.id === editingFAQ.id ? { ...f, ...formData } : f)))
    } else {
      const newFAQ: FAQItem = {
        id: Date.now().toString(),
        ...formData,
        order: faqs.length + 1,
      }
      setFaqs([...faqs, newFAQ])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus FAQ ini?")) {
      setFaqs(faqs.filter((f) => f.id !== id))
    }
  }

  const togglePublish = (id: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, isPublished: !f.isPublished } : f)))
  }

  const moveUp = (id: string) => {
    const index = faqs.findIndex((f) => f.id === id)
    if (index > 0) {
      const newFaqs = [...faqs]
      const temp = newFaqs[index].order
      newFaqs[index].order = newFaqs[index - 1].order
      newFaqs[index - 1].order = temp
      setFaqs(newFaqs)
    }
  }

  const moveDown = (id: string) => {
    const index = faqs.findIndex((f) => f.id === id)
    if (index < faqs.length - 1) {
      const newFaqs = [...faqs]
      const temp = newFaqs[index].order
      newFaqs[index].order = newFaqs[index + 1].order
      newFaqs[index + 1].order = temp
      setFaqs(newFaqs)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            Kelola FAQ
          </h1>
          <p className="text-muted-foreground">Kelola pertanyaan yang sering diajukan (FAQ)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Tambah FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFAQ ? "Edit FAQ" : "Tambah FAQ Baru"}</DialogTitle>
              <DialogDescription>
                {editingFAQ ? "Perbarui pertanyaan dan jawaban" : "Tambahkan FAQ baru ke daftar"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question">Pertanyaan</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Bagaimana cara...?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Jawaban</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Tulis jawaban yang jelas dan lengkap..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={formData.category} onValueChange={(value: FAQItem["category"]) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donation">Donasi</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                      <SelectItem value="account">Akun</SelectItem>
                      <SelectItem value="payment">Pembayaran</SelectItem>
                      <SelectItem value="general">Umum</SelectItem>
                    </SelectContent>
                  </Select>
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
                {editingFAQ ? "Simpan Perubahan" : "Tambah FAQ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari FAQ..."
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
                <SelectItem value="donation">Donasi</SelectItem>
                <SelectItem value="program">Program</SelectItem>
                <SelectItem value="account">Akun</SelectItem>
                <SelectItem value="payment">Pembayaran</SelectItem>
                <SelectItem value="general">Umum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{faqs.length}</p>
            <p className="text-sm text-muted-foreground">Total FAQ</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{faqs.filter((f) => f.isPublished).length}</p>
            <p className="text-sm text-muted-foreground">Dipublikasikan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{faqs.filter((f) => !f.isPublished).length}</p>
            <p className="text-sm text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{Object.keys(categoryLabels).length}</p>
            <p className="text-sm text-muted-foreground">Kategori</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar FAQ</CardTitle>
          <CardDescription>
            Menampilkan {filteredFAQs.length} dari {faqs.length} FAQ. Klik untuk melihat jawaban.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className={`border rounded-xl overflow-hidden transition-colors ${!faq.isPublished ? "opacity-60" : ""}`}
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveUp(faq.id); }}>
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveDown(faq.id); }}>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">#{faq.order}</span>
                      <Badge className={categoryLabels[faq.category].color}>
                        {categoryLabels[faq.category].label}
                      </Badge>
                      {!faq.isPublished && (
                        <Badge variant="outline" className="text-xs">Draft</Badge>
                      )}
                    </div>
                    <p className="font-medium">{faq.question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); togglePublish(faq.id); }}
                    >
                      {faq.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenDialog(faq); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(faq.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedId === faq.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>
                {expandedId === faq.id && (
                  <div className="px-4 pb-4 pt-0 pl-16 border-t bg-muted/20">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
            {filteredFAQs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tidak ada FAQ ditemukan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
