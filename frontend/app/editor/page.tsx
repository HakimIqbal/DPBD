"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageIcon, FolderKanban, Heart, FileText, Clock, AlertCircle, CheckCircle, ArrowRight, Sparkles, Eye, Newspaper, Users, HelpCircle } from "lucide-react"
import Link from "next/link"

const sectionStatus = [
  { name: "Hero & Banner", href: "/editor/hero", icon: ImageIcon, status: "updated", lastUpdate: "2 jam lalu", desc: "Banner utama landing page" },
  { name: "Program Section", href: "/editor/programs", icon: FolderKanban, status: "updated", lastUpdate: "1 hari lalu", desc: "Daftar program donasi" },
  { name: "Transparansi", href: "/editor/transparency", icon: FileText, status: "updated", lastUpdate: "3 hari lalu", desc: "Data laporan keuangan" },
  { name: "Dampak & Testimoni", href: "/editor/impact", icon: Heart, status: "needs-update", lastUpdate: "1 minggu lalu", desc: "Cerita dampak & testimoni" },
  { name: "Berita & Update", href: "/editor/news", icon: Newspaper, status: "updated", lastUpdate: "5 jam lalu", desc: "Kelola artikel berita" },
  { name: "Mitra & Partner", href: "/editor/partners", icon: Users, status: "updated", lastUpdate: "2 hari lalu", desc: "Logo & info mitra" },
  { name: "FAQ", href: "/editor/faq", icon: HelpCircle, status: "updated", lastUpdate: "4 hari lalu", desc: "Pertanyaan umum" },
]

const recentChanges = [
  { time: "14:30", action: "Mengubah judul Hero Section", section: "Hero & Banner", user: "Editor DPBD" },
  { time: "12:15", action: "Menambahkan 2 testimoni baru", section: "Dampak & Testimoni", user: "Editor DPBD" },
  { time: "Kemarin", action: "Memperbarui deskripsi transparansi", section: "Transparansi", user: "Editor DPBD" },
  { time: "2 hari lalu", action: "Mengubah urutan program di landing", section: "Program Section", user: "Editor DPBD" },
]

export default function EditorOverviewPage() {
  const updatedCount = sectionStatus.filter((s) => s.status === "updated").length
  const needsUpdateCount = sectionStatus.filter((s) => s.status === "needs-update").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#D4C896]" />
            Dashboard Editor
          </h1>
          <p className="text-muted-foreground">Kelola konten dinamis yang tampil di website publik</p>
        </div>
        <Button asChild variant="outline" className="bg-transparent">
          <Link href="/" target="_blank">
            <Eye className="w-4 h-4 mr-2" />
            Preview Website
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-200/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{updatedCount}</p>
              <p className="text-sm text-muted-foreground">Section Terbarui</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-200/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{needsUpdateCount}</p>
              <p className="text-sm text-muted-foreground">Perlu Diperbarui</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sectionStatus.length}</p>
              <p className="text-sm text-muted-foreground">Total Section</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Section yang Dapat Dikelola</CardTitle>
          <CardDescription>Klik untuk mengedit konten dinamis di website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionStatus.map((section) => (
              <Link
                key={section.name}
                href={section.href}
                className="group flex flex-col p-4 rounded-xl border hover:border-primary/30 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge
                    className={
                      section.status === "updated"
                        ? "bg-emerald-500/10 text-emerald-600 border-0"
                        : "bg-amber-500/10 text-amber-600 border-0"
                    }
                  >
                    {section.status === "updated" ? "OK" : "Update"}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{section.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {section.lastUpdate}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Changes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Perubahan Terakhir</CardTitle>
            <CardDescription>Log aktivitas editing konten</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentChanges.map((change, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-16 text-sm text-muted-foreground">{change.time}</div>
                <div className="w-2 h-2 mt-2 rounded-full bg-highlight flex-shrink-0" />
                <div>
                  <p className="text-sm">{change.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {change.section} • {change.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
