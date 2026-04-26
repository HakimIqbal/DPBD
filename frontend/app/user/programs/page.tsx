"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search, GraduationCap, Briefcase, HeartPulse, Building, Leaf, AlertTriangle, Heart } from "lucide-react"
import type React from "react"

const programIcons: Record<string, React.ElementType> = {
  education: GraduationCap,
  umkm: Briefcase,
  health: HeartPulse,
  infrastructure: Building,
  environment: Leaf,
  emergency: AlertTriangle,
}

const programs = [
  {
    id: 1,
    name: "Beasiswa Pelajar Indonesia",
    slug: "beasiswa-pelajar",
    category: "education",
    description: "Program beasiswa untuk pelajar Indonesia yang berprestasi di luar negeri",
    target: 100000000,
    collected: 78500000,
    status: "active",
    contributed: true,
    myContribution: 500000,
  },
  {
    id: 2,
    name: "UMKM Diaspora",
    slug: "umkm-diaspora",
    category: "umkm",
    description: "Pemberdayaan usaha mikro kecil menengah diaspora Indonesia",
    target: 75000000,
    collected: 45200000,
    status: "active",
    contributed: false,
    myContribution: 0,
  },
  {
    id: 3,
    name: "Kesehatan Masyarakat",
    slug: "kesehatan-masyarakat",
    category: "health",
    description: "Program kesehatan untuk masyarakat kurang mampu",
    target: 50000000,
    collected: 50000000,
    status: "completed",
    contributed: true,
    myContribution: 200000,
  },
  {
    id: 4,
    name: "Bantuan Darurat Gaza",
    slug: "bantuan-darurat-gaza",
    category: "emergency",
    description: "Bantuan kemanusiaan untuk korban konflik di Gaza",
    target: 200000000,
    collected: 156800000,
    status: "active",
    contributed: true,
    myContribution: 1000000,
  },
  {
    id: 5,
    name: "Infrastruktur Pendidikan",
    slug: "infrastruktur-pendidikan",
    category: "infrastructure",
    description: "Pembangunan dan renovasi fasilitas pendidikan",
    target: 150000000,
    collected: 23400000,
    status: "active",
    contributed: false,
    myContribution: 0,
  },
  {
    id: 6,
    name: "Lingkungan Hijau",
    slug: "lingkungan-hijau",
    category: "environment",
    description: "Program pelestarian lingkungan dan penghijauan",
    target: 80000000,
    collected: 35600000,
    status: "active",
    contributed: false,
    myContribution: 0,
  },
]

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

export default function UserProgramsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [contributedFilter, setContributedFilter] = useState("all")

  const filteredPrograms = programs.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false
    if (contributedFilter === "contributed" && !p.contributed) return false
    if (contributedFilter === "not-contributed" && p.contributed) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Program</h1>
        <p className="text-muted-foreground">Jelajahi program donasi yang tersedia</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Cari program..." className="pl-10" />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="education">Pendidikan</SelectItem>
                <SelectItem value="umkm">UMKM</SelectItem>
                <SelectItem value="health">Kesehatan</SelectItem>
                <SelectItem value="infrastructure">Infrastruktur</SelectItem>
                <SelectItem value="environment">Lingkungan</SelectItem>
                <SelectItem value="emergency">Darurat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contributedFilter} onValueChange={setContributedFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="contributed">Sudah Donasi</SelectItem>
                <SelectItem value="not-contributed">Belum Donasi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((program) => {
          const Icon = programIcons[program.category] || GraduationCap
          const progress = Math.round((program.collected / program.target) * 100)

          return (
            <Card key={program.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    {program.contributed && (
                      <Badge className="bg-success/10 text-success hover:bg-success/20">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Didukung
                      </Badge>
                    )}
                    {program.status === "completed" && (
                      <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Selesai</Badge>
                    )}
                  </div>
                </div>

                <h3 className="font-bold mb-1">{program.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{program.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Terkumpul</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatRupiah(program.collected)}</span>
                    <span>dari {formatRupiah(program.target)}</span>
                  </div>
                </div>

                {program.contributed && (
                  <div className="p-3 bg-success/5 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground">Kontribusi Anda</p>
                    <p className="font-bold text-success">{formatRupiah(program.myContribution)}</p>
                  </div>
                )}

                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={program.status === "completed"}
                >
                  <Link href={`/donate?program=${program.slug}`}>
                    {program.status === "completed" ? "Target Tercapai" : "Donasi Sekarang"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
