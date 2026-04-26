"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  GraduationCap,
  Building2,
  Heart,
  TreePine,
  Home,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ImageIcon,
  Save,
  CheckCircle,
} from "lucide-react"

const iconOptions = [
  { key: "GraduationCap", icon: GraduationCap, label: "Beasiswa" },
  { key: "Building2", icon: Building2, label: "UMKM" },
  { key: "Heart", icon: Heart, label: "Kesehatan" },
  { key: "TreePine", icon: TreePine, label: "Lingkungan" },
  { key: "Home", icon: Home, label: "Infrastruktur" },
  { key: "AlertTriangle", icon: AlertTriangle, label: "Darurat" },
]

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Building2,
  Heart,
  TreePine,
  Home,
  AlertTriangle,
}

const colorOptions = [
  { value: "#3B82F6", label: "Biru" },
  { value: "#10B981", label: "Hijau" },
  { value: "#F43F5E", label: "Merah" },
  { value: "#F59E0B", label: "Kuning" },
  { value: "#22C55E", label: "Hijau Muda" },
  { value: "#F97316", label: "Oranye" },
  { value: "#8B5CF6", label: "Ungu" },
  { value: "#5C1515", label: "Maroon" },
]

interface Program {
  id: number
  icon: string
  title: string
  description: string
  image: string
  slug: string
  color: string
}

const initialPrograms: Program[] = [
  {
    id: 1,
    icon: "GraduationCap",
    title: "Beasiswa Pendidikan",
    description: "Mendukung biaya pendidikan pelajar Indonesia yang membutuhkan di berbagai negara.",
    image: "/students-receiving-scholarship.jpg",
    slug: "beasiswa-pendidikan",
    color: "#3B82F6",
  },
  {
    id: 2,
    icon: "Building2",
    title: "Pemberdayaan UMKM",
    description: "Modal usaha untuk alumni dan keluarga pelajar yang ingin memulai usaha kecil menengah.",
    image: "/small-business-entrepreneur.jpg",
    slug: "pemberdayaan-umkm",
    color: "#10B981",
  },
  {
    id: 3,
    icon: "Heart",
    title: "Kesehatan & Darurat",
    description: "Bantuan kesehatan dan dana darurat untuk pelajar yang mengalami kesulitan.",
    image: "/disaster-relief-aid.jpg",
    slug: "kesehatan-darurat",
    color: "#F43F5E",
  },
  {
    id: 4,
    icon: "Home",
    title: "Infrastruktur Pendidikan",
    description: "Pembangunan dan renovasi fasilitas belajar di daerah terpencil Indonesia.",
    image: "/diverse-group-of-indonesian-students-studying-abro.jpg",
    slug: "infrastruktur-pendidikan",
    color: "#F59E0B",
  },
  {
    id: 5,
    icon: "TreePine",
    title: "Lingkungan Hijau",
    description: "Program pelestarian lingkungan dan edukasi keberlanjutan untuk komunitas.",
    image: "/students-receiving-scholarship.jpg",
    slug: "lingkungan-hijau",
    color: "#22C55E",
  },
  {
    id: 6,
    icon: "AlertTriangle",
    title: "Bantuan Bencana",
    description: "Tanggap darurat untuk korban bencana alam di Indonesia dan negara lain.",
    image: "/disaster-relief-aid.jpg",
    slug: "bantuan-bencana",
    color: "#F97316",
  },
]

const emptyForm: Omit<Program, "id"> = {
  icon: "GraduationCap",
  title: "",
  description: "",
  image: "",
  slug: "",
  color: "#3B82F6",
}

export default function ProgramsEditorPage() {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [form, setForm] = useState<Omit<Program, "id">>(emptyForm)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenAdd = () => {
    setEditingProgram(null)
    setForm(emptyForm)
    setImagePreview("")
    setDialogOpen(true)
  }

  const handleOpenEdit = (program: Program) => {
    setEditingProgram(program)
    setForm({
      icon: program.icon,
      title: program.title,
      description: program.description,
      image: program.image,
      slug: program.slug,
      color: program.color,
    })
    setImagePreview(program.image)
    setDialogOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setForm((prev) => ({ ...prev, image: url }))
  }

  const handleSaveProgram = () => {
    if (!form.title || !form.description) return
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-")

    if (editingProgram) {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === editingProgram.id ? { ...editingProgram, ...form, slug } : p
        )
      )
    } else {
      const newId = Math.max(0, ...programs.map((p) => p.id)) + 1
      setPrograms((prev) => [...prev, { id: newId, ...form, slug }])
    }
    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (deleteId === null) return
    setPrograms((prev) => prev.filter((p) => p.id !== deleteId))
    setDeleteId(null)
  }

  const handleSaveAll = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Program Section</h1>
            <p className="text-gray-500 mt-1">Kelola program yang tampil di landing page</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleOpenAdd}
              className="gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Tambah Program
            </Button>
            <Button onClick={handleSaveAll} className="bg-[#5C1515] hover:bg-[#3d0e0e] gap-2">
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Tersimpan!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((program) => {
            const IconComp = iconMap[program.icon] || GraduationCap
            return (
              <Card key={program.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-40 bg-gray-100">
                  {program.image ? (
                    <Image
                      src={program.image}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Icon badge */}
                  <div
                    className="absolute top-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center shadow"
                    style={{ backgroundColor: program.color }}
                  >
                    <IconComp className="w-4 h-4 text-white" />
                  </div>
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(program)}
                      className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setDeleteId(program.id)}
                      className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-red-50 transition-colors shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{program.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{program.description}</p>
                </CardContent>
              </Card>
            )
          })}

          {/* Add Program Card */}
          <button
            onClick={handleOpenAdd}
            className="border-2 border-dashed border-gray-200 rounded-xl h-[220px] flex flex-col items-center justify-center gap-3 hover:border-[#5C1515] hover:bg-[#5C1515]/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#5C1515]/10 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#5C1515]" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-[#5C1515]">Tambah Program Baru</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram ? "Edit Program" : "Tambah Program Baru"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Gambar Program</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative h-40 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-[#5C1515] transition-colors group"
              >
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="text-white text-center">
                        <Upload className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs">Ganti Gambar</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Klik untuk upload gambar</span>
                    <span className="text-xs">JPG, PNG, WebP</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="prog-title">Nama Program</Label>
              <Input
                id="prog-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Beasiswa Pendidikan"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="prog-desc">Deskripsi Singkat</Label>
              <Textarea
                id="prog-desc"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi program yang ditampilkan di card..."
                rows={3}
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label>Icon Program</Label>
              <div className="flex gap-2 flex-wrap">
                {iconOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, icon: opt.key }))}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      form.icon === opt.key
                        ? "border-[#5C1515] bg-[#5C1515]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <opt.icon className="w-5 h-5 text-gray-700" />
                    <span className="text-[10px] text-gray-500">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Warna Aksen</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, color: opt.value }))}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      form.color === opt.value ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: opt.value }}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">
              Batal
            </Button>
            <Button
              onClick={handleSaveProgram}
              disabled={!form.title || !form.description}
              className="bg-[#5C1515] hover:bg-[#3d0e0e]"
            >
              {editingProgram ? "Simpan Perubahan" : "Tambah Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Program?</AlertDialogTitle>
            <AlertDialogDescription>
              Program ini akan dihapus dari landing page. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
