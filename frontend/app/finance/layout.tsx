"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { FinanceHeader } from "@/components/finance/finance-header"
import { Loader2 } from "lucide-react"

export default function FinanceLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "finance" && user.role !== "admin"))) {
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

  if (!user || (user.role !== "finance" && user.role !== "admin")) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <FinanceSidebar />
      <div className="pl-64">
        <FinanceHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
