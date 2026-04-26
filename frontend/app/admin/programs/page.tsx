"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  GraduationCap,
  Briefcase,
  HeartPulse,
  Building,
  Leaf,
  AlertTriangle,
  MoreVertical,
  Pencil,
  Trash2,
  FolderKanban,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const categoryIcons: Record<string, React.ElementType> = {
  education: GraduationCap,
  umkm: Briefcase,
  health: HeartPulse,
  infrastructure: Building,
  environment: Leaf,
  emergency: AlertTriangle,
}

const categoryLabels: Record<string, string> = {
  education: "Pendidikan",
  umkm: "UMKM",
  health: "Kesehatan",
  infrastructure: "Infrastruktur",
  environment: "Lingkungan",
  emergency: "Bantuan Darurat",
}

const categoryColors: Record<string, string> = {
  education: "bg-blue-500/10 text-blue-600",
  umkm: "bg-emerald-500/10 text-emerald-600",
  health: "bg-rose-500/10 text-rose-600",
  infrastructure: "bg-amber-500/10 text-amber-600",
  environment: "bg-green-500/10 text-green-600",
  emergency: "bg-orange-500/10 text-orange-600",
}

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)

const DEFAULT_PROGRAMS: any[] = []

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>(DEFAULT_PROGRAMS)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    program: any | null
  }>({ open: false, program: null })

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:3001/api/programs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch programs")
        }

        const data = await response.json()
        setPrograms(Array.isArray(data) ? data : data.data || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching programs:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch programs")
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const filteredPrograms = programs.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (statusFilter !== "all" && p.status !== statusFilter) return false
    return true
  })

  const handleCreate = () => {
    if (!newName || !newCategory) return
    const newProgram = {
      id: programs.length + 1,
      name: newName,
      slug: newName.toLowerCase().replace(/\s+/g, "-"),
      category: newCategory,
      description: newDescription,
      status: "active" as const,
      disbursementCount: 0,
      totalDisbursed: 0,
    }
    setPrograms((prev) => [...prev, newProgram])
    setNewName("")
    setNewCategory("")
    setNewDescription("")
    setIsCreateOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirm.program) {
      setPrograms((prev) => prev.filter((p) => p.id !== deleteConfirm.program!.id))
      setDeleteConfirm({ open: false, program: null })
    }
  }

  const toggleStatus = (id: number) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "draft" : "active" } : p))
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data program...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategori Distribusi Dana</h1>
          <p className="text-muted-foreground">
            Kelola kategori program sebagai label distribusi dari dana general
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Kategori Distribusi</DialogTitle>
              <DialogDescription>
                Kategori ini digunakan sebagai label saat Finance mengajukan penyaluran dana.
                Tidak ada target dana — semua dana masuk ke pot general.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Kategori</Label>
                <Input
                  placeholder="Contoh: Beasiswa Pelajar Indonesia"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kategori</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Pendidikan</SelectItem>
                    <SelectItem value="umkm">UMKM</SelectItem>
                    <SelectItem value="health">Kesehatan</SelectItem>
                    <SelectItem value="infrastructure">Infrastruktur</SelectItem>
                    <SelectItem value="environment">Lingkungan</SelectItem>
                    <SelectItem value="emergency">Bantuan Darurat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  placeholder="Jelaskan tujuan distribusi kategori ini..."
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreate} disabled={!newName || !newCategory}>
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
        <strong>Catatan:</strong> Semua donasi masuk ke satu dana general (tidak terbagi per program).
        Kategori di sini hanya berfungsi sebagai <strong>label</strong> saat Finance mengajukan penyaluran dana — bukan sebagai rekening terpisah.
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari kategori..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((program) => {
          const Icon = categoryIcons[program.category] || FolderKanban
          const colorClass = categoryColors[program.category] || "bg-gray-100 text-gray-600"

          return (
            <Card key={program.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{program.name}</p>
                      <p className="text-xs text-muted-foreground">{categoryLabels[program.category]}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(program.id)}>
                        {program.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteConfirm({ open: true, program })}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold">{program.disbursementCount}</p>
                    <p className="text-xs text-muted-foreground">Penyaluran</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{formatRupiah(program.totalDisbursed)}</p>
                    <p className="text-xs text-muted-foreground">Total Disalurkan</p>
                  </div>
                  <Badge
                    className={
                      program.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 border-0"
                        : "bg-gray-100 text-gray-500 border-0"
                    }
                  >
                    {program.status === "active" ? "Aktif" : "Draft"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, program: open ? deleteConfirm.program : null })}
        title="Hapus Kategori?"
        description={`Apakah Anda yakin ingin menghapus kategori "${deleteConfirm.program?.name}"? Riwayat penyaluran yang menggunakan kategori ini tidak akan terhapus.`}
        confirmText="Ya, Hapus"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
