"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserSidebar } from "@/components/user/user-sidebar"
import { UserHeader } from "@/components/user/user-header"
import { Loader2 } from "lucide-react"

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <UserSidebar />
      <div className="pl-64">
        <UserHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
