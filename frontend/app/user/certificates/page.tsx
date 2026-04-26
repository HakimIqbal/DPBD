"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Award, Download, Calendar, Trophy, Star, Medal } from "lucide-react"
import { redirect } from "next/navigation"

const certificates = [
  {
    id: 1,
    title: "Corporate Partner Gold 2024",
    description: "Penghargaan atas kontribusi CSR melebihi Rp 100 juta",
    date: "Desember 2024",
    type: "gold",
    icon: Trophy,
  },
  {
    id: 2,
    title: "Top 10 Corporate Donor",
    description: "Masuk dalam 10 besar donatur korporat tahun 2024",
    date: "Desember 2024",
    type: "achievement",
    icon: Star,
  },
  {
    id: 3,
    title: "Sertifikat Donatur CSR",
    description: "Sertifikat resmi kontribusi CSR tahun 2024",
    date: "Januari 2025",
    type: "certificate",
    icon: Award,
  },
  {
    id: 4,
    title: "Employee Giving Champion",
    description: "Penghargaan program employee giving terbaik",
    date: "November 2024",
    type: "achievement",
    icon: Medal,
  },
]

const achievements = [
  { title: "100+ Juta Kontribusi", unlocked: true, description: "Total kontribusi melebihi Rp 100 juta" },
  { title: "5+ Program Didukung", unlocked: true, description: "Mendukung lebih dari 5 program" },
  { title: "Employee Giving 80%", unlocked: false, description: "Partisipasi karyawan mencapai 80%" },
  { title: "1 Tahun Partnership", unlocked: true, description: "Bermitra selama 1 tahun" },
]

export default function CertificatesPage() {
  const { user } = useAuth()

  // Only company users can access this page
  if (user?.role !== "company") {
    redirect("/user")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Sertifikat & Penghargaan</h1>
        <p className="text-muted-foreground">Koleksi penghargaan dan sertifikat perusahaan Anda</p>
      </div>

      {/* Achievement Summary */}
      <Card className="bg-gradient-to-r from-[#5C1515] to-[#B30000] text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Corporate Partner Gold</h2>
              <p className="text-white/80 text-sm">Status keanggotaan Anda saat ini</p>
            </div>
            <div className="p-4 bg-[#D4C896] rounded-full">
              <Trophy className="w-8 h-8 text-[#5C1515]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-white/80">Sertifikat</p>
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-white/80">Penghargaan</p>
            </div>
            <div>
              <p className="text-2xl font-bold">75%</p>
              <p className="text-sm text-white/80">Achievement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Sertifikat & Penghargaan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      cert.type === "gold"
                        ? "bg-[#D4C896]/20"
                        : cert.type === "achievement"
                          ? "bg-[#6B6B4B]/10"
                          : "bg-primary/10"
                    }`}
                  >
                    <cert.icon
                      className={`w-6 h-6 ${
                        cert.type === "gold"
                          ? "text-[#D4C896]"
                          : cert.type === "achievement"
                            ? "text-[#6B6B4B]"
                            : "text-primary"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold">{cert.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {cert.date}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Achievement Progress</CardTitle>
          <CardDescription>Raih pencapaian untuk mendapatkan penghargaan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.title}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked ? "bg-[#6B6B4B]/5 border-[#6B6B4B]/20" : "bg-muted/30 border-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${achievement.unlocked ? "bg-[#6B6B4B]/20" : "bg-muted"}`}>
                    {achievement.unlocked ? (
                      <Star className="w-5 h-5 text-[#6B6B4B]" />
                    ) : (
                      <Star className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${!achievement.unlocked && "text-muted-foreground"}`}>
                      {achievement.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && <Badge className="ml-auto bg-[#6B6B4B]/10 text-[#6B6B4B]">Tercapai</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
