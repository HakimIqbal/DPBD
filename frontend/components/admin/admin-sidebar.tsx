"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  FolderKanban,
  Users,
  Building2,
  CreditCard,
  FileBarChart,
  Settings,
  ChevronLeft,
  Briefcase,
  ShieldAlert,
  History,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, type ReactNode } from "react"
import { PermissionGate } from "@/components/ui/permission-gate"
import { RoleGate } from "@/components/ui/role-gate"
import { Permission, type UserRole } from "@/lib/permissions"

type MenuItem = {
  label: string
  href: string
  icon: LucideIcon
  /** Permission required to see this item. */
  permission?: Permission
  /** Roles allowed to see this item. Used when permission-mapping is too coarse. */
  roles?: UserRole[]
}

/**
 * Sidebar item gating rules. Items WITHOUT `permission` or `roles` are always
 * visible. Items WITH a gate are wrapped in PermissionGate / RoleGate and do
 * not render at all when the user lacks access (no greyed-out variants —
 * unauthorized items are hidden entirely per requirement).
 */
const menuItems: MenuItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Donasi Masuk", href: "/admin/donations", icon: ArrowDownToLine, permission: Permission.READ_DONATIONS },
  { label: "Penyaluran Dana", href: "/admin/disbursements", icon: ArrowUpFromLine, permission: Permission.APPROVE_DISBURSEMENT },
  { label: "Program & Campaign", href: "/admin/programs", icon: FolderKanban, permission: Permission.MANAGE_PROGRAMS },
  { label: "User & Peran", href: "/admin/users", icon: Users, permission: Permission.MANAGE_USERS },
  { label: "Manajemen Perusahaan", href: "/admin/companies", icon: Building2, permission: Permission.MANAGE_PARTNERS },
  { label: "Midtrans & Rekonsiliasi", href: "/admin/midtrans", icon: CreditCard, roles: ["admin", "finance", "cfo", "ceo"] },
  { label: "Laporan", href: "/admin/reports", icon: FileBarChart, permission: Permission.READ_REPORTS },
  { label: "Portfolio Investasi", href: "/admin/portfolio", icon: Briefcase, permission: Permission.READ_PORTFOLIO },
  { label: "Risk & Compliance", href: "/admin/risk", icon: ShieldAlert, permission: Permission.READ_RISK },
  { label: "Audit Trail", href: "/admin/audit", icon: History, permission: Permission.READ_AUDIT_TRAIL },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings, roles: ["admin", "ceo"] },
]

/**
 * Wraps an already-built link node in the appropriate gate based on the
 * item's metadata. Items with no gate are returned as-is (always visible).
 */
function gateItem(item: MenuItem, link: ReactNode): ReactNode {
  if (item.permission) {
    return (
      <PermissionGate key={item.href} require={item.permission}>
        {link}
      </PermissionGate>
    )
  }
  if (item.roles) {
    return (
      <RoleGate key={item.href} roles={item.roles}>
        {link}
      </RoleGate>
    )
  }
  return link
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="h-16 border-b flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo-dpbd.png" alt="DPBD Logo" width={32} height={32} className="rounded-lg flex-shrink-0" />
          {!collapsed && <span className="font-bold text-lg">DPBD Admin</span>}
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

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          const link = (
            <Link
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
          return gateItem(item, link)
        })}
      </nav>
    </aside>
  )
}
