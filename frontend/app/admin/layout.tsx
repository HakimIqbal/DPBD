"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Loader2 } from "lucide-react"
import type { UserRole } from "@/lib/permissions"

/**
 * Roles that can reach any page inside /admin/*. Each individual page still
 * gates itself with PermissionGate to hide content the role lacks rights to,
 * but this list is the entry-door allowlist for the admin shell.
 *
 * Donor roles (`personal`, `company`) belong on /user and are redirected
 * away. `finance` has its own /finance shell and stays there.
 */
const ADMIN_AREA_ROLES: UserRole[] = [
  "admin",
  "editor",
  "ceo",
  "cfo",
  "investment_manager",
  "risk_manager",
  "ethic_committee",
  "audit_independent",
  "dewan_pengawas",
  "dewan_pembina",
  "partnership_onboarding",
]

const DONOR_ROLES: UserRole[] = ["personal", "company"]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (DONOR_ROLES.includes(user.role)) {
      router.push("/user")
      return
    }

    if (!ADMIN_AREA_ROLES.includes(user.role)) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !ADMIN_AREA_ROLES.includes(user.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
