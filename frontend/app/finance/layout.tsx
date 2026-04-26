import type React from "react"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { FinanceHeader } from "@/components/finance/finance-header"

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
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
