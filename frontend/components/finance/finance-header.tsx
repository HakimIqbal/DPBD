"use client"

import { Bell, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

export function FinanceHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">Finance Dashboard</h2>
        <p className="text-sm text-muted-foreground">Kelola pencairan dan rekonsiliasi dana</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Finance Officer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/finance/profile" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Edit Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/finance/settings" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
