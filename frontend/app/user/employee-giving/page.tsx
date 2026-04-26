"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Users, TrendingUp, Heart, Search, Download, Mail, UserPlus } from "lucide-react"
import { redirect } from "next/navigation"

const employeeStats = [
  { label: "Total Karyawan", value: "200", icon: Users, color: "bg-primary/10 text-primary" },
  { label: "Karyawan Berpartisipasi", value: "156", icon: Heart, color: "bg-[#6B6B4B]/10 text-[#6B6B4B]" },
  { label: "Tingkat Partisipasi", value: "78%", icon: TrendingUp, color: "bg-[#D4C896]/20 text-[#5C1515]" },
]

const topDonors = [
  { name: "Ahmad Fauzi", department: "Engineering", total: 2500000, donations: 12 },
  { name: "Siti Rahayu", department: "Marketing", total: 2000000, donations: 10 },
  { name: "Budi Santoso", department: "Finance", total: 1800000, donations: 9 },
  { name: "Dewi Lestari", department: "HR", total: 1500000, donations: 8 },
  { name: "Eko Prasetyo", department: "Operations", total: 1200000, donations: 6 },
]

const departments = [
  { name: "Engineering", employees: 50, participating: 45, total: 15000000 },
  { name: "Marketing", employees: 35, participating: 30, total: 10000000 },
  { name: "Finance", employees: 25, participating: 22, total: 8000000 },
  { name: "HR", employees: 20, participating: 18, total: 6000000 },
  { name: "Operations", employees: 40, participating: 25, total: 7500000 },
  { name: "Sales", employees: 30, participating: 16, total: 5000000 },
]

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

export default function EmployeeGivingPage() {
  const { user } = useAuth()

  // Only company users can access this page
  if (user?.role !== "company") {
    redirect("/user")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employee Giving Program</h1>
          <p className="text-muted-foreground">Kelola program donasi karyawan perusahaan Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Kirim Undangan
          </Button>
          <Button className="bg-[#D4C896] hover:bg-[#D4C896]/90 text-[#0A0A0A]">
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employeeStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Target */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Target Donasi Bulanan</CardTitle>
          <CardDescription>Januari 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="font-semibold">Rp 12.500.000 / Rp 15.000.000</span>
            </div>
            <Progress value={83} className="h-3" />
            <p className="text-sm text-muted-foreground">83% dari target tercapai. Sisa 5 hari lagi.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Donatur Karyawan</CardTitle>
            <CardDescription>Berdasarkan total donasi</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {topDonors.map((donor, idx) => (
                <div key={donor.name} className="p-4 flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0
                        ? "bg-[#D4C896] text-[#0A0A0A]"
                        : idx === 1
                          ? "bg-gray-300 text-gray-700"
                          : idx === 2
                            ? "bg-amber-600 text-white"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{donor.name}</p>
                    <p className="text-xs text-muted-foreground">{donor.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatRupiah(donor.total)}</p>
                    <p className="text-xs text-muted-foreground">{donor.donations} donasi</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partisipasi per Departemen</CardTitle>
            <CardDescription>Tingkat partisipasi karyawan</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {departments.map((dept) => {
                const participation = Math.round((dept.participating / dept.employees) * 100)
                return (
                  <div key={dept.name} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dept.participating} dari {dept.employees} karyawan
                        </p>
                      </div>
                      <Badge variant="outline">{participation}%</Badge>
                    </div>
                    <Progress value={participation} className="h-1.5" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Daftar Karyawan</CardTitle>
            <CardDescription>Kelola partisipasi karyawan</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari karyawan..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Nama</th>
                  <th className="text-left p-3 text-sm font-medium">Departemen</th>
                  <th className="text-left p-3 text-sm font-medium">Email</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-right p-3 text-sm font-medium">Total Donasi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  {
                    name: "Ahmad Fauzi",
                    dept: "Engineering",
                    email: "ahmad@company.com",
                    status: "active",
                    total: 2500000,
                  },
                  {
                    name: "Siti Rahayu",
                    dept: "Marketing",
                    email: "siti@company.com",
                    status: "active",
                    total: 2000000,
                  },
                  {
                    name: "Budi Santoso",
                    dept: "Finance",
                    email: "budi@company.com",
                    status: "active",
                    total: 1800000,
                  },
                  { name: "Dewi Lestari", dept: "HR", email: "dewi@company.com", status: "active", total: 1500000 },
                  { name: "Rina Kartika", dept: "Sales", email: "rina@company.com", status: "invited", total: 0 },
                ].map((employee) => (
                  <tr key={employee.email} className="hover:bg-muted/30">
                    <td className="p-3 text-sm font-medium">{employee.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{employee.dept}</td>
                    <td className="p-3 text-sm text-muted-foreground">{employee.email}</td>
                    <td className="p-3">
                      <Badge
                        className={
                          employee.status === "active"
                            ? "bg-[#6B6B4B]/10 text-[#6B6B4B]"
                            : "bg-[#D4C896]/20 text-[#5C1515]"
                        }
                      >
                        {employee.status === "active" ? "Aktif" : "Diundang"}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-right font-medium">{formatRupiah(employee.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
