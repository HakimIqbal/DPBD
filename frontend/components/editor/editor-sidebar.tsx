"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, MessageSquareQuote, ChevronLeft, Users, HelpCircle, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
  { label: "Overview", href: "/editor", icon: LayoutDashboard },
  { label: "Program Section", href: "/editor/programs", icon: FolderKanban },
  { label: "Testimoni", href: "/editor/feedback", icon: MessageSquareQuote },
  { label: "Berita & Update", href: "/editor/news", icon: Newspaper },
  { label: "Mitra & Partner", href: "/editor/partners", icon: Users },
  { label: "FAQ", href: "/editor/faq", icon: HelpCircle },
]

export function EditorSidebar() {
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
        <Link href="/editor" className="flex items-center gap-2">
          <Image src="/logo-dpbd.png" alt="DPBD Logo" width={32} height={32} className="rounded-lg flex-shrink-0" />
          {!collapsed && <span className="font-bold text-lg">DPBD Editor</span>}
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
          const isActive = pathname === item.href || (item.href !== "/editor" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-highlight text-highlight-foreground"
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


    </aside>
  )
}
