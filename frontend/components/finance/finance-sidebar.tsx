"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, DollarSign, CheckCircle, Upload, FileText, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const menuItems = [
  { label: "Overview", href: "/finance", icon: LayoutDashboard },
  { label: "Pending Disbursements", href: "/finance/pending", icon: DollarSign },
  { label: "Process Transfer", href: "/finance/process", icon: Upload },
  { label: "Completed", href: "/finance/completed", icon: CheckCircle },
  { label: "Reconciliation", href: "/finance/reconciliation", icon: FileText },
]

export function FinanceSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#6B6B4B] text-white border-r border-[#6B6B4B]/20 flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4">
        <Link href="/finance" className="flex items-center gap-2">
          <Image src="/logo-dpbd.png" alt="DPBD Logo" width={32} height={32} className="rounded-lg flex-shrink-0" />
          {!collapsed && <span className="font-bold text-lg">DPBD Finance</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-white hover:bg-white/10",
            collapsed && "absolute -right-4 bg-[#6B6B4B] border shadow-sm",
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/finance" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
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


    </aside>
  )
}
