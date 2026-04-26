"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "admin" && user.role !== "editor"))) {
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

  if (!user || (user.role !== "admin" && user.role !== "editor")) {
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
