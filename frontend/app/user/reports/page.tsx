"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { Download, FileText, Calendar, Building2, Filter, PieChart } from "lucide-react"
import { useState } from "react"

const personalReports = [
  { id: 1, name: "Rekap Donasi Januari 2025", period: "Januari 2025", type: "monthly", size: "124 KB" },
  { id: 2, name: "Rekap Donasi Tahunan 2024", period: "Tahun 2024", type: "yearly", size: "256 KB" },
  { id: 3, name: "Rekap Donasi Tahunan 2023", period: "Tahun 2023", type: "yearly", size: "198 KB" },
  { id: 4, name: "Sertifikat Donatur 2024", period: "2024", type: "certificate", size: "89 KB" },
  { id: 5, name: "Bukti Potong Pajak 2024", period: "2024", type: "tax", size: "156 KB" },
]

const companyReports = [
  { id: 1, name: "Laporan CSR Q4 2024", period: "Q4 2024", type: "quarterly", size: "1.2 MB" },
  { id: 2, name: "Laporan CSR Q3 2024", period: "Q3 2024", type: "quarterly", size: "980 KB" },
  { id: 3, name: "Laporan CSR Tahunan 2024", period: "Tahun 2024", type: "yearly", size: "2.5 MB" },
  { id: 4, name: "Laporan CSR Tahunan 2023", period: "Tahun 2023", type: "yearly", size: "2.1 MB" },
  { id: 5, name: "Laporan Employee Giving 2024", period: "Tahun 2024", type: "employee", size: "1.5 MB" },
  { id: 6, name: "Sertifikat Corporate Donor 2024", period: "2024", type: "certificate", size: "156 KB" },
  { id: 7, name: "Laporan Dampak Sosial 2024", period: "Tahun 2024", type: "impact", size: "3.2 MB" },
  { id: 8, name: "Bukti Potong Pajak CSR 2024", period: "2024", type: "tax", size: "256 KB" },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "certificate":
      return FileText
    case "quarterly":
    case "monthly":
      return Calendar
    case "impact":
      return PieChart
    default:
      return Calendar
  }
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "yearly":
      return { label: "Tahunan", class: "bg-primary/10 text-primary" }
    case "quarterly":
      return { label: "Quarterly", class: "bg-[#6B6B4B]/10 text-[#6B6B4B]" }
    case "monthly":
      return { label: "Bulanan", class: "bg-[#D4C896]/20 text-[#5C1515]" }
    case "certificate":
      return { label: "Sertifikat", class: "bg-[#D4C896]/20 text-[#5C1515]" }
    case "tax":
      return { label: "Pajak", class: "bg-[#B30000]/10 text-[#B30000]" }
    case "employee":
      return { label: "Employee", class: "bg-[#6B6B4B]/10 text-[#6B6B4B]" }
    case "impact":
      return { label: "Impact", class: "bg-primary/10 text-primary" }
    default:
      return { label: type, class: "bg-muted text-muted-foreground" }
  }
}

export default function ReportsPage() {
  const { user } = useAuth()
  const isCompany = user?.role === "company"
  const [yearFilter, setYearFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const displayReports = isCompany ? companyReports : personalReports

  const filteredReports = displayReports.filter((report) => {
    if (yearFilter !== "all" && !report.period.includes(yearFilter)) return false
    if (typeFilter !== "all" && report.type !== typeFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">{isCompany ? "Laporan CSR" : "Laporan & Dokumen"}</h1>
        <p className="text-muted-foreground">
          {isCompany
            ? "Download laporan CSR dan dokumen pendukung perusahaan"
            : "Download rekap donasi dan dokumen pendukung"}
        </p>
      </div>

      {/* Company Info Card */}
      {isCompany && (
        <Card className="border-[#D4C896]/50 bg-[#D4C896]/5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#D4C896]/20">
              <Building2 className="w-6 h-6 text-[#5C1515]" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Akun Corporate Donor</p>
              <p className="text-sm text-muted-foreground">
                Laporan CSR dilengkapi dengan branding perusahaan dan detail dampak sosial
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Building2 className="w-4 h-4 mr-2" />
              Atur Branding
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {isCompany ? (
                  <>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="employee">Employee Giving</SelectItem>
                    <SelectItem value="impact">Dampak Sosial</SelectItem>
                    <SelectItem value="certificate">Sertifikat</SelectItem>
                    <SelectItem value="tax">Pajak</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="certificate">Sertifikat</SelectItem>
                    <SelectItem value="tax">Pajak</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dokumen Tersedia</CardTitle>
          <CardDescription>{filteredReports.length} dokumen ditemukan</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredReports.map((report) => {
              const TypeIcon = getTypeIcon(report.type)
              const typeBadge = getTypeBadge(report.type)
              return (
                <div key={report.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TypeIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.period}</p>
                  </div>
                  <Badge className={typeBadge.class}>{typeBadge.label}</Badge>
                  <Badge variant="outline" className="font-normal">
                    {report.size}
                  </Badge>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Generate Custom Report - Company Only */}
      {isCompany && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate Laporan Kustom</CardTitle>
            <CardDescription>Buat laporan dengan periode dan format sesuai kebutuhan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select defaultValue="csr">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipe Laporan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csr">Laporan CSR</SelectItem>
                  <SelectItem value="employee">Employee Giving</SelectItem>
                  <SelectItem value="impact">Dampak Sosial</SelectItem>
                  <SelectItem value="donation">Riwayat Donasi</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="q4-2024">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1-2025">Q1 2025</SelectItem>
                  <SelectItem value="q4-2024">Q4 2024</SelectItem>
                  <SelectItem value="2024">Tahun 2024</SelectItem>
                  <SelectItem value="custom">Kustom...</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="pdf">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-[#D4C896] hover:bg-[#D4C896]/90 text-[#0A0A0A]">Generate Laporan</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Custom Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Butuh Laporan Khusus?</CardTitle>
          <CardDescription>Hubungi kami untuk permintaan laporan dengan periode atau format tertentu</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Hubungi Admin</Button>
        </CardContent>
      </Card>
    </div>
  )
}
