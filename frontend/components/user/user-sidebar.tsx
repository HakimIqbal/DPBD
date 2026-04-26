"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  History,
  FileText,
  User,
  Settings,
  ChevronLeft,
  Building2,
  Users,
  Award,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { DonationModal } from "@/components/donation-modal"
import { Badge } from "@/components/ui/badge"

const personalMenuItems = [
  { label: "Beranda", href: "/user", icon: LayoutDashboard },
  { label: "Program", href: "/user/programs", icon: FolderKanban },
  { label: "Riwayat Donasi", href: "/user/history", icon: History },
  { label: "Laporan & Dokumen", href: "/user/reports", icon: FileText },
  { label: "Profil", href: "/user/profile", icon: User },
  { label: "Pengaturan", href: "/user/settings", icon: Settings },
]

const companyMenuItems = [
  { label: "Dashboard CSR", href: "/user", icon: LayoutDashboard },
  { label: "Program", href: "/user/programs", icon: FolderKanban },
  { label: "Riwayat Kontribusi", href: "/user/history", icon: History },
  { label: "Employee Giving", href: "/user/employee-giving", icon: Users },
  { label: "Laporan CSR", href: "/user/reports", icon: FileText },
  { label: "Sertifikat & Penghargaan", href: "/user/certificates", icon: Award },
  { label: "Profil Perusahaan", href: "/user/profile", icon: Building2 },
  { label: "Pengaturan", href: "/user/settings", icon: Settings },
]

export function UserSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [donationOpen, setDonationOpen] = useState(false)

  const isCompany = user?.role === "company"
  const menuItems = isCompany ? companyMenuItems : personalMenuItems

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r flex flex-col transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="h-16 border-b flex items-center justify-between px-4">
          <Link href="/user" className="flex items-center gap-2">
            <Image src="/logo-dpbd.png" alt="DPBD Logo" width={32} height={32} className="rounded-lg flex-shrink-0" />
            {!collapsed && <span className="font-bold text-lg">DPBD</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", collapsed && "absolute -right-4 bg-card border shadow-sm")}
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* User Info - Different display for Personal vs Company */}
        {!collapsed && (
          <div className="p-4 border-b">
            {isCompany ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-[#D4C896]" />
                  <p className="font-medium text-sm truncate">{user?.companyName || user?.name}</p>
                </div>
                <Badge className="bg-[#D4C896]/20 text-[#5C1515] border border-[#D4C896] text-xs">
                  Corporate Partner
                </Badge>
              </>
            ) : (
              <>
                <p className="font-medium text-sm truncate">{user?.name || "Donatur"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/user" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t">
            <Button
              className="w-full bg-[#D4C896] hover:bg-[#D4C896]/90 text-[#0A0A0A]"
              onClick={() => setDonationOpen(true)}
            >
              {isCompany ? "Donasi CSR" : "Donasi Sekarang"}
            </Button>
          </div>
        )}


      </aside>

      <DonationModal open={donationOpen} onOpenChange={setDonationOpen} />
    </>
  )
}
