"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, Building2, Globe, ExternalLink, GripVertical, Upload, X } from "lucide-react"

type Partner = {
  id: string
  name: string
  logo: string
  website: string
  category: "corporate" | "ngo" | "government" | "university" | "media"
  status: "active" | "inactive"
}

const initialPartners: Partner[] = [
  { id: "1", name: "Bank Mandiri", logo: "/partners/mandiri.png", website: "https://bankmandiri.co.id", category: "corporate", status: "active" },
  { id: "2", name: "Tokopedia", logo: "/partners/tokopedia.png", website: "https://tokopedia.com", category: "corporate", status: "active" },
  { id: "3", name: "KBRI Berlin", logo: "/partners/kbri.png", website: "https://kemlu.go.id", category: "government", status: "active" },
  { id: "4", name: "Universitas Indonesia", logo: "/partners/ui.png", website: "https://ui.ac.id", category: "university", status: "active" },
  { id: "5", name: "Kompas", logo: "/partners/kompas.png", website: "https://kompas.com", category: "media", status: "active" },
  { id: "6", name: "UNICEF Indonesia", logo: "/partners/unicef.png", website: "https://unicef.org/indonesia", category: "ngo", status: "inactive" },
]

const categoryLabels = {
  corporate: { label: "Korporasi", color: "bg-blue-100 text-blue-700" },
  ngo: { label: "NGO", color: "bg-green-100 text-green-700" },
  government: { label: "Pemerintah", color: "bg-red-100 text-red-700" },
  university: { label: "Universitas", color: "bg-purple-100 text-purple-700" },
  media: { label: "Media", color: "bg-orange-100 text-orange-700" },
}

// Recommended logo dimensions
const LOGO_DIMENSIONS = { width: 300, height: 300 }

export default function PartnersEditorPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [partners, setPartners] = useState<Partner[]>(initialPartners)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [logoError, setLogoError] = useState<string>("")
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    category: "corporate" as Partner["category"],
    status: "active" as Partner["status"],
  })

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || partner.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenDialog = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner)
      setFormData({
        name: partner.name,
        logo: partner.logo,
        website: partner.website,
        category: partner.category,
        status: partner.status,
      })
      setLogoPreview(partner.logo)
    } else {
      setEditingPartner(null)
      setFormData({ name: "", logo: "", website: "", category: "corporate", status: "active" })
      setLogoPreview("")
    }
    setLogoError("")
    setIsDialogOpen(true)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setLogoError("File harus berupa gambar (JPG, PNG, WebP, dll)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Ukuran file maksimal 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        const width = img.width
        const height = img.height

        // Warn if dimensions are not recommended
        if (width !== LOGO_DIMENSIONS.width || height !== LOGO_DIMENSIONS.height) {
          setLogoError(
            `Ukuran gambar ${width}x${height}px. Rekomendasi: ${LOGO_DIMENSIONS.width}x${LOGO_DIMENSIONS.height}px`
          )
        } else {
          setLogoError("")
        }

        const imageData = event.target?.result as string
        setFormData({ ...formData, logo: imageData })
        setLogoPreview(imageData)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleClearLogo = () => {
    setFormData({ ...formData, logo: "" })
    setLogoPreview("")
    setLogoError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = () => {
    if (editingPartner) {
      setPartners(partners.map((p) => (p.id === editingPartner.id ? { ...p, ...formData } : p)))
    } else {
      const newPartner: Partner = {
        id: Date.now().toString(),
        ...formData,
      }
      setPartners([...partners, newPartner])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus mitra ini?")) {
      setPartners(partners.filter((p) => p.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setPartners(partners.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p)))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Kelola Mitra & Partner
          </h1>
          <p className="text-muted-foreground">Kelola daftar mitra dan partner yang ditampilkan di website</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Mitra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{editingPartner ? "Edit Mitra" : "Tambah Mitra Baru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Logo Section */}
              <div className="flex flex-col items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logoPreview ? (
                  <div className="relative w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  {logoPreview ? "Ganti Logo" : "Unggah Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Rekomendasi: {LOGO_DIMENSIONS.width}x{LOGO_DIMENSIONS.height}px
                </p>
                {logoError && (
                  <p className="text-xs text-orange-600">{logoError}</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-3 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Mitra</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama perusahaan/organisasi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={formData.category} onValueChange={(value: Partner["category"]) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporate">Korporasi</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="government">Pemerintah</SelectItem>
                        <SelectItem value="university">Universitas</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: Partner["status"]) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent">
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-primary">
                {editingPartner ? "Simpan Perubahan" : "Tambah Mitra"}
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
                placeholder="Cari mitra..."
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
                <SelectItem value="corporate">Korporasi</SelectItem>
                <SelectItem value="ngo">NGO</SelectItem>
                <SelectItem value="government">Pemerintah</SelectItem>
                <SelectItem value="university">Universitas</SelectItem>
                <SelectItem value="media">Media</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{partners.length}</p>
            <p className="text-sm text-muted-foreground">Total Mitra</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{partners.filter((p) => p.status === "active").length}</p>
            <p className="text-sm text-muted-foreground">Aktif</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{partners.filter((p) => p.category === "corporate").length}</p>
            <p className="text-sm text-muted-foreground">Korporasi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{partners.filter((p) => p.category === "ngo").length}</p>
            <p className="text-sm text-muted-foreground">NGO</p>
          </CardContent>
        </Card>
      </div>

      {/* Partners List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Mitra</CardTitle>
          <CardDescription>
            Menampilkan {filteredPartners.length} dari {partners.length} mitra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {partner.logo && (partner.logo.startsWith("data:") || partner.logo.startsWith("http")) ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold truncate">{partner.name}</p>
                    <Badge className={categoryLabels[partner.category].color}>
                      {categoryLabels[partner.category].label}
                    </Badge>
                  </div>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    {partner.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`cursor-pointer ${partner.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    onClick={() => toggleStatus(partner.id)}
                  >
                    {partner.status === "active" ? "Aktif" : "Nonaktif"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(partner)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(partner.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredPartners.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tidak ada mitra ditemukan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
